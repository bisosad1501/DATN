package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/bisosad1501/ielts-platform/notification-service/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AuthMiddleware struct {
	jwtSecret string
}

func NewAuthMiddleware(jwtSecret string) *AuthMiddleware {
	return &AuthMiddleware{
		jwtSecret: jwtSecret,
	}
}

// Claims represents JWT claims structure
type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

// Authenticate validates JWT token and extracts user info
func (m *AuthMiddleware) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Authorization header is required",
				Code:    "AUTH_001",
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid authorization header format. Use: Bearer <token>",
				Code:    "AUTH_002",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Parse and validate token
		token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
			// Verify signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(m.jwtSecret), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid or expired token: " + err.Error(),
				Code:    "AUTH_003",
			})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(*Claims)
		if !ok || !token.Valid {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid token claims",
				Code:    "AUTH_004",
			})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// RequireRole checks if user has required role
func (m *AuthMiddleware) RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "User role not found in context",
				Code:    "AUTH_005",
			})
			c.Abort()
			return
		}

		role := userRole.(string)

		// Check if user's role is in allowed roles
		allowed := false
		for _, allowedRole := range roles {
			if role == allowedRole {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Error:   "forbidden",
				Message: fmt.Sprintf("Access denied. Required role: %v. Your role: %s", roles, role),
				Code:    "AUTH_006",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

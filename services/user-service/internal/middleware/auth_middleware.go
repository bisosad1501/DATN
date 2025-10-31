package middleware

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/bisosad1501/DATN/services/user-service/internal/config"
	"github.com/bisosad1501/DATN/services/user-service/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthMiddleware struct {
	jwtSecret      string
	internalAPIKey string
}

func NewAuthMiddleware(cfg *config.Config) *AuthMiddleware {
	return &AuthMiddleware{
		jwtSecret:      cfg.JWTSecret,
		internalAPIKey: cfg.InternalAPIKey,
	}
}

// AuthRequired validates JWT token and extracts user info
func (m *AuthMiddleware) AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.Response{
				Success: false,
				Error: &models.ErrorInfo{
					Code:    "NO_TOKEN",
					Message: "Authorization header required",
				},
			})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			c.JSON(http.StatusUnauthorized, models.Response{
				Success: false,
				Error: &models.ErrorInfo{
					Code:    "INVALID_TOKEN_FORMAT",
					Message: "Authorization header must be Bearer token",
				},
			})
			c.Abort()
			return
		}

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(m.jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, models.Response{
				Success: false,
				Error: &models.ErrorInfo{
					Code:    "INVALID_TOKEN",
					Message: "Invalid or expired token",
					Details: err.Error(),
				},
			})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, models.Response{
				Success: false,
				Error: &models.ErrorInfo{
					Code:    "INVALID_CLAIMS",
					Message: "Invalid token claims",
				},
			})
			c.Abort()
			return
		}

		// Set user context
		c.Set("user_id", claims["user_id"])
		c.Set("email", claims["email"])
		c.Set("role", claims["role"])

		c.Next()
	}
}

// RequireRole checks if user has specific role
func (m *AuthMiddleware) RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, models.Response{
				Success: false,
				Error: &models.ErrorInfo{
					Code:    "FORBIDDEN",
					Message: "Role information not found",
				},
			})
			c.Abort()
			return
		}

		userRole := role.(string)
		for _, allowedRole := range allowedRoles {
			if userRole == allowedRole {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, models.Response{
			Success: false,
			Error: &models.ErrorInfo{
				Code:    "INSUFFICIENT_PERMISSIONS",
				Message: fmt.Sprintf("This action requires one of these roles: %v", allowedRoles),
			},
		})
		c.Abort()
	}
}

// OptionalAuth validates token if present, but allows requests without token
// Used for public endpoints that may need user context for visibility checks
func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// No auth header, continue without user context
			c.Next()
			return
		}

		// Extract token from "Bearer <token>"
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			// Invalid format, continue without user context
			c.Next()
			return
		}

		// Try to parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(m.jwtSecret), nil
		})

		// If token is valid, set user context
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				c.Set("user_id", claims["user_id"])
				c.Set("email", claims["email"])
				if role, ok := claims["role"].(string); ok {
					c.Set("role", role)
				}
			}
		}

		c.Next()
	}
}

// InternalAuth validates internal API key for service-to-service communication
func (m *AuthMiddleware) InternalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-Internal-API-Key")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, models.Response{
				Success: false,
				Error: &models.ErrorInfo{
					Code:    "MISSING_API_KEY",
					Message: "Internal API key required",
				},
			})
			c.Abort()
			return
		}

		if apiKey != m.internalAPIKey {
			c.JSON(http.StatusForbidden, models.Response{
				Success: false,
				Error: &models.ErrorInfo{
					Code:    "INVALID_API_KEY",
					Message: "Invalid internal API key",
				},
			})
			c.Abort()
			return
		}

		// Mark request as internal
		c.Set("is_internal", true)
		c.Next()
	}
}

package middleware

import (
	"net/http"
	"strings"

	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/bisosad1501/DATN/services/auth-service/internal/service"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT token
func AuthMiddleware(authService service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error: &models.ErrorData{
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
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error: &models.ErrorData{
					Code:    "INVALID_HEADER",
					Message: "Authorization header must start with Bearer",
				},
			})
			c.Abort()
			return
		}

		// Validate token
		claims, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error: &models.ErrorData{
					Code:    "INVALID_TOKEN",
					Message: "Invalid or expired token",
				},
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

// RoleMiddleware checks if user has required role
func RoleMiddleware(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Success: false,
				Error: &models.ErrorData{
					Code:    "UNAUTHORIZED",
					Message: "User not authenticated",
				},
			})
			c.Abort()
			return
		}

		userRole := role.(string)
		allowed := false
		for _, r := range allowedRoles {
			if userRole == r {
				allowed = true
				break
			}
		}

		if !allowed {
			c.JSON(http.StatusForbidden, models.ErrorResponse{
				Success: false,
				Error: &models.ErrorData{
					Code:    "FORBIDDEN",
					Message: "Insufficient permissions",
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

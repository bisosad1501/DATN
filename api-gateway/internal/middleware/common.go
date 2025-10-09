package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
)

// CORS middleware for handling cross-origin requests
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// RequestLogger logs incoming requests with timing
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(startTime)

		// Get status code
		statusCode := c.Writer.Status()

		// Log format: [Gateway] Method Path Status Latency
		gin.DefaultWriter.Write([]byte(
			"[Gateway] " +
				c.Request.Method + " " +
				c.Request.URL.Path + " " +
				"Status:" + string(rune(statusCode)) + " " +
				"Latency:" + latency.String() + "\n",
		))
	}
}

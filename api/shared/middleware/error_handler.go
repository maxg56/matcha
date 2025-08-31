package middleware

import (
	"log"
	"net/http"
	"runtime/debug"
	
	"github.com/gin-gonic/gin"
	"auth-service/api/shared/response"
	"auth-service/api/shared/errors"
)

// ErrorHandler middleware catches panics and converts them to proper API errors
func ErrorHandler() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, err interface{}) {
		// Log the panic with stack trace
		log.Printf("Panic recovered: %v\n%s", err, debug.Stack())
		
		// Send structured error response
		response.Error(c, errors.ErrInternalServer.WithDetails("An unexpected error occurred"))
		c.Abort()
	})
}

// RequestValidator validates common request parameters
func RequestValidator() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Validate Content-Type for POST/PUT/PATCH requests
		method := c.Request.Method
		if method == http.MethodPost || method == http.MethodPut || method == http.MethodPatch {
			contentType := c.GetHeader("Content-Type")
			if contentType != "application/json" && !gin.IsDebugging() {
				response.Error(c, errors.ErrInvalidPayload.WithDetails("Content-Type must be application/json"))
				c.Abort()
				return
			}
		}
		
		c.Next()
	}
}

// CORSWithErrorHandling combines CORS with proper error responses
func CORSWithErrorHandling() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		
		// Set CORS headers
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")
		
		// Handle preflight requests
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		
		c.Next()
		
		// Handle CORS errors in response
		if c.Writer.Status() >= 400 && origin == "" {
			response.Error(c, errors.ErrForbidden.WithDetails("CORS policy violation"))
		}
	}
}
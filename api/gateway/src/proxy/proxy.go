package proxy

import (
	"bytes"
	"fmt"
	"gateway/src/middleware"
	"gateway/src/services"
	"gateway/src/utils"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/koding/websocketproxy"
)

// ProxyRequest creates a handler that proxies requests to the specified service
func ProxyRequest(serviceName, path string) gin.HandlerFunc {
	return func(c *gin.Context) {
		service, exists := services.GetService(serviceName)
		if !exists {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": fmt.Sprintf("Service %s not available", serviceName),
			})
			return
		}

		// Build target URL
		targetURL := service.URL + replacePlaceholders(path, c)

		// Copy query parameters
		if c.Request.URL.RawQuery != "" {
			targetURL += "?" + c.Request.URL.RawQuery
		}

		// Create request
		var body io.Reader
		if c.Request.Body != nil {
			bodyBytes, err := io.ReadAll(c.Request.Body)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to read request body",
				})
				return
			}
			body = bytes.NewReader(bodyBytes)
		}

		req, err := http.NewRequest(c.Request.Method, targetURL, body)
		if err != nil {
			log.Printf("Error creating request to %s: %v", targetURL, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create request",
			})
			return
		}

		// Copy headers
		copyHeaders(c, req)

		// Execute request
		client := &http.Client{
			Timeout: 30 * time.Second,
		}

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error proxying request to %s: %v", targetURL, err)
			c.JSON(http.StatusBadGateway, gin.H{
				"error": fmt.Sprintf("Service %s unavailable", service.Name),
			})
			return
		}
		defer resp.Body.Close()

		// Copy response
		copyResponse(c, resp)
	}
}

// replacePlaceholders replaces path parameters in the target path
func replacePlaceholders(path string, c *gin.Context) string {
	result := path

	// Replace path parameters
	for _, param := range c.Params {
		placeholder := fmt.Sprintf(":%s", param.Key)
		result = strings.ReplaceAll(result, placeholder, param.Value)
	}

	return result
}

// copyHeaders copies request headers and adds user context headers
func copyHeaders(c *gin.Context, req *http.Request) {
	// Copy all headers except Host, preserving multiple values
	for key, values := range c.Request.Header {
		if key == "Host" {
			continue
		}
		for _, v := range values {
			req.Header.Add(key, v)
		}
	}

	// Propagate authenticated user id if present in context
	fmt.Printf("[PROXY] DEBUG: Looking for user ID in context with key: %s\n", middleware.CtxUserIDKey)
	if v, ok := c.Get(middleware.CtxUserIDKey); ok {
		fmt.Printf("[PROXY] DEBUG: Found value in context: %v (type: %T)\n", v, v)
		if s, ok := v.(string); ok && s != "" {
			fmt.Printf("[PROXY] Setting X-User-ID header: '%s'\n", s)
			req.Header.Set("X-User-ID", s)
		} else {
			fmt.Printf("[PROXY] User ID in context but not string: %v\n", v)
		}
	} else {
		fmt.Printf("[PROXY] No user ID found in context\n")
	}

	// Forward original JWT token for services that need it
	if token := utils.ExtractToken(c); token != "" {
		req.Header.Set("X-JWT-Token", token)
	}
}

// copyResponse copies the upstream response to the client
func copyResponse(c *gin.Context, resp *http.Response) {
	// Set status code and copy headers (including multiple Set-Cookie values)
	c.Status(resp.StatusCode)
	for key, values := range resp.Header {
		for _, v := range values {
			c.Writer.Header().Add(key, v)
		}
	}

	// Copy body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read response body",
		})
		return
	}

	c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
}

// ProxyWebSocket creates a handler that proxies WebSocket connections to the specified service
func ProxyWebSocket(serviceName, path string) gin.HandlerFunc {
	return func(c *gin.Context) {
		service, exists := services.GetService(serviceName)
		if !exists {
			log.Printf("WebSocket service %s not available", serviceName)
			c.AbortWithStatus(http.StatusServiceUnavailable)
			return
		}

		// Build target WebSocket URL
		targetPath := replacePlaceholders(path, c)
		
		// Convert HTTP URL to WebSocket URL
		serviceURL := strings.Replace(service.URL, "http://", "ws://", 1)
		serviceURL = strings.Replace(serviceURL, "https://", "wss://", 1)
		targetURL := serviceURL + targetPath
		
		// Add query parameters if present
		if c.Request.URL.RawQuery != "" {
			targetURL += "?" + c.Request.URL.RawQuery
		}

		log.Printf("Proxying WebSocket connection to: %s", targetURL)

		// Parse the target URL
		backendURL, err := url.Parse(targetURL)
		if err != nil {
			log.Printf("Error parsing WebSocket URL %s: %v", targetURL, err)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		// Create WebSocket proxy
		proxy := websocketproxy.NewProxy(backendURL)
		
		// Add custom director to modify the request before forwarding
		proxy.Director = func(incoming *http.Request, out http.Header) {
			// Copy headers
			for key, values := range incoming.Header {
				for _, v := range values {
					out.Add(key, v)
				}
			}

			// Add user context headers if available
			if v, ok := c.Get(middleware.CtxUserIDKey); ok {
				if s, ok := v.(string); ok && s != "" {
					out.Set("X-User-ID", s)
				}
			}

			// Forward original JWT token
			if token := utils.ExtractToken(c); token != "" {
				out.Set("X-JWT-Token", token)
			}
		}

		// Serve the WebSocket proxy
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}

package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func proxyRequest(serviceName, path string) gin.HandlerFunc {
	return func(c *gin.Context) {
		service, exists := services[serviceName]
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

func replacePlaceholders(path string, c *gin.Context) string {
	result := path

	// Replace path parameters
	for _, param := range c.Params {
		placeholder := fmt.Sprintf(":%s", param.Key)
		result = strings.ReplaceAll(result, placeholder, param.Value)
	}

	return result
}

func copyHeaders(c *gin.Context, req *http.Request) {
	// Copy all headers except Host
	for key, values := range c.Request.Header {
		if key != "Host" && len(values) > 0 {
			req.Header.Set(key, values[0])
		}
	}
}

func copyResponse(c *gin.Context, resp *http.Response) {
	// Set status code
	c.Status(resp.StatusCode)

	// Copy headers
	for key, values := range resp.Header {
		if len(values) > 0 {
			c.Header(key, values[0])
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

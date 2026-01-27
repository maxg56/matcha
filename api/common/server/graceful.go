package server

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

// GracefulShutdownConfig holds configuration for graceful shutdown
type GracefulShutdownConfig struct {
	// ShutdownTimeout is the maximum time to wait for server to shut down
	ShutdownTimeout time.Duration
	// CleanupFunc is called before shutdown to clean up resources (DB, Redis, etc.)
	CleanupFunc func() error
}

// DefaultConfig returns default graceful shutdown configuration
func DefaultConfig() *GracefulShutdownConfig {
	return &GracefulShutdownConfig{
		ShutdownTimeout: 10 * time.Second,
		CleanupFunc:     nil,
	}
}

// RunWithGracefulShutdown starts the HTTP server and handles graceful shutdown
// Example usage:
//
//	server.RunWithGracefulShutdown(":8001", router, &server.GracefulShutdownConfig{
//	    ShutdownTimeout: 10 * time.Second,
//	    CleanupFunc: func() error {
//	        // Close database connections
//	        sqlDB, _ := db.DB.DB()
//	        return sqlDB.Close()
//	    },
//	})
func RunWithGracefulShutdown(addr string, handler http.Handler, config *GracefulShutdownConfig) {
	if config == nil {
		config = DefaultConfig()
	}

	srv := &http.Server{
		Addr:    addr,
		Handler: handler,
		// Recommended timeouts
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Run server in goroutine so it doesn't block
	go func() {
		log.Printf("Server starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	// Catch SIGINT (Ctrl+C) and SIGTERM (docker stop, k8s termination)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	// Block until signal received
	sig := <-quit
	log.Printf("Received signal: %v. Initiating graceful shutdown...", sig)

	// Create context with timeout for shutdown
	ctx, cancel := context.WithTimeout(context.Background(), config.ShutdownTimeout)
	defer cancel()

	// Attempt graceful shutdown
	log.Println("Shutting down HTTP server...")
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	} else {
		log.Println("HTTP server shut down successfully")
	}

	// Run cleanup function if provided
	if config.CleanupFunc != nil {
		log.Println("Running cleanup tasks...")
		if err := config.CleanupFunc(); err != nil {
			log.Printf("Error during cleanup: %v", err)
		} else {
			log.Println("Cleanup completed successfully")
		}
	}

	log.Println("Server exited gracefully")
}

// RunWithGracefulShutdownTLS is the TLS version of RunWithGracefulShutdown
func RunWithGracefulShutdownTLS(addr, certFile, keyFile string, handler http.Handler, config *GracefulShutdownConfig) {
	if config == nil {
		config = DefaultConfig()
	}

	srv := &http.Server{
		Addr:         addr,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("HTTPS server starting on %s", addr)
		if err := srv.ListenAndServeTLS(certFile, keyFile); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start HTTPS server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	sig := <-quit
	log.Printf("Received signal: %v. Initiating graceful shutdown...", sig)

	ctx, cancel := context.WithTimeout(context.Background(), config.ShutdownTimeout)
	defer cancel()

	log.Println("Shutting down HTTPS server...")
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	} else {
		log.Println("HTTPS server shut down successfully")
	}

	if config.CleanupFunc != nil {
		log.Println("Running cleanup tasks...")
		if err := config.CleanupFunc(); err != nil {
			log.Printf("Error during cleanup: %v", err)
		} else {
			log.Println("Cleanup completed successfully")
		}
	}

	log.Println("Server exited gracefully")
}

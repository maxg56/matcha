package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"

	"admin-service/src/conf"
	"admin-service/src/handlers"
	"admin-service/src/middleware"
	"admin-service/src/models"
	"admin-service/src/utils"
)

func seedBaseAdmin() {
	email := os.Getenv("ADMIN_EMAIL")
	pass := os.Getenv("ADMIN_PASSWORD")
	if email == "" || pass == "" {
		return
	}
	var count int64
	conf.DB.Model(&models.Admin{}).Where("role = ?", string(models.RoleSuperAdmin)).Count(&count)
	if count > 0 {
		return
	}
	hash, err := utils.HashPassword(pass)
	if err != nil {
		log.Printf("seed admin hash error: %v", err)
		return
	}
	a := models.Admin{Email: email, Password: hash, Role: string(models.RoleSuperAdmin), Active: true}
	if err := conf.DB.Create(&a).Error; err != nil {
		log.Printf("seed admin create error: %v", err)
	}
}

func main() {
	conf.InitDB()
	if err := conf.InitRedis(); err != nil {
		log.Printf("redis init failed: %v", err)
	}
	seedBaseAdmin()

	r := gin.Default()

	// Health
	r.GET("/health", handlers.Health)

	api := r.Group("/api/v1/admin")
	{
		api.POST("/login", handlers.AdminLogin)

		apiAuth := api.Group("")
		apiAuth.Use(middleware.RequireAdmin())
		apiAuth.GET("/admins", handlers.ListAdmins)

		apiSuper := api.Group("")
		apiSuper.Use(middleware.RequireSuperAdmin())
		apiSuper.POST("/admins", handlers.CreateAdmin)
		apiSuper.PUT("/admins/:id", handlers.UpdateAdmin)
		apiSuper.DELETE("/admins/:id", handlers.DeleteAdmin)
	}

	port := os.Getenv("ADMIN_PORT")
	if port == "" {
		port = "8007"
	}
	log.Printf("admin-service listening on :%s", port)
	srv := &http.Server{Addr: ":" + port, Handler: r, ReadHeaderTimeout: 5 * time.Second}
	log.Fatal(srv.ListenAndServe())
}

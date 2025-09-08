package routes

import (
	"gateway/src/middleware"
	"gateway/src/proxy"

	"github.com/gin-gonic/gin"
)

func RegisterAdminRoutes(r *gin.Engine) {
	admin := r.Group("/api/v1/admin")
	{
		admin.POST("/login", proxy.ProxyRequest("admin", "/api/v1/admin/login"))

		secured := admin.Group("")
		secured.Use(middleware.JWTMiddleware())
		secured.Use(middleware.AdminMiddleware())
		secured.GET("/admins", proxy.ProxyRequest("admin", "/api/v1/admin/admins"))
		secured.POST("/admins", proxy.ProxyRequest("admin", "/api/v1/admin/admins"))
		secured.PUT("/admins/:id", proxy.ProxyRequest("admin", "/api/v1/admin/admins/:id"))
		secured.DELETE("/admins/:id", proxy.ProxyRequest("admin", "/api/v1/admin/admins/:id"))
	}
}

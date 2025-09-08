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
		secured.GET("/stats", proxy.ProxyRequest("admin", "/api/v1/admin/stats"))
		secured.GET("/stats/user/:user_id", proxy.ProxyRequest("admin", "/api/v1/admin/stats/user/:user_id"))
		secured.GET("/stats/trends", proxy.ProxyRequest("admin", "/api/v1/admin/stats/trends"))
		secured.GET("/performance", proxy.ProxyRequest("admin", "/api/v1/admin/performance"))
		secured.POST("/cache/clear", proxy.ProxyRequest("admin", "/api/v1/admin/cache/clear"))
		secured.POST("/indexes/create", proxy.ProxyRequest("admin", "/api/v1/admin/indexes/create"))
	}
}

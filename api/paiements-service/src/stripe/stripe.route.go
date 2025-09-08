package stripe

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	stripeGroup := r.Group("/api/stripe")
	{
		stripeGroup.POST("/create-checkout-session", CreateCheckoutSession)
	}
}

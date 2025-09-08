package stripe

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
)

func CreateCheckoutSession(c *gin.Context) {
	var body struct {
		Plan string `json:"plan"`
	}
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// Récupérer l'ID du prix Stripe selon le plan
	var priceID string
	if body.Plan == "mensuel" {
		priceID = os.Getenv("STRIPE_PRICE_MENSUEL")
	} else if body.Plan == "annuel" {
		priceID = os.Getenv("STRIPE_PRICE_ANNUEL")
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plan"})
		return
	}

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(priceID),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String("subscription"),
		SuccessURL: stripe.String("http://localhost:5173/success"),
		CancelURL:  stripe.String("http://localhost:5173/cancel"),
	}

	s, err := session.New(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": s.ID})
}

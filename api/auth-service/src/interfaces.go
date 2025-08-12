package main

import "github.com/gin-gonic/gin"

// AuthHandlers defines the contract for auth-related HTTP handlers.
// This makes routing pluggable and simplifies testing/mocking.
type AuthHandlers interface {
    Register(*gin.Context)
    Login(*gin.Context)
    Logout(*gin.Context)
    Refresh(*gin.Context)
    Verify(*gin.Context)
    ForgotPassword(*gin.Context)
    ResetPassword(*gin.Context)
}

// defaultAuthHandlers is the default adapter that forwards to package-level handlers.
type defaultAuthHandlers struct{}

func NewAuthHandlers() AuthHandlers { return defaultAuthHandlers{} }

func (defaultAuthHandlers) Register(c *gin.Context)       { registerHandler(c) }
func (defaultAuthHandlers) Login(c *gin.Context)          { loginHandler(c) }
func (defaultAuthHandlers) Logout(c *gin.Context)         { logoutHandler(c) }
func (defaultAuthHandlers) Refresh(c *gin.Context)        { refreshTokenHandler(c) }
func (defaultAuthHandlers) Verify(c *gin.Context)         { verifyTokenHandler(c) }
func (defaultAuthHandlers) ForgotPassword(c *gin.Context) { forgotPasswordHandler(c) }
func (defaultAuthHandlers) ResetPassword(c *gin.Context)  { resetPasswordHandler(c) }

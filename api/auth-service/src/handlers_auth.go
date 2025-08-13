package main

import (
    "fmt"
    "net/http"
    "time"
	"os"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
    jwt "github.com/golang-jwt/jwt/v5"

    db "auth-service/src/conf"
    models "auth-service/src/models"
    types "auth-service/src/types"
)



func registerHandler(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        respondError(c, http.StatusBadRequest, "invalid payload")
        return
    }

    // Check for existing users
    var existing models.User
    if err := db.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existing).Error; err == nil && existing.ID != 0 {
        respondError(c, http.StatusConflict, "username or email already in use")
        return
    }
    
    // Create user
    user, err := createUser(req)
    if err != nil {
        respondError(c, http.StatusInternalServerError, err.Error())
        return
    }
    
    // Generate tokens
    tokens, err := generateTokenPair(user.ID)
    if err != nil {
        respondError(c, http.StatusInternalServerError, err.Error())
        return
    }
    
    respondSuccess(c, http.StatusCreated, gin.H{
        "message":       "user registered",
        "user_id":       user.ID,
        "access_token":  tokens.AccessToken,
        "refresh_token": tokens.RefreshToken,
        "token_type":    "Bearer",
        "expires_in":    tokens.ExpiresIn,
    })
}

func loginHandler(c *gin.Context) {
    type LoginRequest struct {
        Identifier string `json:"identifier" binding:"required"` // email or username
        Password   string `json:"password" binding:"required"`
    }
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        respondError(c, http.StatusBadRequest, "invalid payload")
        return
    }
    // Find user by username or email
    var user models.User
    if err := db.DB.Where("username = ? OR email = ?", req.Identifier, req.Identifier).First(&user).Error; err != nil || user.ID == 0 {
        respondError(c, http.StatusUnauthorized, "invalid credentials")
        return
    }
    // Compare password
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
        respondError(c, http.StatusUnauthorized, "invalid credentials")
        return
    }
    
    // Issue JWT & refresh tokens
    tokens, err := generateTokenPair(user.ID)
    if err != nil {
        respondError(c, http.StatusInternalServerError, err.Error())
        return
    }
    
    respondSuccess(c, http.StatusOK, gin.H{
        "access_token":  tokens.AccessToken,
        "refresh_token": tokens.RefreshToken,
        "token_type":    "Bearer",
        "expires_in":    tokens.ExpiresIn,
    })
}

// helpers
// signToken creates a compact JWS (HS256) with the given claims using golang-jwt.
func signToken(claims jwt.MapClaims, secret string) (string, error) {
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}

func getDurationFromEnv(key string, fallback time.Duration) time.Duration {
    if v := os.Getenv(key); v != "" {
        if d, err := time.ParseDuration(v); err == nil {
            return d
        }
    }
    return fallback
}

// TokenPair holds access and refresh tokens
type TokenPair struct {
    AccessToken  string
    RefreshToken string
    ExpiresIn    int64
}

func generateTokenPair(userID uint) (*TokenPair, error) {
    // Generate access token (short-lived)
    accessClaims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(time.Hour * 1).Unix(), // 1 hour
    }
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
    accessString, err := accessToken.SignedString([]byte("your-secret-key"))
    if err != nil {
        return nil, err
    }

    // Generate refresh token (long-lived)
    refreshClaims := jwt.MapClaims{
        "user_id": userID,
        "exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
    }
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
    refreshString, err := refreshToken.SignedString([]byte("your-secret-key"))
    if err != nil {
        return nil, err
    }

    return &TokenPair{
        AccessToken:  accessString,
        RefreshToken: refreshString,
        ExpiresIn:    3600, // 1 hour in seconds
    }, nil
}

type RegisterRequest struct {
    Username string       `json:"username" binding:"required"`
    Email    string       `json:"email" binding:"required"`
    Password string       `json:"password" binding:"required"`
    Gender   types.Gender `json:"gender" binding:"required"`
    SexPref  types.SexPref `json:"sex_pref" binding:"required"`
}

func createUser(req RegisterRequest) (*models.User, error) {
    // Hash password
    hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return nil, fmt.Errorf("failed to process password")
    }
    
    user := models.User{
        Username:     req.Username,
        Email:        req.Email,
        PasswordHash: string(hash),
        Gender:       string(req.Gender),
        SexPref:      string(req.SexPref),
    }
    
    if err := db.DB.Create(&user).Error; err != nil {
        return nil, fmt.Errorf("failed to create user")
    }
    
    return &user, nil
}


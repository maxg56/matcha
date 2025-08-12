package main

import (
    "net/http"
    "time"
	"strconv"
	"os"

    "github.com/gin-gonic/gin"
    "golang.org/x/crypto/bcrypt"
    jwt "github.com/golang-jwt/jwt/v5"

    db "auth-service/src/conf"
    models "auth-service/src/models"
    types "auth-service/src/types"
)



func registerHandler(c *gin.Context) {
    type RegisterRequest struct {
        Username string `json:"username" binding:"required"`
        Email    string `json:"email" binding:"required"`
        Password string `json:"password" binding:"required"`
		Gender   types.Gender `json:"gender" binding:"required"`
		SexPref  types.SexPref `json:"sex_pref" binding:"required"`
    }
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        respondError(c, http.StatusBadRequest, "invalid payload")
        return
    }

    // Basic uniqueness check
    var existing models.User
    if err := db.DB.Where("username = ? OR email = ?", req.Username, req.Email).First(&existing).Error; err == nil && existing.ID != 0 {
        respondError(c, http.StatusConflict, "username or email already in use")
        return
    }
    // Hash password
    hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        respondError(c, http.StatusInternalServerError, "failed to process password")
        return
    }
    user := models.User{
        Username:     req.Username,
        Email:        req.Email,
        PasswordHash: string(hash),
        Gender:       string(req.Gender),
        SexPref:      string(req.SexPref),
    }
    if err := db.DB.Create(&user).Error; err != nil {
        respondError(c, http.StatusInternalServerError, "failed to create user")
        return
    }
    respondSuccess(c, http.StatusCreated, gin.H{"message": "user registered", "user_id": user.ID})
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
    // Issue JWT & refresh
    accessTTL := getDurationFromEnv("JWT_ACCESS_TTL", 15*time.Minute)
    refreshTTL := getDurationFromEnv("JWT_REFRESH_TTL", 7*24*time.Hour)
    secret := os.Getenv("JWT_SECRET")
    refreshSecret := os.Getenv("JWT_REFRESH_SECRET")
    if secret == "" {
        respondError(c, http.StatusInternalServerError, "server misconfigured: missing JWT_SECRET")
        return
    }
    if refreshSecret == "" {
        refreshSecret = secret
    }
    now := time.Now()
    accessToken, err := signToken(jwt.MapClaims{
        "sub":  strconv.FormatUint(uint64(user.ID), 10),
        "iat":  now.Unix(),
        "nbf":  now.Unix(),
        "exp":  now.Add(accessTTL).Unix(),
        "scope": "access",
    }, secret)
    if err != nil {
        respondError(c, http.StatusInternalServerError, "failed to issue token")
        return
    }
    refreshToken, err := signToken(jwt.MapClaims{
        "sub":  strconv.FormatUint(uint64(user.ID), 10),
        "iat":  now.Unix(),
        "nbf":  now.Unix(),
        "exp":  now.Add(refreshTTL).Unix(),
        "scope": "refresh",
    }, refreshSecret)
    if err != nil {
        respondError(c, http.StatusInternalServerError, "failed to issue token")
        return
    }
    respondSuccess(c, http.StatusOK, gin.H{
        "access_token":  accessToken,
        "refresh_token": refreshToken,
        "token_type":    "Bearer",
        "expires_in":    int(accessTTL.Seconds()),
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


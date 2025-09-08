package utils

import (
	"fmt"
	"os"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

func jwtSecret() (string, error) {
	s := os.Getenv("ADMIN_JWT_SECRET")
	if s == "" {
		s = os.Getenv("JWT_SECRET")
	}
	if s == "" {
		return "", fmt.Errorf("missing ADMIN_JWT_SECRET")
	}
	return s, nil
}

func SignAdminToken(claims jwt.MapClaims) (string, error) {
	secret, err := jwtSecret()
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParseAdminToken(tokenString string) (jwt.MapClaims, error) {
	secret, err := jwtSecret()
	if err != nil {
		return nil, err
	}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, jwt.ErrTokenMalformed
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		return claims, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}

func AdminAccessTTL() time.Duration {
	if v := os.Getenv("ADMIN_JWT_TTL"); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return 30 * time.Minute
}

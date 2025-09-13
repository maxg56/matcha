package conf

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/redis/go-redis/v9"
)

var Redis *redis.Client
var ctx = context.Background()

func InitRedis() error {
	host := getenv("REDIS_HOST", "localhost")
	port := getenv("REDIS_PORT", "6379")
	password := os.Getenv("REDIS_PASSWORD")
	db := 0
	if s := os.Getenv("REDIS_DB"); s != "" {
		if v, err := strconv.Atoi(s); err == nil {
			db = v
		}
	}

	Redis = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: password,
		DB:       db,
	})

	if _, err := Redis.Ping(ctx).Result(); err != nil {
		return err
	}
	return nil
}

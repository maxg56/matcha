# Multi-stage build
# Development stage with Air
FROM golang:1.25-alpine AS development
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum ./
RUN go mod download
EXPOSE 8001
CMD ["air", "-c", ".air.toml"]

FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY src/ ./src/
COPY templates/ ./templates
# Ensure go.sum is generated
RUN go mod tidy && go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o auth-service ./src

# Production stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
RUN addgroup -g 1001 -S authservice && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G authservice authservice
WORKDIR /app
COPY --from=builder --chown=authservice:authservice /app/auth-service .
USER authservice
EXPOSE 8001
CMD ["./auth-service"]

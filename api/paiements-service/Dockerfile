# Multi-stage build
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY src/ ./src/
RUN go mod tidy && go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o paiements-service ./src

# Development stage with Air (optionnel)
FROM golang:1.25-alpine AS development
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum ./
RUN go mod download
EXPOSE 8085
CMD ["air", "-c", ".air.toml"]

# Production stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
RUN addgroup -g 1001 -S paiements && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G paiements paiements
WORKDIR /app
COPY --from=builder --chown=paiements:paiements /app/paiements-service .
USER paiements
EXPOSE 8085
CMD ["./paiements-service"]

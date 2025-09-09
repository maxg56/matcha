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
WORKDIR /root/
COPY --from=builder /app/paiements-service .
EXPOSE 8085
CMD ["./paiements-service"]

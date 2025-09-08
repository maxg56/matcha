# Multi-stage build
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY src/ ./src/
RUN go mod tidy && go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o chat-service ./src

# Development stage with Air
FROM golang:1.25-alpine AS development
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum ./
RUN go mod download
EXPOSE 8004
CMD ["air", "-c", ".air.toml"]

# Production stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/chat-service .
EXPOSE 8004
CMD ["./chat-service"]

# Development stage
FROM golang:1.21-alpine AS development

# Install development tools
RUN apk add --no-cache git
RUN apk --no-cache add ca-certificates
RUN addgroup -g 1001 -S mediaservice && adduser -u 1001 -S mediaservice -G mediaservice

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download
RUN mkdir -p /app/uploads && chown -R mediaservice:mediaservice /app/uploads

# Switch to non-root user
USER mediaservice

# Development command
CMD ["go", "run", "src/main.go"]

# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY src/ ./src/

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main src/main.go

# Production stage
FROM alpine:latest AS production

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates
RUN addgroup -g 1001 -S mediaservice && adduser -u 1001 -S mediaservice -G mediaservice

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/main .

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads && chown -R mediaservice:mediaservice /app/uploads

# Switch to non-root user
USER mediaservice

EXPOSE 8006

CMD ["./main"]
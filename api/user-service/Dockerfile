# Multi-stage build
# Development stage with Air
FROM golang:1.25-alpine AS development
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum ./
RUN go mod download
EXPOSE 8002
CMD ["air", "-c", ".air.toml"]

FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY src/ ./src/
RUN go mod tidy && go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o user-service ./src

# Production stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
RUN addgroup -g 1001 -S userservice && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G userservice userservice
WORKDIR /app
COPY --from=builder --chown=userservice:userservice /app/user-service .
USER userservice
EXPOSE 8002
CMD ["./user-service"]

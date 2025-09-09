# Multi-stage build
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY src/ ./src/
# Ensure go.sum is generated
RUN go mod tidy && go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o match-service ./src

# Development stage with Air
FROM golang:1.25-alpine AS development
WORKDIR /app
RUN go install github.com/air-verse/air@latest
COPY go.mod go.sum .air.toml ./
RUN go mod download
COPY src/ ./src/
EXPOSE 8003
CMD ["air", "-c", ".air.toml"]


# Production stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/match-service .
EXPOSE 8003
CMD ["./match-service"]
# ---------- Builder stage ----------
FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod  go.sum ./
RUN go mod download
COPY src/ ./src/
RUN CGO_ENABLED=0 GOOS=linux go build -o gateway ./src

# ---------- Development stage ----------
FROM golang:1.24-alpine AS development

WORKDIR /app

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

CMD ["air", "-c", ".air.toml"]

# ---------- Production stage ----------
FROM alpine:latest AS production

RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/gateway .
EXPOSE 8080
CMD ["./gateway"]

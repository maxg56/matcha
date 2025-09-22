# ---------- Builder stage ----------
FROM golang:1.25-alpine AS builder

WORKDIR /app
COPY go.mod  go.sum ./
RUN go mod download
COPY src/ ./src/
RUN CGO_ENABLED=0 GOOS=linux go build -o gateway ./src

# ---------- Development stage ----------
FROM golang:1.25-alpine AS development

WORKDIR /app

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

CMD ["air", "-c", ".air.toml"]

# ---------- Production stage ----------
FROM alpine:latest AS production

RUN apk --no-cache add ca-certificates
RUN addgroup -g 1001 -S gateway && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G gateway gateway
WORKDIR /app
COPY --from=builder --chown=gateway:gateway /app/gateway .
USER gateway
EXPOSE 8080
CMD ["./gateway"]

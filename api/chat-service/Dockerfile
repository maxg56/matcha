FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY /src .
RUN CGO_ENABLED=0 GOOS=linux go build -o chat-service .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/chat-service .
EXPOSE 8004
CMD ["./chat-service"]

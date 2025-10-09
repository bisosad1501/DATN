# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY services/notification-service/go.mod services/notification-service/go.sum ./
RUN go mod download

# Copy source code
COPY services/notification-service/ .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/main.go

# Run stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8085

# Run the application
CMD ["./main"]

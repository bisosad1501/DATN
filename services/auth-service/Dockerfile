# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY services/auth-service/go.mod services/auth-service/go.sum ./
RUN go mod download

# Copy source code
COPY services/auth-service/ ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates and postgresql-client for database checks
RUN apk --no-cache add ca-certificates postgresql-client bash

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy scripts (will be mounted as volume in docker-compose)
# Scripts are available at /scripts when container runs

# Expose port
EXPOSE 8081

# Run init script then start service
CMD ["/bin/bash", "-c", "if [ -f /scripts/check-and-init-db.sh ]; then /scripts/check-and-init-db.sh; fi && ./main"]

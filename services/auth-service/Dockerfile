# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /build

# Install dependencies
RUN apk add --no-cache git

# Copy entire project structure to maintain paths
COPY shared/ ./shared/
COPY services/auth-service/ ./services/auth-service/

# Set working directory to auth-service
WORKDIR /build/services/auth-service

# Download dependencies
RUN go mod download

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates and postgresql-client for database checks
RUN apk --no-cache add ca-certificates postgresql-client bash

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /build/services/auth-service/main .

# Copy scripts (will be mounted as volume in docker-compose)
# Scripts are available at /scripts when container runs

# Expose port
EXPOSE 8081

# Run init script then start service
CMD ["/bin/bash", "-c", "if [ -f /scripts/check-and-init-db.sh ]; then /scripts/check-and-init-db.sh; fi && ./main"]

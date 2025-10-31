# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /build

# Install dependencies
RUN apk add --no-cache git

# Copy shared module first (required for replace directive)
COPY shared/ ./shared/

# Copy go mod files
COPY services/user-service/go.mod services/user-service/go.sum ./services/user-service/

# Change to service directory and download dependencies
WORKDIR /build/services/user-service
RUN go mod download

# Copy source code
COPY services/user-service/ ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates postgresql-client curl

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /build/services/user-service/main .

# Expose port
EXPOSE 8082

# Run the application
CMD ["./main"]

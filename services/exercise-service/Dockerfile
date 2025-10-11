# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /build

# Copy shared module first (required for replace directive)
COPY shared/ ./shared/

# Copy exercise-service
COPY services/exercise-service/ ./services/exercise-service/

# Set working directory to exercise-service for build
WORKDIR /build/services/exercise-service

# Download dependencies
RUN go mod download

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/main.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder (updated path)
COPY --from=builder /build/services/exercise-service/main .

# Expose port
EXPOSE 8084

# Run the application
CMD ["./main"]

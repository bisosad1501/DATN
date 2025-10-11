# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /build

# Copy shared module first (required for replace directive)
COPY shared/ ./shared/

# Copy course-service
COPY services/course-service/ ./services/course-service/

# Set working directory to course-service for build
WORKDIR /build/services/course-service

# Download dependencies
RUN go mod download

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/main.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates postgresql-client

WORKDIR /root/

# Copy binary from builder (updated path)
COPY --from=builder /build/services/course-service/main .

# Expose port
EXPOSE 8083

# Run
CMD ["./main"]

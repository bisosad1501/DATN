# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY services/course-service/go.mod services/course-service/go.sum ./
RUN go mod download

# Copy source code
COPY services/course-service/ ./

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/main.go

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates postgresql-client

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Expose port
EXPOSE 8083

# Run
CMD ["./main"]

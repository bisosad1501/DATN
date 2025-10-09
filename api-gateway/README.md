# API Gateway

Single entry point for all IELTS Platform microservices.

## 🚀 Features

- **Single Entry Point**: All services accessible through `http://localhost:8080`
- **JWT Authentication**: Centralized token validation
- **Request Routing**: Intelligent routing to backend services
- **CORS Handling**: Configured for cross-origin requests
- **Request Logging**: Comprehensive logging of all requests
- **Health Checks**: Built-in health monitoring
- **Error Handling**: Graceful error responses

## 📊 Architecture

```
Client → API Gateway (8080) → Backend Services
                               ├── Auth Service (8081)
                               ├── User Service (8082)
                               ├── Course Service (8083)
                               ├── Exercise Service (8084)
                               └── Notification Service (8085)
```

## 🔧 Configuration

Environment variables:

```env
SERVER_PORT=8080                                    # Gateway port
JWT_SECRET=your_jwt_secret_key                      # JWT secret
AUTH_SERVICE_URL=http://auth-service:8081          # Auth service
USER_SERVICE_URL=http://user-service:8082          # User service
COURSE_SERVICE_URL=http://course-service:8083      # Course service
EXERCISE_SERVICE_URL=http://exercise-service:8084  # Exercise service
NOTIFICATION_SERVICE_URL=http://notification-service:8085
RATE_LIMIT_RPM=100                                 # Rate limit
RATE_LIMIT_ENABLED=true                            # Enable rate limiting
```

## 📡 API Endpoints

### Gateway Info
- `GET /` - API documentation and available endpoints
- `GET /health` - Gateway health check

### Authentication (`/api/v1/auth`)
**Public endpoints:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/verify-email` - Verify email
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

**Protected endpoints:**
- `POST /api/v1/auth/change-password` - Change password (requires auth)
- `GET /api/v1/auth/me` - Get current user info (requires auth)

### Users (`/api/v1/users`) - All require authentication
- `GET /api/v1/users/me` - Get user profile
- `PUT /api/v1/users/me` - Update user profile
- `GET /api/v1/users/me/profile` - Get detailed profile
- `PUT /api/v1/users/me/profile` - Update detailed profile
- `GET /api/v1/users/me/progress` - Get learning progress
- `GET /api/v1/users/me/statistics` - Get statistics
- `GET /api/v1/users/me/achievements` - Get achievements

### Courses (`/api/v1/courses`)
**Public endpoints (optional auth):**
- `GET /api/v1/courses` - List all courses
- `GET /api/v1/courses/:id` - Get course details
- `GET /api/v1/courses/:id/modules` - Get course modules
- `GET /api/v1/courses/:id/modules/:module_id/lessons` - Get module lessons

**Protected endpoints:**
- `POST /api/v1/courses/:id/enroll` - Enroll in course
- `GET /api/v1/courses/my-courses` - Get my enrolled courses
- `GET /api/v1/courses/:id/progress` - Get course progress
- `POST /api/v1/courses/:id/lessons/:lesson_id/complete` - Mark lesson complete

### Exercises (`/api/v1/exercises`)
**Public endpoints:**
- `GET /api/v1/exercises` - List exercises
- `GET /api/v1/exercises/:id` - Get exercise details

**Protected endpoints:**
- `POST /api/v1/exercises/start` - Start exercise attempt

### Submissions (`/api/v1/submissions`) - All require authentication
- `PUT /api/v1/submissions/:id/answers` - Submit answers
- `GET /api/v1/submissions/:id/result` - Get submission result
- `GET /api/v1/submissions/my` - Get my submissions

### Notifications (`/api/v1/notifications`) - All require authentication
- `GET /api/v1/notifications` - List notifications
- `GET /api/v1/notifications/unread-count` - Get unread count
- `GET /api/v1/notifications/:id` - Get notification by ID
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/mark-all-read` - Mark all as read
- `DELETE /api/v1/notifications/:id` - Delete notification
- `POST /api/v1/notifications/devices` - Register device token
- `GET /api/v1/notifications/preferences` - Get preferences
- `PUT /api/v1/notifications/preferences` - Update preferences

### Admin (`/api/v1/admin`) - All require admin/instructor role
**Course management:**
- `POST /api/v1/admin/courses` - Create course
- `PUT /api/v1/admin/courses/:id` - Update course
- `DELETE /api/v1/admin/courses/:id` - Delete course
- `POST /api/v1/admin/courses/:id/modules` - Create module
- `POST /api/v1/admin/modules/:id/lessons` - Create lesson

**Exercise management:**
- `POST /api/v1/admin/exercises` - Create exercise
- `PUT /api/v1/admin/exercises/:id` - Update exercise
- `DELETE /api/v1/admin/exercises/:id` - Delete exercise
- `POST /api/v1/admin/exercises/:id/sections` - Create section
- `POST /api/v1/admin/questions` - Create question
- `POST /api/v1/admin/questions/:id/options` - Add option
- `POST /api/v1/admin/questions/:id/answer` - Add answer

**Notification management:**
- `POST /api/v1/admin/notifications` - Create notification
- `POST /api/v1/admin/notifications/bulk` - Send bulk notifications

## 🧪 Testing

### Using cURL

```bash
# Health check
curl http://localhost:8080/health

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@test.com","password":"Test@123"}'

# Use token
TOKEN="your_token_here"
curl http://localhost:8080/api/v1/notifications/unread-count \
  -H "Authorization: Bearer $TOKEN"

# Browse courses (no auth)
curl http://localhost:8080/api/v1/courses?page=1&limit=10

# Get exercises (no auth)
curl http://localhost:8080/api/v1/exercises?limit=5
```

### Using Postman

Update Postman environment:
- Change `base_url` from `http://localhost:8081` to `http://localhost:8080`
- All other variables remain the same
- The gateway will forward requests to appropriate services

## 🔒 Authentication Flow

1. **Login**: POST `/api/v1/auth/login` → Receive JWT token
2. **Use Token**: Include `Authorization: Bearer <token>` header
3. **Gateway Validates**: Gateway validates JWT
4. **Forward Request**: Gateway adds user info headers and forwards to service
5. **Service Response**: Service processes and returns response through gateway

### Headers Added by Gateway

When JWT is valid, gateway adds these headers to downstream requests:
```
X-User-ID: <user_uuid>
X-User-Email: <user_email>
X-User-Role: <user_role>
```

Backend services can trust these headers without re-validating JWT.

## 🐳 Docker

### Build
```bash
docker-compose build api-gateway
```

### Run
```bash
docker-compose up -d api-gateway
```

### Logs
```bash
docker logs -f ielts_api_gateway
```

### Health Check
```bash
docker exec ielts_api_gateway curl -f http://localhost:8080/health
```

## 📈 Monitoring

### Gateway Logs
All requests are logged with:
- Method (GET, POST, etc.)
- Path
- Status code
- Latency

Example:
```
[Gateway] GET /api/v1/courses Status:200 Latency:15.2ms
[Proxy] GET /api/v1/courses → http://course-service:8083/api/v1/courses
```

### Health Status
Check gateway and backend services:
```bash
# Gateway health
curl http://localhost:8080/health

# Backend services health (through gateway)
curl http://localhost:8080/api/v1/auth/health  # Not implemented yet
```

## 🚀 Production Considerations

### Replace with Production-Ready Gateway
For production, consider replacing with:
- **Kong**: Full-featured API gateway with plugins
- **Traefik**: Cloud-native with automatic service discovery
- **AWS API Gateway**: Fully managed service
- **Azure API Management**: Enterprise-grade gateway

### Current Implementation
This is a **lightweight Go implementation** suitable for:
- ✅ Development environments
- ✅ Small-scale deployments
- ✅ Proof of concept
- ❌ Not recommended for large-scale production (use Kong/Traefik)

### Missing Features for Production
- Rate limiting (basic implementation)
- Circuit breaker pattern
- Request/response transformation
- API versioning
- Analytics and metrics
- WebSocket support
- gRPC support

## 🔧 Extending the Gateway

### Adding New Service

1. **Add to config** (`internal/config/config.go`):
```go
type ServiceURLs struct {
    // ... existing services
    NewService string
}

config := &Config{
    Services: ServiceURLs{
        // ... existing
        NewService: getEnv("NEW_SERVICE_URL", "http://new-service:8086"),
    },
}
```

2. **Add routes** (`internal/routes/routes.go`):
```go
newGroup := v1.Group("/new")
newGroup.Use(authMiddleware.ValidateToken())
{
    newGroup.GET("", proxy.ReverseProxy(cfg.Services.NewService))
}
```

3. **Update docker-compose.yml**:
```yaml
api-gateway:
  environment:
    - NEW_SERVICE_URL=http://new-service:8086
```

### Adding Middleware

Create in `internal/middleware/`:
```go
func RateLimiter() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Rate limiting logic
        c.Next()
    }
}
```

Apply in routes:
```go
v1.Use(middleware.RateLimiter())
```

## 📝 Development

### Local Development (without Docker)
```bash
cd api-gateway

# Set environment variables
export SERVER_PORT=8080
export JWT_SECRET=your_secret
export AUTH_SERVICE_URL=http://localhost:8081
# ... other services

# Run
go run cmd/main.go
```

### Build Binary
```bash
go build -o gateway cmd/main.go
./gateway
```

## 🐛 Troubleshooting

### Service Not Found
```
{"error":"service_unavailable","message":"Failed to connect to backend service"}
```
**Solution**: Check if backend service is running: `docker ps`

### Unauthorized Error
```
{"error":"invalid_token","message":"Invalid or expired token"}
```
**Solution**: Login again to get new token

### CORS Error
Gateway handles CORS automatically. If issues persist:
- Check browser console
- Verify `Access-Control-Allow-Origin` header in response

## 📚 Further Reading

- [Gin Framework](https://gin-gonic.com/)
- [Go httputil.ReverseProxy](https://pkg.go.dev/net/http/httputil#ReverseProxy)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

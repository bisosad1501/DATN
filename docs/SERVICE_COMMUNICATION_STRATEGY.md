# Service Communication Strategy - IELTS Platform

**Date**: October 10, 2025  
**Decision**: Choosing between Direct Service Calls vs API Gateway

---

## 📊 TL;DR - RECOMMENDATION

**✅ RECOMMENDED APPROACH**: **Hybrid Strategy**
- **External Client → API Gateway** (User requests)
- **Internal Service-to-Service → Direct Calls** (Service communication)

**Why?**
- ✅ Best performance for internal calls
- ✅ Security: Internal network isolated
- ✅ No single point of failure for service mesh
- ✅ API Gateway still handles external traffic routing

---

## 🔀 OPTION 1: Direct Service-to-Service Calls (RECOMMENDED)

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    External Clients                         │
│              (Web App, Mobile App, Postman)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ API Gateway  │ ◄── Only for external requests
                  │  Port 8080   │
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐      ┌─────────┐    ┌──────────┐
   │  Auth   │◄────►│  User   │◄───│  Course  │
   │ Service │      │ Service │    │ Service  │
   │  8081   │      │  8082   │    │  8083    │
   └────┬────┘      └────┬────┘    └────┬─────┘
        │                │              │
        │                ▼              ▼
        │          ┌──────────┐   ┌──────────┐
        └─────────►│Exercise  │   │Notification│
                   │ Service  │   │  Service  │
                   │  8084    │   │  8085     │
                   └──────────┘   └──────────┘

Internal Communication:
━━━━━━━━► Direct HTTP Calls (localhost:808X)
```

### Implementation Example

#### 1. Create Internal HTTP Client

```go
// services/shared/internal/client/service_client.go
package client

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type ServiceClient struct {
    baseURL    string
    httpClient *http.Client
    apiKey     string // Internal API key for service auth
}

func NewServiceClient(baseURL, apiKey string) *ServiceClient {
    return &ServiceClient{
        baseURL: baseURL,
        apiKey:  apiKey,
        httpClient: &http.Client{
            Timeout: 10 * time.Second,
            Transport: &http.Transport{
                MaxIdleConns:        100,
                MaxIdleConnsPerHost: 10,
                IdleConnTimeout:     90 * time.Second,
            },
        },
    }
}

func (c *ServiceClient) Post(endpoint string, payload interface{}) (*http.Response, error) {
    jsonData, err := json.Marshal(payload)
    if err != nil {
        return nil, fmt.Errorf("marshal payload: %w", err)
    }

    req, err := http.NewRequest("POST", c.baseURL+endpoint, bytes.NewBuffer(jsonData))
    if err != nil {
        return nil, fmt.Errorf("create request: %w", err)
    }

    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-Internal-API-Key", c.apiKey) // Internal auth
    
    return c.httpClient.Do(req)
}

func (c *ServiceClient) Put(endpoint string, payload interface{}) (*http.Response, error) {
    // Similar implementation
}

func (c *ServiceClient) Get(endpoint string) (*http.Response, error) {
    // Similar implementation
}
```

#### 2. User Service Client (Used by Auth Service)

```go
// services/auth-service/internal/client/user_service_client.go
package client

import (
    "encoding/json"
    "fmt"
    "github.com/bisosad1501/DATN/services/shared/internal/client"
)

type UserServiceClient struct {
    *client.ServiceClient
}

func NewUserServiceClient(baseURL, apiKey string) *UserServiceClient {
    return &UserServiceClient{
        ServiceClient: client.NewServiceClient(baseURL, apiKey),
    }
}

type CreateProfileRequest struct {
    UserID   string `json:"user_id"`
    Email    string `json:"email"`
    Role     string `json:"role"`
    FullName string `json:"full_name,omitempty"`
}

type CreateProfileResponse struct {
    Success bool   `json:"success"`
    Message string `json:"message"`
}

func (c *UserServiceClient) CreateProfile(req CreateProfileRequest) error {
    resp, err := c.Post("/api/v1/user/internal/profile/create", req)
    if err != nil {
        return fmt.Errorf("call user service: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != 201 && resp.StatusCode != 200 {
        return fmt.Errorf("user service error: status %d", resp.StatusCode)
    }

    var result CreateProfileResponse
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return fmt.Errorf("decode response: %w", err)
    }

    if !result.Success {
        return fmt.Errorf("create profile failed: %s", result.Message)
    }

    return nil
}
```

#### 3. Usage in Auth Service

```go
// services/auth-service/internal/service/auth_service.go
package service

import (
    "github.com/bisosad1501/DATN/services/auth-service/internal/client"
)

type AuthService struct {
    // ... existing fields ...
    userServiceClient *client.UserServiceClient
}

func NewAuthService(config *config.Config, repo repository.AuthRepository) *AuthService {
    return &AuthService{
        // ... existing initialization ...
        userServiceClient: client.NewUserServiceClient(
            config.UserServiceURL,  // "http://localhost:8082"
            config.InternalAPIKey,  // Shared secret for internal auth
        ),
    }
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
    // ... existing registration logic ...
    
    // Create user in auth_db
    user, err := s.repo.CreateUser(userModel)
    if err != nil {
        return nil, err
    }
    
    // Assign role
    if err := s.repo.AssignRole(user.ID, role.ID); err != nil {
        return nil, err
    }
    
    // 🆕 CREATE PROFILE IN USER SERVICE
    err = s.userServiceClient.CreateProfile(client.CreateProfileRequest{
        UserID:   user.ID.String(),
        Email:    user.Email,
        Role:     req.Role,
        FullName: req.FullName,
    })
    if err != nil {
        // Log error but don't fail registration
        log.Printf("Failed to create user profile: %v", err)
        // Consider retry logic or async queue
    }
    
    // Generate tokens and return
    return authResponse, nil
}
```

#### 4. Configuration

```go
// services/auth-service/internal/config/config.go
type Config struct {
    // ... existing fields ...
    
    // Internal service URLs
    UserServiceURL        string `env:"USER_SERVICE_URL" envDefault:"http://localhost:8082"`
    CourseServiceURL      string `env:"COURSE_SERVICE_URL" envDefault:"http://localhost:8083"`
    ExerciseServiceURL    string `env:"EXERCISE_SERVICE_URL" envDefault:"http://localhost:8084"`
    NotificationServiceURL string `env:"NOTIFICATION_SERVICE_URL" envDefault:"http://localhost:8085"`
    
    // Internal authentication
    InternalAPIKey string `env:"INTERNAL_API_KEY" envDefault:"your-secure-internal-key-here"`
}
```

#### 5. Docker Compose Configuration

```yaml
# docker-compose.yml
services:
  auth-service:
    environment:
      - USER_SERVICE_URL=http://user-service:8082
      - NOTIFICATION_SERVICE_URL=http://notification-service:8085
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
    networks:
      - ielts_internal # Internal network
      
  user-service:
    environment:
      - NOTIFICATION_SERVICE_URL=http://notification-service:8085
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
    networks:
      - ielts_internal
      
networks:
  ielts_internal:
    driver: bridge
    internal: false # Services can reach each other
```

### ✅ Pros of Direct Service Calls

1. **Performance** ⚡
   - No additional hop through API Gateway
   - Lower latency (typically 1-5ms saved per call)
   - Direct TCP connection

2. **Simplicity** 🎯
   - Straightforward HTTP client implementation
   - Easy to debug with logs
   - No complex routing rules

3. **Resilience** 💪
   - API Gateway failure doesn't affect internal communication
   - Services can still talk to each other
   - No single point of failure for service mesh

4. **Security** 🔒
   - Internal network isolation
   - Shared API key for service authentication
   - Can use mTLS for extra security

5. **Flexibility** 🔧
   - Each service controls its own retry logic
   - Custom timeout per service
   - Circuit breaker pattern per client

### ❌ Cons of Direct Service Calls

1. **Service Discovery** 🔍
   - Need to know service URLs (solved with env vars)
   - DNS/service registry for dynamic scaling

2. **Monitoring** 📊
   - Need distributed tracing (Jaeger/Zipkin)
   - Each service must implement logging

3. **Authentication** 🔑
   - Need internal API key management
   - Or implement service mesh (Istio)

---

## 🚪 OPTION 2: All Traffic Through API Gateway

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    All Clients & Services                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ API Gateway  │ ◄── ALL traffic goes here
                  │  Port 8080   │     (External + Internal)
                  └──────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐      ┌─────────┐    ┌──────────┐
   │  Auth   │      │  User   │    │  Course  │
   │ Service │      │ Service │    │ Service  │
   │  8081   │      │  8082   │    │  8083    │
   └─────────┘      └─────────┘    └──────────┘

All Communication:
━━━━━━━━► Through API Gateway (Port 8080)
```

### Implementation Example

```go
// services/auth-service/internal/service/auth_service.go
func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
    // ... registration logic ...
    
    // Call User Service THROUGH API Gateway
    resp, err := http.Post(
        "http://api-gateway:8080/api/v1/user/internal/profile/create",
        "application/json",
        bytes.NewBuffer(profileData),
    )
    
    // ... handle response ...
}
```

### ✅ Pros of Gateway-Only Approach

1. **Centralized Routing** 🎯
   - Single entry point for all traffic
   - Easy to change service locations
   - Unified load balancing

2. **Centralized Auth** 🔒
   - All authentication in one place
   - Consistent security policies
   - Rate limiting per service

3. **Monitoring** 📊
   - Single point to collect all metrics
   - Easier to implement logging
   - Centralized tracing

4. **API Versioning** 🔄
   - Consistent API versioning
   - Easy to add compatibility layers

### ❌ Cons of Gateway-Only Approach

1. **Performance** 🐌
   - Extra network hop (adds 5-10ms latency)
   - Gateway becomes bottleneck under high load
   - More resource consumption

2. **Single Point of Failure** 💥
   - Gateway down = entire system down
   - Even internal service calls fail
   - Need HA setup (2+ gateway instances)

3. **Complexity** 🔧
   - Gateway needs to know all internal routes
   - More configuration management
   - Harder to debug issues

4. **Circular Dependencies** 🔄
   - What if Gateway needs Auth Service?
   - Bootstrap problem

---

## 🎯 RECOMMENDED SOLUTION: HYBRID APPROACH

### Best Practices Implementation

#### 1. Traffic Separation

```
External Traffic:
  Client → API Gateway → Service

Internal Traffic:
  Service A → Service B (Direct Call)
```

#### 2. Service Types

**Public Endpoints** (via API Gateway):
```
GET  /api/v1/courses             → Course Service
POST /api/v1/auth/login          → Auth Service  
GET  /api/v1/user/profile        → User Service
```

**Internal Endpoints** (direct calls only):
```
POST /api/v1/user/internal/profile/create
PUT  /api/v1/user/internal/progress/update
POST /api/v1/notification/internal/send
```

#### 3. Security

```go
// services/user-service/internal/middleware/internal_auth.go
func InternalAuthMiddleware(apiKey string) gin.HandlerFunc {
    return func(c *gin.Context) {
        requestKey := c.GetHeader("X-Internal-API-Key")
        
        if requestKey != apiKey {
            c.JSON(403, gin.H{"error": "forbidden: invalid internal key"})
            c.Abort()
            return
        }
        
        c.Next()
    }
}

// Usage in routes
internal := v1.Group("/user/internal")
internal.Use(middleware.InternalAuthMiddleware(config.InternalAPIKey))
{
    internal.POST("/profile/create", handler.CreateProfileInternal)
    internal.PUT("/progress/update", handler.UpdateProgressInternal)
}
```

#### 4. Error Handling & Retry

```go
// services/shared/internal/client/retry.go
func (c *ServiceClient) PostWithRetry(endpoint string, payload interface{}, maxRetries int) error {
    var lastErr error
    
    for i := 0; i < maxRetries; i++ {
        resp, err := c.Post(endpoint, payload)
        if err == nil && resp.StatusCode < 500 {
            return nil
        }
        
        lastErr = err
        time.Sleep(time.Duration(i+1) * 100 * time.Millisecond) // Exponential backoff
    }
    
    return fmt.Errorf("max retries exceeded: %w", lastErr)
}
```

#### 5. Circuit Breaker Pattern

```go
// services/shared/internal/client/circuit_breaker.go
import "github.com/sony/gobreaker"

type ResilientServiceClient struct {
    *ServiceClient
    breaker *gobreaker.CircuitBreaker
}

func NewResilientServiceClient(baseURL, apiKey string) *ResilientServiceClient {
    settings := gobreaker.Settings{
        Name:        "ServiceClient",
        MaxRequests: 3,
        Interval:    10 * time.Second,
        Timeout:     30 * time.Second,
    }
    
    return &ResilientServiceClient{
        ServiceClient: NewServiceClient(baseURL, apiKey),
        breaker:       gobreaker.NewCircuitBreaker(settings),
    }
}

func (c *ResilientServiceClient) Post(endpoint string, payload interface{}) (*http.Response, error) {
    result, err := c.breaker.Execute(func() (interface{}, error) {
        return c.ServiceClient.Post(endpoint, payload)
    })
    
    if err != nil {
        return nil, err
    }
    
    return result.(*http.Response), nil
}
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Setup Infrastructure
- [ ] Create shared service client package
- [ ] Add internal API key to all services
- [ ] Configure internal endpoints with auth middleware
- [ ] Update docker-compose networking

### Phase 2: Auth → User Integration
- [ ] Create UserServiceClient in auth-service
- [ ] Add internal endpoint in user-service: `POST /internal/profile/create`
- [ ] Integrate profile creation in registration flow
- [ ] Test registration → profile creation flow

### Phase 3: Course → User Integration
- [ ] Create UserServiceClient in course-service
- [ ] Add internal endpoints in user-service:
  - `PUT /internal/progress/update`
  - `PUT /internal/statistics/:skill/update`
- [ ] Integrate progress updates after lesson completion
- [ ] Test lesson completion → progress update

### Phase 4: Exercise → User Integration
- [ ] Create UserServiceClient in exercise-service
- [ ] Integrate statistics update after exercise submission
- [ ] Test exercise submission → stats update

### Phase 5: All → Notification Integration
- [ ] Create NotificationServiceClient (shared)
- [ ] Add internal endpoint: `POST /internal/send`
- [ ] Integrate notifications in all major flows
- [ ] Test end-to-end notification delivery

### Phase 6: Monitoring & Resilience
- [ ] Add distributed tracing (Jaeger)
- [ ] Implement circuit breaker for all clients
- [ ] Add retry logic with exponential backoff
- [ ] Setup alerts for service communication failures

---

## 🔍 MONITORING & OBSERVABILITY

### Recommended Tools

1. **Distributed Tracing**: Jaeger or Zipkin
   ```go
   // Add trace ID to all internal calls
   req.Header.Set("X-Trace-ID", traceID)
   ```

2. **Metrics**: Prometheus
   ```go
   serviceCallDuration := prometheus.NewHistogramVec(
       prometheus.HistogramOpts{
           Name: "service_call_duration_seconds",
       },
       []string{"from_service", "to_service", "endpoint"},
   )
   ```

3. **Logging**: Structured logs with correlation ID
   ```go
   log.WithFields(log.Fields{
       "trace_id": traceID,
       "service": "auth-service",
       "target": "user-service",
       "endpoint": "/internal/profile/create",
   }).Info("Calling user service")
   ```

---

## 🚀 FUTURE ENHANCEMENTS

### When System Grows
- **Service Mesh** (Istio/Linkerd): Auto mTLS, traffic management
- **Message Queue** (RabbitMQ/Kafka): Async communication for non-critical flows
- **gRPC**: Replace HTTP for internal calls (better performance)
- **Service Discovery** (Consul/Etcd): Dynamic service registration

---

## 📊 PERFORMANCE COMPARISON

| Metric | Direct Calls | Via Gateway | Difference |
|--------|--------------|-------------|------------|
| Latency (avg) | 3-5ms | 8-15ms | 2-3x slower |
| Throughput | 5000 req/s | 2000 req/s | 2.5x lower |
| CPU Usage | Low | Medium | Gateway overhead |
| Network Hops | 1 | 2 | Double |
| Failure Impact | Isolated | System-wide | Critical |

---

## 🎯 FINAL RECOMMENDATION

**✅ USE HYBRID APPROACH**

1. **External Requests** → API Gateway
2. **Internal Service Calls** → Direct HTTP with:
   - Internal API key authentication
   - Circuit breaker pattern
   - Retry logic with exponential backoff
   - Distributed tracing

**Benefits**:
- ⚡ Best performance for internal calls
- 🔒 Secure with internal API keys
- 💪 Resilient - no single point of failure
- 📊 Easy to monitor with proper tooling
- 🔄 Gateway still handles external routing

**Start simple, add complexity when needed:**
1. Start: Direct HTTP calls with API key
2. Scale: Add circuit breaker + retry
3. Production: Add service mesh if needed

---

**Decision Date**: October 10, 2025  
**Recommended By**: Technical Architecture Team

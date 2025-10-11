# Testing Internal Service Integration

## Tổng Quan

Document này hướng dẫn test các internal endpoints và service-to-service integration đã implement.

## Các Tính Năng Đã Hoàn Thành

### 1. User Service Internal Endpoints ✅
- `POST /api/v1/user/internal/profile/create` - Tạo profile cho user mới
- `PUT /api/v1/user/internal/progress/update` - Cập nhật learning progress
- `PUT /api/v1/user/internal/statistics/:skill/update` - Cập nhật skill statistics
- `POST /api/v1/user/internal/session/start` - Bắt đầu study session
- `PUT /api/v1/user/internal/session/:session_id/end` - Kết thúc study session

**Bảo Mật**: Tất cả endpoints yêu cầu header `X-Internal-API-Key`

### 2. Notification Service Internal Endpoints ✅
- `POST /api/v1/notifications/internal/send` - Gửi notification đơn lẻ
- `POST /api/v1/notifications/internal/bulk` - Gửi notification hàng loạt

**Bảo Mật**: Tất cả endpoints yêu cầu header `X-Internal-API-Key`

### 3. Auth Service Integration ✅
- Khi user đăng ký → tự động gọi User Service tạo profile
- Khi user đăng ký → tự động gửi welcome notification
- **Non-blocking**: Dùng goroutines, không fail registration nếu services khác lỗi

## Chuẩn Bị Test

### Yêu Cầu
```bash
# PostgreSQL phải đang chạy
pg_isready -h localhost -p 5432

# Hoặc nếu dùng Docker
docker-compose up -d postgres

# Đảm bảo đã tạo databases
psql -U ielts_admin -h localhost << EOF
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE notification_db;
EOF
```

### Chạy Migrations
```bash
# Auth DB
psql -U ielts_admin -h localhost -d auth_db -f database/schemas/01_auth_service.sql

# User DB
psql -U ielts_admin -h localhost -d user_db -f database/schemas/02_user_service.sql

# Notification DB
psql -U ielts_admin -h localhost -d notification_db -f database/schemas/06_notification_service.sql
```

## Cách Test

### Option 1: Test Tự Động (Recommended)

#### Bước 1: Start Services
```bash
./scripts/start-services-dev.sh
```

Này sẽ start:
- Auth Service: http://localhost:8081
- User Service: http://localhost:8082
- Notification Service: http://localhost:8085

#### Bước 2: Chạy Test Script (Terminal mới)
```bash
./scripts/test-internal-endpoints.sh
```

Script sẽ test:
1. ✅ User Service - Create Profile
2. ✅ User Service - Update Progress
3. ✅ User Service - Update Skill Statistics
4. ✅ User Service - Start Session
5. ✅ User Service - End Session
6. ✅ User Service - Auth Protection
7. ✅ Notification Service - Send Notification
8. ✅ Notification Service - Send Bulk
9. ✅ Notification Service - Auth Protection
10. ✅ Auth Service - Register User (End-to-End)

#### Bước 3: Kiểm Tra Database
```bash
# Xem tất cả records mới nhất
./scripts/check-db-records.sh

# Hoặc kiểm tra user cụ thể
./scripts/check-db-records.sh testuser@example.com
```

### Option 2: Test Thủ Công

#### Test User Service Internal Endpoint

```bash
# 1. Create Profile
curl -X POST http://localhost:8082/api/v1/user/internal/profile/create \
  -H "X-Internal-API-Key: internal_secret_key_ielts_2025_change_in_production" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com",
    "role": "student",
    "full_name": "Test User"
  }'

# Expected: {"success":true,"message":"Profile created successfully"}

# 2. Update Progress
curl -X PUT http://localhost:8082/api/v1/user/internal/progress/update \
  -H "X-Internal-API-Key: internal_secret_key_ielts_2025_change_in_production" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "lessons_completed": 1,
    "study_minutes": 30,
    "skill_type": "reading",
    "session_type": "lesson"
  }'

# Expected: {"success":true,"message":"Progress updated successfully"}

# 3. Update Skill Statistics
curl -X PUT http://localhost:8082/api/v1/user/internal/statistics/reading/update \
  -H "X-Internal-API-Key: internal_secret_key_ielts_2025_change_in_production" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "score": 85.5,
    "time_minutes": 25,
    "is_completed": true
  }'

# Expected: {"success":true,"message":"Skill statistics updated successfully"}

# 4. Test Auth Protection (should fail with 403)
curl -X POST http://localhost:8082/api/v1/user/internal/profile/create \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: {"error":"forbidden","message":"Internal API key is required","code":"AUTH_005"}
```

#### Test Notification Service Internal Endpoint

```bash
# 1. Send Single Notification
curl -X POST http://localhost:8085/api/v1/notifications/internal/send \
  -H "X-Internal-API-Key: internal_secret_key_ielts_2025_change_in_production" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Test Notification",
    "message": "This is a test message",
    "type": "system",
    "category": "info"
  }'

# Expected: {"success":true,"notification_id":"...","message":"Notification sent successfully"}

# 2. Send Bulk Notifications
curl -X POST http://localhost:8085/api/v1/notifications/internal/bulk \
  -H "X-Internal-API-Key: internal_secret_key_ielts_2025_change_in_production" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": [
      "550e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440000"
    ],
    "title": "Bulk Test",
    "message": "This is a bulk notification",
    "type": "system",
    "category": "info"
  }'

# Expected: {"success":true,"total":2,"success_count":2,"failed_count":0}
```

#### Test Auth Service Integration (End-to-End)

```bash
# Register a new user
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Test123456",
    "role": "student"
  }'

# Expected response includes user_id and tokens
# Behind the scenes:
# 1. Auth Service creates user in auth_db ✅
# 2. Auth Service calls User Service to create profile ✅
# 3. Auth Service calls Notification Service to send welcome email ✅
```

## Kiểm Tra Logs

### User Service Logs
```bash
# Should see:
[Internal] Successfully created profile for user <uuid>
[Internal] Successfully updated progress for user <uuid>
[Internal] Successfully updated skill statistics for user <uuid> (skill: reading)
```

### Notification Service Logs
```bash
# Should see:
[Internal] Successfully created notification <id> for user <uuid> (type: system, category: info)
[Internal] Bulk notification complete: 2 success, 0 failed out of 2 total
```

### Auth Service Logs
```bash
# Should see after registration:
[Auth-Service] Successfully created profile for user <uuid>
[Auth-Service] Successfully sent welcome notification to newuser@example.com
```

## Kiểm Tra Database

```bash
# Check auth_db
psql -U ielts_admin -h localhost -d auth_db -c "SELECT id, email, created_at FROM users ORDER BY created_at DESC LIMIT 5;"

# Check user_db - profiles
psql -U ielts_admin -h localhost -d user_db -c "SELECT user_id, email, full_name, created_at FROM user_profiles ORDER BY created_at DESC LIMIT 5;"

# Check user_db - progress
psql -U ielts_admin -h localhost -d user_db -c "SELECT user_id, total_lessons_completed, total_study_hours FROM learning_progress ORDER BY updated_at DESC LIMIT 5;"

# Check notification_db
psql -U ielts_admin -h localhost -d notification_db -c "SELECT user_id, type, title, created_at FROM notifications ORDER BY created_at DESC LIMIT 5;"
```

## Troubleshooting

### Services không start được
```bash
# Check ports đã bị chiếm chưa
lsof -i :8081  # Auth
lsof -i :8082  # User
lsof -i :8085  # Notification

# Kill processes nếu cần
kill -9 <PID>
```

### Database connection failed
```bash
# Verify PostgreSQL đang chạy
pg_isready -h localhost -p 5432

# Check credentials
psql -U ielts_admin -h localhost -d auth_db -c "SELECT 1;"
```

### Internal API calls fail với 403
```bash
# Verify API key match trong tất cả services
# File: services/*/internal/config/config.go
# Default: internal_secret_key_ielts_2025_change_in_production

# Hoặc set environment variable
export INTERNAL_API_KEY="your_key_here"
```

### Profile không được tạo sau registration
```bash
# Check User Service logs
# Should see: [Auth-Service] Successfully created profile for user...

# If warning: Failed to create user profile
# → User Service không chạy hoặc URL sai
# → Check USER_SERVICE_URL environment variable
```

### Notification không được gửi
```bash
# Check Notification Service logs
# Should see: [Auth-Service] Successfully sent welcome notification...

# If warning: Failed to send welcome notification
# → Notification Service không chạy hoặc URL sai
# → Check NOTIFICATION_SERVICE_URL environment variable
```

## Next Steps

Sau khi test pass:
1. ✅ Integrate Course Service (lesson completion → update progress)
2. ✅ Integrate Exercise Service (grading → update statistics)
3. ✅ Update docker-compose.yml với environment variables
4. ✅ End-to-end testing với tất cả services

## Security Notes

⚠️ **QUAN TRỌNG**:
- `INTERNAL_API_KEY` hiện tại là default value
- Trong production, PHẢI thay đổi key này
- Không commit key vào git
- Dùng environment variables hoặc secrets management

```bash
# Generate secure key
openssl rand -hex 32

# Set trong production environment
export INTERNAL_API_KEY="<generated_key>"
```

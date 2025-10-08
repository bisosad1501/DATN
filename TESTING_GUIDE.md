# 🧪 Testing Guide - Auth Service APIs

## Setup đã hoàn thành ✅

Hệ thống đã được cấu hình sẵn sàng để test:
- ✅ PostgreSQL với 6 databases
- ✅ Redis cache
- ✅ RabbitMQ message queue
- ✅ Auth Service đang chạy trên port 8081
- ✅ PgAdmin để quản lý database

## Quick Test với cURL

### 1. Health Check
```bash
curl http://localhost:8081/health
```

**Expected Response:**
```json
{
    "success": true,
    "data": {
        "service": "auth-service",
        "status": "healthy"
    }
}
```

### 2. Register Student
```bash
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@test.com",
    "password": "Test@123456",
    "phone": "+84987654321",
    "role": "student"
  }'
```

**Expected Response:**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "uuid-here",
            "email": "student1@test.com",
            "phone": "+84987654321",
            "is_active": true,
            "is_verified": false,
            "role": "student"
        },
        "access_token": "eyJhbGciOiJIUzI1NiIs...",
        "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
        "expires_in": 86400
    }
}
```

### 3. Login
```bash
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@test.com",
    "password": "Test@123456"
  }'
```

### 4. Validate Token
```bash
# Replace TOKEN with actual access token from register/login
curl http://localhost:8081/api/v1/auth/validate \
  -H "Authorization: Bearer TOKEN"
```

### 5. Refresh Token
```bash
# Replace REFRESH_TOKEN with actual refresh token
curl -X POST http://localhost:8081/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "REFRESH_TOKEN"
  }'
```

### 6. Change Password
```bash
curl -X POST http://localhost:8081/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "old_password": "Test@123456",
    "new_password": "NewTest@123456"
  }'
```

### 7. Logout
```bash
curl -X POST http://localhost:8081/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "refresh_token": "REFRESH_TOKEN"
  }'
```

---

## Test với Postman

### Import Collection
```bash
# Collection và Environment đã có sẵn trong folder postman/
# Import 2 files:
- IELTS_Platform_API.postman_collection.json
- IELTS_Platform_Local.postman_environment.json
```

### Chạy Test Sequence
1. **Health Check** - Kiểm tra service đang chạy
2. **Register Student** - Tạo tài khoản học viên
   - Email tự động generate với timestamp
   - Token tự động lưu vào environment
3. **Login** - Đăng nhập với tài khoản vừa tạo
4. **Validate Token** - Kiểm tra token hợp lệ
5. **Refresh Token** - Làm mới token
6. **Change Password** - Đổi mật khẩu
7. **Logout** - Đăng xuất

### Automated Scripts
Collection có sẵn automated scripts:
- ✅ Auto-generate random email
- ✅ Auto-save tokens
- ✅ Auto-refresh expired tokens
- ✅ Response validation
- ✅ Performance checks

---

## Verify với Database

### 1. Kết nối PgAdmin
```
URL: http://localhost:5050
Email: admin@ielts.local
Password: admin_password
```

### 2. Thêm PostgreSQL Server
```
Host: postgres
Port: 5432
Username: ielts_admin
Password: ielts_password_2025
```

### 3. Kiểm tra Tables

**Users Table:**
```sql
SELECT id, email, phone, is_active, is_verified, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

**User Roles:**
```sql
SELECT u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.created_at DESC;
```

**Refresh Tokens:**
```sql
SELECT rt.user_id, u.email, rt.is_revoked, rt.expires_at
FROM refresh_tokens rt
JOIN users u ON rt.user_id = u.id
WHERE rt.is_revoked = false
ORDER BY rt.created_at DESC;
```

**Audit Logs:**
```sql
SELECT al.action, al.entity_type, u.email, al.ip_address, al.created_at
FROM audit_logs al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 20;
```

---

## Test Scenarios

### Scenario 1: User Registration Flow
1. ✅ Register with valid data → Success (200)
2. ✅ Register with same email → Error (400)
3. ✅ Register with weak password → Error (400)
4. ✅ Register with invalid email → Error (400)
5. ✅ Register with invalid role → Error (400)

### Scenario 2: Login Flow
1. ✅ Login with correct credentials → Success (200)
2. ✅ Login with wrong password → Error (401)
3. ✅ Login with non-existent email → Error (401)
4. ✅ Login 5 times wrong → Account locked (423)

### Scenario 3: Token Management
1. ✅ Use valid access token → Success (200)
2. ✅ Use expired access token → Error (401)
3. ✅ Refresh with valid refresh token → New tokens (200)
4. ✅ Refresh with revoked token → Error (401)
5. ✅ Use token after logout → Error (401)

### Scenario 4: Password Management
1. ✅ Change with correct old password → Success (200)
2. ✅ Change with wrong old password → Error (401)
3. ✅ Change to weak new password → Error (400)

---

## Expected API Behaviors

### Success Responses (200)
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... }
}
```

### Error Responses (4xx, 5xx)
```json
{
    "success": false,
    "message": "Error message",
    "error": {
        "code": "ERROR_CODE",
        "details": "Detailed error information"
    }
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `423` - Locked (account locked after failed attempts)
- `500` - Internal Server Error

---

## Performance Benchmarks

Expected response times:
- Health Check: < 50ms
- Register: < 300ms
- Login: < 200ms
- Validate Token: < 100ms
- Refresh Token: < 150ms
- Change Password: < 250ms
- Logout: < 100ms

---

## Debugging Tips

### Check Service Logs
```bash
docker-compose logs -f auth-service
```

### Check Database Connection
```bash
docker exec ielts_postgres psql -U ielts_admin -d auth_db -c "\dt"
```

### Check Redis Connection
```bash
docker exec ielts_redis redis-cli -a ielts_redis_password ping
```

### Restart Service
```bash
docker-compose restart auth-service
```

### View All Containers
```bash
docker-compose ps
```

---

## Troubleshooting

### Problem: "Connection refused"
**Solution:** Check if service is running
```bash
docker-compose ps
curl http://localhost:8081/health
```

### Problem: "Database does not exist"
**Solution:** Database auto-created on first start. Check logs:
```bash
docker-compose logs postgres
docker exec ielts_postgres psql -U ielts_admin -l
```

### Problem: "Token invalid"
**Solution:** Token might be expired. Use refresh token or login again.

### Problem: "Account locked"
**Solution:** Too many failed login attempts. Wait or reset in database:
```sql
UPDATE users SET is_locked = false, failed_login_attempts = 0 
WHERE email = 'user@email.com';
```

---

## Next Steps

1. ✅ Test all Auth Service endpoints
2. ⏳ Implement User Service
3. ⏳ Implement Course Service  
4. ⏳ Implement Exercise Service
5. ⏳ Implement AI Service
6. ⏳ Implement Notification Service
7. ⏳ Implement API Gateway

---

## Resources

- [Postman Collection](./postman/IELTS_Platform_API.postman_collection.json)
- [API Documentation](./docs/API_ENDPOINTS.md)
- [Database Schemas](./database/schemas/)
- [Team Setup Guide](./TEAM_SETUP.md)

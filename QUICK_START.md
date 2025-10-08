# 🚀 Quick Start Guide - IELTS Learning Platform

## Yêu cầu hệ thống

- **Docker**: >= 20.10
- **Docker Compose**: >= 2.0
- **Git**: >= 2.30
- **Go**: >= 1.21 (để develop services)
- **Minimum RAM**: 4GB (8GB recommended)
- **Disk Space**: 10GB

---

## Bước 1: Clone Repository

```bash
git clone <repository-url>
cd DATN
```

---

## Bước 2: Cấu hình Environment

```bash
# Copy file environment mẫu
cp .env.example .env

# Chỉnh sửa .env với text editor
nano .env  # hoặc vim, code, etc.
```

**Quan trọng**: Thay đổi các giá trị sau trong production:
- `JWT_SECRET`
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `RABBITMQ_PASSWORD`
- `OPENAI_API_KEY` (nếu dùng AI)
- `FCM_SERVER_KEY` (nếu dùng push notifications)

---

## Bước 3: Khởi động Database & Infrastructure

```bash
# Khởi động PostgreSQL, Redis, RabbitMQ
docker-compose up -d postgres redis rabbitmq pgadmin

# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs -f postgres
```

Đợi khoảng 30 giây để databases khởi tạo xong.

---

## Bước 4: Kiểm tra Database

### Truy cập PgAdmin
- URL: http://localhost:5050
- Email: `admin@ielts.local`
- Password: `admin_password`

### Kết nối đến PostgreSQL trong PgAdmin:
1. Click "Add New Server"
2. General Tab:
   - Name: `IELTS PostgreSQL`
3. Connection Tab:
   - Host: `postgres`
   - Port: `5432`
   - Username: `ielts_admin`
   - Password: `ielts_password_2025`

### Kiểm tra databases đã được tạo:
- auth_db
- user_db
- course_db
- exercise_db
- ai_db
- notification_db

---

## Bước 5: Verify Database Schemas

```bash
# Connect to PostgreSQL container
docker exec -it ielts_postgres psql -U ielts_admin -d auth_db

# List tables
\dt

# Check a table
\d users

# Exit
\q
```

Hoặc dùng PgAdmin để xem tables.

---

## Bước 6: Setup Go Project Structure

```bash
# Tạo cấu trúc thư mục cho services
mkdir -p api-gateway/cmd api-gateway/internal
mkdir -p services/auth-service/cmd services/auth-service/internal
mkdir -p services/user-service/cmd services/user-service/internal
mkdir -p services/course-service/cmd services/course-service/internal
mkdir -p services/exercise-service/cmd services/exercise-service/internal
mkdir -p services/ai-service/cmd services/ai-service/internal
mkdir -p services/notification-service/cmd services/notification-service/internal
mkdir -p shared/database shared/middleware shared/utils
```

---

## Bước 7: Initialize Go Modules

```bash
# API Gateway
cd api-gateway
go mod init github.com/bisosad1501/DATN/api-gateway
cd ..

# Auth Service
cd services/auth-service
go mod init github.com/bisosad1501/DATN/services/auth-service
cd ../..

# User Service
cd services/user-service
go mod init github.com/bisosad1501/DATN/services/user-service
cd ../..

# Course Service
cd services/course-service
go mod init github.com/bisosad1501/DATN/services/course-service
cd ../..

# Exercise Service
cd services/exercise-service
go mod init github.com/bisosad1501/DATN/services/exercise-service
cd ../..

# AI Service
cd services/ai-service
go mod init github.com/bisosad1501/DATN/services/ai-service
cd ../..

# Notification Service
cd services/notification-service
go mod init github.com/bisosad1501/DATN/services/notification-service
cd ../..

# Shared package
cd shared
go mod init github.com/bisosad1501/DATN/shared
cd ..
```

---

## Bước 8: Install Go Dependencies

Mỗi service sẽ cần các dependencies sau:

```bash
# Common dependencies cho tất cả services
go get -u github.com/gin-gonic/gin
go get -u github.com/lib/pq
go get -u github.com/jmoiron/sqlx
go get -u github.com/go-redis/redis/v8
go get -u github.com/streadway/amqp
go get -u github.com/golang-jwt/jwt/v5
go get -u github.com/joho/godotenv
go get -u golang.org/x/crypto/bcrypt
go get -u github.com/google/uuid
go get -u github.com/sirupsen/logrus
```

---

## Bước 9: Test Infrastructure

### Test PostgreSQL
```bash
docker exec -it ielts_postgres psql -U ielts_admin -d auth_db -c "SELECT COUNT(*) FROM roles;"
```

Expected output: 3 roles (student, instructor, admin)

### Test Redis
```bash
docker exec -it ielts_redis redis-cli -a ielts_redis_password ping
```

Expected output: `PONG`

### Test RabbitMQ
- URL: http://localhost:15672
- Username: `ielts_admin`
- Password: `ielts_rabbitmq_password`

---

## Bước 10: Build & Run Services (Sau khi code xong)

```bash
# Build tất cả services
docker-compose build

# Khởi động tất cả services
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f

# Kiểm tra health của services
curl http://localhost:8080/health
curl http://localhost:8081/health
curl http://localhost:8082/health
```

---

## Cấu trúc Project

```
DATN/
├── api-gateway/
│   ├── cmd/
│   │   └── main.go
│   ├── internal/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   └── routes/
│   ├── Dockerfile
│   └── go.mod
│
├── services/
│   ├── auth-service/
│   │   ├── cmd/
│   │   │   └── main.go
│   │   ├── internal/
│   │   │   ├── handlers/
│   │   │   ├── models/
│   │   │   ├── repository/
│   │   │   ├── service/
│   │   │   └── routes/
│   │   ├── Dockerfile
│   │   └── go.mod
│   │
│   ├── user-service/
│   ├── course-service/
│   ├── exercise-service/
│   ├── ai-service/
│   └── notification-service/
│
├── shared/
│   ├── config/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── utils/
│   └── go.mod
│
├── database/
│   ├── schemas/
│   │   ├── 01_auth_service.sql
│   │   ├── 02_user_service.sql
│   │   ├── 03_course_service.sql
│   │   ├── 04_exercise_service.sql
│   │   ├── 05_ai_service.sql
│   │   └── 06_notification_service.sql
│   ├── init/
│   │   └── 01-init-databases.sh
│   └── README.md
│
├── docs/
│   └── API_ENDPOINTS.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Useful Commands

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart auth-service

# View logs
docker-compose logs -f [service_name]

# Remove all data (CAUTION!)
docker-compose down -v

# Rebuild a service
docker-compose build auth-service
docker-compose up -d auth-service
```

### Database Commands

```bash
# Backup all databases
docker exec ielts_postgres pg_dumpall -U ielts_admin > backup_$(date +%Y%m%d).sql

# Backup specific database
docker exec ielts_postgres pg_dump -U ielts_admin auth_db > backup_auth.sql

# Restore database
docker exec -i ielts_postgres psql -U ielts_admin -d auth_db < backup_auth.sql

# Access PostgreSQL CLI
docker exec -it ielts_postgres psql -U ielts_admin -d auth_db
```

### Redis Commands

```bash
# Access Redis CLI
docker exec -it ielts_redis redis-cli -a ielts_redis_password

# Clear all cache
docker exec -it ielts_redis redis-cli -a ielts_redis_password FLUSHALL

# Monitor Redis
docker exec -it ielts_redis redis-cli -a ielts_redis_password MONITOR
```

---

## Troubleshooting

### Problem: Database not initializing
```bash
# Check logs
docker-compose logs postgres

# Restart with fresh data
docker-compose down -v
docker-compose up -d postgres
```

### Problem: Port already in use
```bash
# Find process using port
lsof -i :8080
# or
netstat -ano | grep 8080

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Problem: Service cannot connect to database
```bash
# Check network
docker network ls
docker network inspect datn_ielts_network

# Check if database is ready
docker-compose ps postgres
docker-compose logs postgres
```

### Problem: Out of memory
```bash
# Check Docker resource usage
docker stats

# Increase Docker memory limit in Docker Desktop settings
# Or stop unnecessary containers
docker-compose down
docker-compose up -d postgres redis rabbitmq
```

---

## Next Steps

1. ✅ Infrastructure setup hoàn tất
2. 🔜 Implement Auth Service
3. 🔜 Implement User Service
4. 🔜 Implement Course Service
5. 🔜 Implement Exercise Service
6. 🔜 Implement AI Service
7. 🔜 Implement Notification Service
8. 🔜 Implement API Gateway
9. 🔜 Write tests
10. 🔜 Setup CI/CD

---

## Resources

- **Go Documentation**: https://go.dev/doc/
- **Gin Framework**: https://gin-gonic.com/docs/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Docker Compose**: https://docs.docker.com/compose/
- **IELTS Scoring**: https://www.ielts.org/

---

## Support

Nếu gặp vấn đề, hãy:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure ports are not in use
4. Check Docker resources (memory, disk space)

---

Happy Coding! 🚀

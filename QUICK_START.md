# 🚀 Quick Start Guide - IELTS Platform# 🚀 Quick Start Guide - IELTS Learning Platform



## 📋 Tóm tắt nhanh## Yêu cầu hệ thống



```bash- **Docker**: >= 20.10

# MỚI: Cài đặt lần đầu (1 lệnh)- **Docker Compose**: >= 2.0

./setup.sh- **Git**: >= 2.30

- **Go**: >= 1.21 (để develop services)

# CŨ: Update sau khi pull code (1 lệnh)  - **Minimum RAM**: 4GB (8GB recommended)

./update.sh- **Disk Space**: 10GB



# Test tất cả---

./scripts/test-all.sh

```## Bước 1: Clone Repository



---```bash

git clone <repository-url>

## 🎯 Scenario 1: Developer Mới (Lần Đầu Setup)cd DATN

```

### Chuẩn bị

1. Cài Docker Desktop: https://www.docker.com/products/docker-desktop---

2. Clone project:

```bash## Bước 2: Cấu hình Environment

git clone https://github.com/bisosad1501/DATN.git

cd DATN```bash

```# Copy file environment mẫu

cp .env.example .env

### Setup tự động

```bash# Chỉnh sửa .env với text editor

chmod +x setup.shnano .env  # hoặc vim, code, etc.

./setup.sh```

```

**Quan trọng**: Thay đổi các giá trị sau trong production:

✅ **Xong!** Script tự động làm tất cả:- `JWT_SECRET`

- Kiểm tra Docker- `POSTGRES_PASSWORD`

- Tạo .env- `REDIS_PASSWORD`

- Build images- `RABBITMQ_PASSWORD`

- Start services- `OPENAI_API_KEY` (nếu dùng AI)

- Chạy migrations- `FCM_SERVER_KEY` (nếu dùng push notifications)



⏱️ **Thời gian**: ~5-8 phút (lần đầu)---



---## Bước 3: Khởi động Database & Infrastructure



## 🔄 Scenario 2: Developer Đã Có Code (Pull Update)```bash

# Khởi động PostgreSQL, Redis, RabbitMQ

```bashdocker-compose up -d postgres redis rabbitmq pgadmin

# Bước 1: Pull code mới

git pull origin main# Kiểm tra status

docker-compose ps

# Bước 2: Update tự động

chmod +x update.sh# Xem logs

./update.shdocker-compose logs -f postgres

``````



✅ **Xong!** Script tự động:Đợi khoảng 30 giây để databases khởi tạo xong.

- Rebuild services thay đổi

- Chạy migrations mới---

- Restart services

## Bước 4: Kiểm tra Database

⏱️ **Thời gian**: ~2-3 phút

### Truy cập PgAdmin

---- URL: http://localhost:5050

- Email: `admin@ielts.local`

## 🧪 Testing- Password: `admin_password`



### Chạy tất cả tests### Kết nối đến PostgreSQL trong PgAdmin:

```bash1. Click "Add New Server"

chmod +x scripts/test-all.sh2. General Tab:

./scripts/test-all.sh   - Name: `IELTS PostgreSQL`

```3. Connection Tab:

   - Host: `postgres`

### Test từng service   - Port: `5432`

```bash   - Username: `ielts_admin`

# Course Service - 10 tests   - Password: `ielts_password_2025`

./scripts/test-course-fixes.sh

### Kiểm tra databases đã được tạo:

# Exercise Service - 7 tests- auth_db

./scripts/test-exercise-fixes.sh- user_db

- course_db

# User Service - 11 tests- exercise_db

./scripts/test-user-service-comprehensive.sh- ai_db

```- notification_db



------



## 📊 Service URLs## Bước 5: Verify Database Schemas



| Service | URL | Credentials |```bash

|---------|-----|------------|# Connect to PostgreSQL container

| API Gateway | http://localhost:8080 | - |docker exec -it ielts_postgres psql -U ielts_admin -d auth_db

| Auth Service | http://localhost:8081 | - |

| User Service | http://localhost:8082 | - |# List tables

| Course Service | http://localhost:8083 | - |\dt

| Exercise Service | http://localhost:8084 | - |

| PgAdmin | http://localhost:5050 | admin@ielts.com / admin123 |# Check a table

| RabbitMQ | http://localhost:15672 | ielts_user / ielts_rabbitmq_password |\d users



---# Exit

\q

## 🔧 Commands Thường Dùng```



```bashHoặc dùng PgAdmin để xem tables.

# Xem logs tất cả

docker-compose logs -f---



# Xem logs 1 service## Bước 6: Setup Go Project Structure

docker logs -f ielts_course_service

```bash

# Restart service# Tạo cấu trúc thư mục cho services

docker-compose restart course-servicemkdir -p api-gateway/cmd api-gateway/internal

mkdir -p services/auth-service/cmd services/auth-service/internal

# Rebuild servicemkdir -p services/user-service/cmd services/user-service/internal

docker-compose up -d --build course-servicemkdir -p services/course-service/cmd services/course-service/internal

mkdir -p services/exercise-service/cmd services/exercise-service/internal

# Stop tất cảmkdir -p services/ai-service/cmd services/ai-service/internal

docker-compose downmkdir -p services/notification-service/cmd services/notification-service/internal

mkdir -p shared/database shared/middleware shared/utils

# Stop và xóa data```

docker-compose down -v

---

# Check health

curl http://localhost:8080/health## Bước 7: Initialize Go Modules

```

```bash

---# API Gateway

cd api-gateway

## 🐛 Troubleshootinggo mod init github.com/bisosad1501/DATN/api-gateway

cd ..

### Port đã được sử dụng

```bash# Auth Service

# Tìm process đang dùng portcd services/auth-service

lsof -i :8080go mod init github.com/bisosad1501/DATN/services/auth-service

cd ../..

# Kill process

kill -9 <PID># User Service

```cd services/user-service

go mod init github.com/bisosad1501/DATN/services/user-service

### Service unhealthycd ../..

```bash

# Check logs# Course Service

docker logs ielts_course_servicecd services/course-service

go mod init github.com/bisosad1501/DATN/services/course-service

# Restartcd ../..

docker-compose restart course-service

```# Exercise Service

cd services/exercise-service

### Migration lỗigo mod init github.com/bisosad1501/DATN/services/exercise-service

```bashcd ../..

# Re-run migrations

docker-compose up migrations# AI Service

cd services/ai-service

# Check migration logsgo mod init github.com/bisosad1501/DATN/services/ai-service

docker logs ielts_migrationscd ../..

```

# Notification Service

### Reset toàn bộcd services/notification-service

```bashgo mod init github.com/bisosad1501/DATN/services/notification-service

# Stop và xóa tất cảcd ../..

docker-compose down -v

# Shared package

# Chạy lại setupcd shared

./setup.shgo mod init github.com/bisosad1501/DATN/shared

```cd ..

```

---

---

## 📚 Docs Liên Quan

## Bước 8: Install Go Dependencies

- [Full Documentation](./TEAM_SETUP.md) - Chi tiết đầy đủ

- [API Endpoints](./docs/API_ENDPOINTS.md) - Tất cả APIsMỗi service sẽ cần các dependencies sau:

- [Testing Guide](./TESTING_GUIDE.md) - Hướng dẫn testing

- [Course Service Fixes](./docs/COURSE_SERVICE_FIXES_REPORT.md) - Business logic fixes```bash

- [Exercise Service Issues](./docs/EXERCISE_SERVICE_ISSUES.md) - Known issues & fixes# Common dependencies cho tất cả services

go get -u github.com/gin-gonic/gin

---go get -u github.com/lib/pq

go get -u github.com/jmoiron/sqlx

## 💡 Best Practicesgo get -u github.com/go-redis/redis/v8

go get -u github.com/streadway/amqp

1. **Luôn pull code trước khi làm việc**go get -u github.com/golang-jwt/jwt/v5

   ```bashgo get -u github.com/joho/godotenv

   git pull origin maingo get -u golang.org/x/crypto/bcrypt

   ./update.shgo get -u github.com/google/uuid

   ```go get -u github.com/sirupsen/logrus

```

2. **Check service health thường xuyên**

   ```bash---

   docker-compose ps

   ```## Bước 9: Test Infrastructure



3. **Chạy tests trước khi commit**### Test PostgreSQL

   ```bash```bash

   ./scripts/test-all.shdocker exec -it ielts_postgres psql -U ielts_admin -d auth_db -c "SELECT COUNT(*) FROM roles;"

   ``````



4. **Clean up định kỳ**Expected output: 3 roles (student, instructor, admin)

   ```bash

   docker system prune -a### Test Redis

   ``````bash

docker exec -it ielts_redis redis-cli -a ielts_redis_password ping

---```



## ❓ Need Help?Expected output: `PONG`



- Issues: https://github.com/bisosad1501/DATN/issues### Test RabbitMQ

- Check logs: `docker-compose logs -f <service>`- URL: http://localhost:15672

- Contact team lead- Username: `ielts_admin`

- Password: `ielts_rabbitmq_password`

---

---

**🎉 Chúc code vui vẻ!**

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

# 🚀 Setup Nhanh cho Team Members

## Yêu cầu

- **Docker Desktop** đã cài đặt và đang chạy
- **Git** đã cài đặt
- **Make** (có sẵn trên macOS/Linux, Windows cần cài thêm)

---

## Setup trong 3 bước đơn giản

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd DATN
```

### Bước 2: Khởi động hệ thống

```bash
make start
```

Lệnh này sẽ tự động:
- ✅ Tạo file `.env` từ template
- ✅ Cấp quyền thực thi cho các scripts
- ✅ Build và khởi động tất cả services
- ✅ Khởi tạo databases
- ✅ Chạy migrations

**Lần đầu có thể mất 5-10 phút để build images.**

### Bước 3: Kiểm tra

Sau khi khởi động xong, truy cập:

- **PgAdmin** (quản lý DB): http://localhost:5050
  - Email: `admin@ielts.com`
  - Password: `admin123`

- **RabbitMQ Management**: http://localhost:15672
  - Username: `admin`
  - Password: `admin123`

- **Auth Service API**: http://localhost:8001/health

---

## Các lệnh hữu ích

```bash
# Xem trạng thái các services
make status

# Xem logs realtime
make logs

# Dừng hệ thống
make stop

# Khởi động lại
make restart

# Dọn dẹp hoàn toàn (xóa data)
make clean
```

---

## Troubleshooting

### ❌ Lỗi "port already in use"

Một service khác đang dùng port. Dừng service đó hoặc thay đổi port trong `docker-compose.yml`:

```bash
# Kiểm tra process đang dùng port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8001  # Auth Service
```

### ❌ Lỗi "permission denied"

Cấp quyền thực thi cho scripts:

```bash
chmod +x database/init/*.sh
```

### ❌ Lỗi "database does not exist"

Khởi động lại PostgreSQL để chạy lại init scripts:

```bash
docker-compose restart postgres
```

### ❌ Lỗi "cannot connect to docker daemon"

Đảm bảo Docker Desktop đang chạy:

```bash
# macOS
open -a Docker

# Linux
sudo systemctl start docker
```

### ❌ Services không khởi động

Kiểm tra logs:

```bash
# Xem logs của service cụ thể
docker-compose logs auth-service
docker-compose logs postgres

# Xem logs tất cả
make logs
```

---

## Test API với Postman

1. Import collection từ `postman/IELTS_Platform_API.postman_collection.json`
2. Import environment từ `postman/IELTS_Platform_Local.postman_environment.json`
3. Chọn environment `Local`
4. Chạy collection

---

## Development Workflow

### Làm việc với code

```bash
# Pull code mới nhất
git pull origin main

# Rebuild service sau khi sửa code
docker-compose up -d --build auth-service

# Xem logs của service vừa rebuild
docker-compose logs -f auth-service
```

### Thêm dependencies mới

```bash
# Vào container của service
docker-compose exec auth-service sh

# Thêm package
go get <package-name>

# Exit và rebuild
exit
docker-compose up -d --build auth-service
```

### Reset database

```bash
# Xóa volume và khởi động lại
docker-compose down -v
docker-compose up -d postgres

# Chờ 30 giây để init script chạy
sleep 30
docker-compose up -d
```

---

## Environment Configuration

File `.env` đã được tạo tự động với cấu hình development mặc định.

**⚠️ LƯU Ý**: Không commit file `.env` lên Git!

Nếu cần thay đổi cấu hình:

```bash
# Mở file .env
nano .env

# Hoặc dùng editor khác
code .env
```

Sau khi thay đổi, restart services:

```bash
make restart
```

---

## Cấu trúc thư mục quan trọng

```
DATN/
├── Makefile                 # Các lệnh tiện ích
├── docker-compose.yml       # Cấu hình services
├── .env                     # Environment variables (không commit)
├── database/
│   ├── init/               # Scripts khởi tạo DB
│   └── schemas/            # Database schemas
├── services/
│   ├── auth-service/       # Service xác thực
│   ├── user-service/       # Service người dùng
│   └── ...                 # Các services khác
└── postman/                # Postman collection
```

---

## Khi gặp vấn đề

1. **Đọc error message** trong logs
2. **Check trạng thái** services: `make status`
3. **Restart** service có vấn đề: `docker-compose restart <service-name>`
4. **Hỏi team** nếu không giải quyết được

---

## Useful Docker Commands

```bash
# Xem containers đang chạy
docker ps

# Vào shell của container
docker-compose exec <service-name> sh

# Xem resource usage
docker stats

# Dọn dẹp docker (khi thiếu space)
docker system prune -a

# Rebuild từ đầu (không cache)
docker-compose build --no-cache
```

---

## Next Steps

Sau khi setup xong:

1. ✅ Test API endpoints với Postman
2. ✅ Đọc docs trong `docs/` folder
3. ✅ Xem database schema trong `database/schemas/`
4. ✅ Bắt đầu develop!

Happy coding! 🎉

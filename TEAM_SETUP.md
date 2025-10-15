# 🚀 Setup Nhanh cho Team Members

## Yêu cầu

### Backend
- **Docker Desktop** đã cài đặt và đang chạy
- **Git** đã cài đặt
- **Make** (có sẵn trên macOS/Linux, Windows cần cài thêm)

### Frontend
- **Node.js 18+** (recommended: 20.x LTS)
- **pnpm** (hoặc npm/yarn)

---

## 🎯 Setup Full Stack (Backend + Frontend)

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd DATN
```

### Bước 2: Setup Backend

```bash
# Tự động setup tất cả
chmod +x setup.sh
./setup.sh

# Hoặc dùng Make
make start
```

Lệnh này sẽ tự động:
- ✅ Tạo file `.env` từ template
- ✅ Cấp quyền thực thi cho các scripts
- ✅ Build và khởi động tất cả services
- ✅ Khởi tạo databases
- ✅ Chạy migrations

**Lần đầu có thể mất 5-10 phút để build images.**

### Bước 3: Setup Frontend

```bash
cd Frontend-IELTSGo
./setup-frontend.sh
```

Script sẽ tự động:
- ✅ Kiểm tra Node.js version
- ✅ Cài đặt pnpm (nếu cần)
- ✅ Tạo `.env.local` từ template
- ✅ Install dependencies
- ✅ Kiểm tra backend connection

### Bước 4: Chạy Frontend

```bash
pnpm dev
```

Hoặc từ thư mục root:
```bash
make dev-frontend
```

### Bước 5: Kiểm tra

Sau khi khởi động xong, truy cập:

**Frontend & Backend:**
- **Frontend App**: http://localhost:3000
- **Backend API Gateway**: http://localhost:8080

**Admin Tools:**
- **PgAdmin** (quản lý DB): http://localhost:5050
  - Email: `admin@ielts.com`
  - Password: `admin123`

- **RabbitMQ Management**: http://localhost:15672
  - Username: `admin`
  - Password: `admin123`

---

## 🚀 Setup Chỉ Backend

Nếu chỉ làm việc với Backend:

```bash
# Clone và setup
git clone <repository-url>
cd DATN
make start

# Kiểm tra
make status
```

---

## 🎨 Setup Chỉ Frontend

Nếu chỉ làm việc với Frontend (Backend đã chạy):

```bash
# Clone repository
git clone <repository-url>
cd DATN/Frontend-IELTSGo

# Setup tự động
./setup-frontend.sh

# Start dev server
pnpm dev
```

**Chi tiết:** Xem [Frontend-IELTSGo/QUICK_START.md](./Frontend-IELTSGo/QUICK_START.md)

---

## 🛠️ Các lệnh hữu ích

### Backend Commands

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

# Kiểm tra health
make health
```

### Frontend Commands

```bash
# Từ thư mục Frontend-IELTSGo/

# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Full Stack Commands

```bash
# Từ thư mục root

# Setup frontend
make setup-frontend

# Start frontend dev server
make dev-frontend

# Start cả backend và frontend
make dev-all
```

---

## 🐛 Troubleshooting

### Backend Issues

#### ❌ Lỗi "port already in use"

Một service khác đang dùng port. Dừng service đó hoặc thay đổi port trong `docker-compose.yml`:

```bash
# Kiểm tra process đang dùng port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
lsof -i :8080  # API Gateway
lsof -i :8001  # Auth Service
```

#### ❌ Lỗi "permission denied"

Cấp quyền thực thi cho scripts:

```bash
chmod +x database/init/*.sh
chmod +x setup.sh
chmod +x update.sh
```

#### ❌ Lỗi "database does not exist"

Khởi động lại PostgreSQL để chạy lại init scripts:

```bash
docker-compose restart postgres
```

### Frontend Issues

#### ❌ Backend không kết nối được

Kiểm tra backend có chạy không:
```bash
curl http://localhost:8080/api/v1/health
```

Nếu chưa chạy:
```bash
cd .. && make start
```

#### ❌ Port 3000 đã được sử dụng

Kill process hoặc dùng port khác:
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Hoặc dùng port khác
PORT=3001 pnpm dev
```

#### ❌ Dependencies không cài được

Xóa và cài lại:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### ❌ Lỗi TypeScript

Xóa cache và rebuild:
```bash
rm -rf .next
pnpm dev
```

#### ❌ Lỗi ".env.local not found"

Tạo file từ template:
```bash
cp .env.local.example .env.local
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

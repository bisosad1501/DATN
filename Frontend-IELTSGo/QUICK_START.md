# 🚀 Frontend Quick Start Guide

## Dành cho Team Members mới

### Prerequisites
- ✅ Node.js 18+ (recommended: 20.x LTS)
- ✅ pnpm (hoặc npm/yarn)
- ✅ Backend services đang chạy

---

## 🎯 Setup Nhanh (3 Bước)

### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd DATN
```

### Bước 2: Setup Frontend
```bash
cd Frontend-IELTSGo
./setup-frontend.sh
```

**Script sẽ tự động:**
- ✅ Kiểm tra Node.js version
- ✅ Cài đặt pnpm (nếu chưa có)
- ✅ Tạo file `.env.local` từ template
- ✅ Install dependencies
- ✅ Kiểm tra backend connection

### Bước 3: Chạy Dev Server
```bash
pnpm dev
```

**Mở trình duyệt:** http://localhost:3000

---

## 🔧 Chi tiết Setup

### 1. Kiểm tra Node.js
```bash
node -v  # Phải >= 18.0.0
```

Nếu chưa có Node.js, tải tại: https://nodejs.org/

### 2. Cài đặt pnpm (recommended)
```bash
npm install -g pnpm
```

### 3. Environment Variables
File `.env.local` sẽ được tạo tự động khi chạy `setup-frontend.sh`.

**Nội dung mặc định:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_GATEWAY=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=IELTSGo
```

**Chỉnh sửa nếu cần:**
```bash
nano .env.local
```

### 4. Chạy Backend
Frontend cần backend để hoạt động. Từ thư mục root:
```bash
cd ..
make dev
```

Kiểm tra backend: http://localhost:8080/api/v1/health

---

## 📦 Package Manager

Dự án dùng **pnpm** (ưu tiên), nhưng cũng support npm/yarn.

### pnpm (Recommended)
```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run linter
```

### npm
```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

### yarn
```bash
yarn install
yarn dev
yarn build
yarn start
yarn lint
```

---

## 🌐 Available URLs

Sau khi start thành công:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js app |
| **Backend API** | http://localhost:8080 | API Gateway |
| **PgAdmin** | http://localhost:5050 | Database UI |
| **RabbitMQ** | http://localhost:15672 | Message Queue UI |

---

## 🐛 Troubleshooting

### Backend không chạy
```bash
# Quay về thư mục root
cd ..

# Start backend
make dev

# Hoặc
docker-compose up -d
```

### Port 3000 bị chiếm
```bash
# Tìm và kill process
lsof -ti:3000 | xargs kill -9

# Hoặc dùng port khác
PORT=3001 pnpm dev
```

### Dependencies lỗi
```bash
# Xóa và cài lại
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Lỗi "Cannot connect to API"
1. Kiểm tra backend có chạy không:
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

2. Kiểm tra `.env.local`:
   ```bash
   cat .env.local
   ```

3. Restart dev server:
   ```bash
   # Ctrl+C để thoát
   pnpm dev
   ```

### Lỗi TypeScript
```bash
# Xóa cache TypeScript
rm -rf .next
pnpm dev
```

---

## 📚 Project Structure

```
Frontend-IELTSGo/
├── app/                      # Next.js App Router
│   ├── (public)/            # Public pages (landing, login)
│   ├── dashboard/           # Student dashboard
│   ├── courses/             # Course pages
│   ├── exercises/           # Exercise pages
│   ├── instructor/          # Instructor dashboard
│   └── admin/               # Admin dashboard
├── components/              # React components
│   ├── ui/                  # Shadcn UI components
│   ├── layout/              # Layout components
│   ├── courses/             # Course components
│   └── exercises/           # Exercise components
├── lib/                     # Utilities
│   ├── api/                 # API client
│   └── utils.ts             # Helper functions
├── types/                   # TypeScript types
├── hooks/                   # Custom hooks
├── public/                  # Static files
├── styles/                  # Global styles
├── .env.local              # Environment variables (create from template)
└── package.json            # Dependencies
```

---

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **UI Components:** Shadcn/UI
- **HTTP Client:** Axios
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 🎨 Brand Colors

Đã được configure sẵn trong TailwindCSS:

```tsx
// Sử dụng trong code
<div className="bg-primary text-white">Red Button</div>
<div className="bg-secondary text-white">Dark Header</div>
<div className="bg-accent text-secondary">Cream Card</div>
```

**Màu chính:**
- `primary`: #ED372A (Red)
- `secondary`: #101615 (Dark)
- `accent`: #FEF7EC (Cream)
- `dark-red`: #B92819

---

## 👥 Development Workflow

### 1. Pull Code Mới
```bash
git pull origin main
pnpm install  # Update dependencies nếu có thay đổi
```

### 2. Tạo Feature Branch
```bash
git checkout -b feature/student-dashboard
```

### 3. Develop
```bash
pnpm dev  # Start dev server
# Code your feature...
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: implement student dashboard"
git push origin feature/student-dashboard
```

### 5. Create Pull Request
Tạo PR trên GitHub để review

---

## 📖 Documentation

- **README.md** - Getting started & features
- **ARCHITECTURE.md** - Frontend architecture
- **../docs/ROLES_AND_PERMISSIONS.md** - User roles & permissions
- **../FRONTEND_MASTER_GUIDE.md** - Complete implementation guide
- **../V0_PROMPTS_GUIDE.md** - Student UI prompts
- **../V0_PROMPTS_INSTRUCTOR.md** - Instructor UI prompts
- **../V0_PROMPTS_ADMIN.md** - Admin UI prompts

---

## 🚀 Next Steps

1. **Đọc documentation:**
   - Frontend ARCHITECTURE.md
   - Backend ROLES_AND_PERMISSIONS.md

2. **Explore codebase:**
   - `app/` - Pages & routes
   - `components/` - Reusable components
   - `lib/api/` - API integration

3. **Start coding:**
   - Pick a task from backlog
   - Follow coding standards
   - Write clean, documented code

---

## 💡 Tips

- **Hot Reload:** Code thay đổi sẽ tự động reload
- **TypeScript:** Sử dụng types để tránh lỗi
- **Console:** Check browser console cho errors
- **Network:** Check Network tab để debug API calls
- **Documentation:** Đọc Shadcn/UI docs khi dùng components

---

## 🆘 Need Help?

1. Check **Troubleshooting** section ở trên
2. Đọc **README.md** và **ARCHITECTURE.md**
3. Hỏi team lead hoặc senior dev
4. Check GitHub Issues

---

**Happy Coding! 🎉**

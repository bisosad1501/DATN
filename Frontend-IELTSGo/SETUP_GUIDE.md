# 🚀 Frontend Setup Guide - IELTSGo

> Hướng dẫn setup Frontend cho team developers

---

## ✅ Prerequisites (Cần có trước)

### 1. **Node.js & pnpm**
```bash
# Check Node version (cần >= 18, khuyến nghị 20.x LTS)
node --version

# Cài pnpm nếu chưa có
npm install -g pnpm

# Check pnpm version
pnpm --version
```

### 2. **Backend Services** 
Backend phải đang chạy ở `http://localhost:8080`

```bash
# Từ root project, chạy backend
cd /path/to/DATN
make dev
# hoặc
docker-compose up -d
```

---

## 📦 Installation Steps

### **Bước 1: Clone project** (nếu chưa có)
```bash
git clone https://github.com/bisosad1501/DATN.git
cd DATN
```

### **Bước 2: Vào folder Frontend**
```bash
cd Frontend-IELTSGo
```

### **Bước 3: Copy file environment**
```bash
# Copy .env.example thành .env.local
cp .env.example .env.local
```

### **Bước 4: Cài dependencies**
```bash
# Cài tất cả packages
pnpm install
```

> ⚠️ **Lưu ý:** 
> - Có thể thấy warning về peer dependencies (vaul với React 19), bỏ qua được
> - Có thể thấy warning về build scripts, bỏ qua được

### **Bước 5: Chạy dev server**
```bash
pnpm dev
```

Xong! Mở browser: **http://localhost:3000** 🎉

---

## 📁 Environment Variables

File `.env.local` đã được tạo từ `.env.example` với config mặc định:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_GATEWAY=http://localhost:8080

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=IELTSGo

# Authentication
NEXT_PUBLIC_JWT_SECRET=your-jwt-secret-key-here

# Google OAuth (optional - chưa cần setup ngay)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Environment
NODE_ENV=development
```

> 🔐 **Không commit file `.env.local`** vào git (đã có trong .gitignore)

---

## 🎯 Available Scripts

```bash
# Development (chạy app ở chế độ dev)
pnpm dev

# Build for production (build ra static files)
pnpm build

# Run production build (chạy version đã build)
pnpm start

# Lint code (check code quality)
pnpm lint
```

---

## 🏗️ Project Structure

```
Frontend-IELTSGo/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (login, register)
│   ├── admin/               # Admin dashboard
│   ├── instructor/          # Instructor dashboard  
│   ├── courses/             # Student courses
│   │   └── [courseId]/      # Course detail page
│   ├── exercises/           # Student exercises
│   │   └── [exerciseId]/    # Exercise player
│   ├── dashboard/           # Student dashboard
│   ├── profile/             # User profile
│   ├── progress/            # Learning progress
│   └── layout.tsx           # Root layout
│
├── components/              # React components
│   ├── ui/                  # Shadcn/UI components (Button, Card, etc)
│   ├── layout/              # Layout components (Header, Sidebar, etc)
│   └── features/            # Feature-specific components
│
├── lib/                     # Utilities & configs
│   ├── api/                 # API client functions
│   ├── contexts/            # React contexts (auth, theme)
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Helper functions
│
├── types/                   # TypeScript type definitions
├── public/                  # Static assets (images, icons)
├── styles/                  # Global CSS styles
└── .env.local              # Environment variables (local)
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Port 3000 đã được sử dụng**
```bash
# Kill process trên port 3000
lsof -ti:3000 | xargs kill -9

# Hoặc chạy trên port khác
pnpm dev --port 3001
```

### **Issue 2: Backend không connect được**
```bash
# Check backend đang chạy
curl http://localhost:8080/health

# Check .env.local có đúng URL không
cat .env.local | grep API_URL
```

### **Issue 3: Dependencies install lỗi**
```bash
# Xóa node_modules và install lại
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### **Issue 4: TypeScript errors**
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

### **Issue 5: "You cannot use different slug names"**
✅ **Đã fix!** 
- Trước đây có conflict giữa `[id]` và `[courseId]`
- Đã thống nhất dùng `[courseId]` và `[exerciseId]`

---

## 🔄 Workflow cho Team

### **1. Lần đầu setup:**
```bash
git clone <repo>
cd DATN/Frontend-IELTSGo
cp .env.example .env.local
pnpm install
pnpm dev
```

### **2. Mỗi lần pull code mới:**
```bash
git pull origin main
pnpm install    # Cài thêm dependencies mới (nếu có)
pnpm dev        # Chạy lại
```

### **3. Khi thêm dependencies mới:**
```bash
# Thêm package
pnpm add <package-name>

# Thêm dev dependency
pnpm add -D <package-name>

# Commit cả package.json và pnpm-lock.yaml
git add package.json pnpm-lock.yaml
git commit -m "chore: add <package-name>"
```

---

## 📝 Development Guidelines

### **1. Code Style**
- Dùng TypeScript cho tất cả files
- Component names: PascalCase (`UserCard.tsx`)
- Function names: camelCase (`getUserData()`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### **2. Commit Message Format**
```
feat: thêm tính năng mới
fix: sửa bug
chore: update dependencies, config
docs: update documentation
style: format code, fix linting
refactor: refactor code structure
```

### **3. Branch Naming**
```
feature/user-authentication
bugfix/course-card-display
hotfix/critical-api-error
```

### **4. API Integration**
Tất cả API calls đặt trong `lib/api/`:
```typescript
// lib/api/courses.ts
export const coursesApi = {
  getCourses: async () => {...},
  getCourseById: async (id: string) => {...}
}
```

---

## 🎨 UI/UX Standards

### **Brand Colors (IELTSGo)**
```css
--primary: #ED372A        /* Red - Main brand */
--secondary: #101615      /* Dark - Text/headers */
--accent: #FEF7EC         /* Cream - Backgrounds */
--dark-red: #B92819       /* Shadow/depth */
```

### **Components Library**
Dùng Shadcn/UI components trong `components/ui/`:
- Button, Card, Dialog, Dropdown, etc.
- Đã được styled với IELTSGo colors
- Có dark mode support

---

## 🚀 Deployment

### **Deploy lên Vercel**
```bash
# Build local để test
pnpm build
pnpm start

# Deploy lên Vercel (nếu đã setup)
vercel deploy
```

### **Environment Variables trên Production**
Cần set trong Vercel Dashboard:
- `NEXT_PUBLIC_API_URL` → URL backend production
- `NEXT_PUBLIC_API_GATEWAY` → API Gateway production
- `NEXT_PUBLIC_APP_URL` → URL frontend production
- Các keys khác...

---

## 📚 Additional Resources

- **Frontend Master Guide:** `FRONTEND_MASTER_GUIDE.md`
- **Architecture Doc:** `ARCHITECTURE.md`
- **Quick Start:** `QUICK_START.md`
- **README:** `README.md`
- **V0 Prompts (Student):** `../V0_PROMPTS_GUIDE.md`
- **V0 Prompts (Instructor):** `../V0_PROMPTS_INSTRUCTOR.md`
- **V0 Prompts (Admin):** `../V0_PROMPTS_ADMIN.md`
- **Colors Guide:** `../IELTSGO_COLORS.md`

---

## ✅ Checklist cho Team Members

- [ ] Đã cài Node.js >= 18
- [ ] Đã cài pnpm
- [ ] Clone project từ GitHub
- [ ] Copy `.env.example` → `.env.local`
- [ ] Chạy `pnpm install` thành công
- [ ] Backend đang chạy ở port 8080
- [ ] Chạy `pnpm dev` thành công
- [ ] Mở http://localhost:3000 thấy trang chủ
- [ ] Đọc `ARCHITECTURE.md` để hiểu cấu trúc
- [ ] Join Slack/Discord channel của team

---

## 🆘 Need Help?

- **Issues:** Create issue trên GitHub
- **Questions:** Hỏi trên team chat (Slack/Discord)
- **Documentation:** Đọc các file `.md` trong project

---

**Setup Guide version:** 1.0  
**Last updated:** October 15, 2025  
**Frontend version:** Next.js 15.2.4  

**Happy Coding! 🎉**

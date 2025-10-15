# 🎨 Frontend IELTSGo - Quick Setup for Team

> **Hướng dẫn nhanh cho team members khi clone project lần đầu**

---

## 🚀 Quick Start (3 phút)

### **Option 1: Automatic Setup** ⭐ Recommended

```bash
# 1. Clone project
git clone https://github.com/bisosad1501/DATN.git
cd DATN/Frontend-IELTSGo

# 2. Chạy script tự động
./setup-team.sh

# Script sẽ tự động:
# ✓ Check Node.js & pnpm
# ✓ Cài pnpm nếu chưa có
# ✓ Copy .env.example → .env.local
# ✓ Run pnpm install
# ✓ Check backend status
# ✓ Hỏi có muốn chạy pnpm dev không
```

### **Option 2: Manual Setup**

```bash
# 1. Clone project
git clone https://github.com/bisosad1501/DATN.git
cd DATN/Frontend-IELTSGo

# 2. Copy environment
cp .env.example .env.local

# 3. Install dependencies
pnpm install

# 4. Start dev server
pnpm dev

# 5. Open browser
# → http://localhost:3000
```

---

## ✅ Prerequisites

Cần có trước khi setup:

| Tool | Version | Check Command | Install |
|------|---------|---------------|---------|
| **Node.js** | >= 18 (khuyến nghị 20.x) | `node --version` | https://nodejs.org/ |
| **pnpm** | Latest | `pnpm --version` | `npm install -g pnpm` |
| **Backend** | Running on :8080 | `curl localhost:8080/health` | `cd .. && make dev` |

---

## 📂 Project Structure

```
Frontend-IELTSGo/
│
├── 📄 SETUP_GUIDE.md          ← ĐỌC FILE NÀY! (hướng dẫn đầy đủ)
├── 📄 ARCHITECTURE.md         ← Kiến trúc project
├── 📄 README.md               ← Features & tech stack
├── 📄 QUICK_START.md          ← Quick reference
│
├── 🔧 setup-team.sh           ← Script tự động setup
├── 📦 package.json            ← Dependencies
├── 🔐 .env.local              ← Environment variables (tự tạo)
│
├── app/                       ← Next.js pages
│   ├── admin/                 ← Admin dashboard
│   ├── instructor/            ← Instructor dashboard
│   ├── courses/               ← Student courses
│   ├── exercises/             ← Student exercises
│   └── ...
│
├── components/                ← React components
│   ├── ui/                    ← Shadcn/UI components
│   └── layout/                ← Layout components
│
├── lib/                       ← Utils & API
│   ├── api/                   ← API client functions
│   └── contexts/              ← React contexts
│
└── types/                     ← TypeScript types
```

---

## 🎯 Development Workflow

### **Lần đầu setup:**
```bash
./setup-team.sh    # Hoặc manual setup
```

### **Hàng ngày:**
```bash
git pull origin main
pnpm install       # Nếu có dependencies mới
pnpm dev
```

### **Khi thêm feature mới:**
```bash
git checkout -b feature/your-feature
# ... code code code ...
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature
# → Create Pull Request trên GitHub
```

---

## 📚 Documentation

| File | Nội dung |
|------|----------|
| **SETUP_GUIDE.md** | 📖 Hướng dẫn setup chi tiết, troubleshooting, workflow |
| **ARCHITECTURE.md** | 🏗️ Kiến trúc project, folder structure, conventions |
| **README.md** | 📝 Features, tech stack, getting started |
| **QUICK_START.md** | ⚡ Quick reference, commands, shortcuts |

### **Related Docs (ở root project):**
- `../FRONTEND_MASTER_GUIDE.md` - Master guide cho cả 3 roles
- `../V0_PROMPTS_GUIDE.md` - V0 prompts cho Student UI
- `../V0_PROMPTS_INSTRUCTOR.md` - V0 prompts cho Instructor UI
- `../V0_PROMPTS_ADMIN.md` - V0 prompts cho Admin UI
- `../IELTSGO_COLORS.md` - Brand colors & design system
- `../docs/ROLES_AND_PERMISSIONS.md` - Roles & permissions analysis

---

## 🔥 Important Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:3000)

# Build & Production
pnpm build            # Build for production
pnpm start            # Run production build

# Code Quality
pnpm lint             # Check code quality

# Utilities
pnpm add <package>    # Add new package
pnpm remove <package> # Remove package
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| **Port 3000 đã dùng** | `lsof -ti:3000 \| xargs kill -9` |
| **Backend không connect** | `curl localhost:8080/health` để check |
| **Dependencies lỗi** | `rm -rf node_modules pnpm-lock.yaml && pnpm install` |
| **TypeScript errors** | `rm -rf .next && pnpm dev` |
| **pnpm chưa có** | `npm install -g pnpm` |

---

## 👥 Team Guidelines

### **Code Style:**
- TypeScript cho tất cả files
- Components: PascalCase (`UserCard.tsx`)
- Functions: camelCase (`getUserData()`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)

### **Commit Format:**
```
feat: thêm feature mới
fix: sửa bug
chore: update dependencies
docs: update documentation
style: format code
refactor: refactor code
```

### **Branch Naming:**
```
feature/user-authentication
bugfix/course-display
hotfix/critical-error
```

---

## 🎨 Brand Colors (IELTSGo)

```css
--primary: #ED372A      /* Red - Main brand */
--secondary: #101615    /* Dark - Text/headers */
--accent: #FEF7EC       /* Cream - Backgrounds */
--dark-red: #B92819     /* Shadow/depth */
```

Xem thêm: `../IELTSGO_COLORS.md`

---

## 🆘 Need Help?

1. **Đọc SETUP_GUIDE.md** (hướng dẫn đầy đủ)
2. **Check Issues** trên GitHub
3. **Hỏi trên team chat** (Slack/Discord)
4. **Tạo issue mới** nếu cần

---

## ✅ Checklist

- [ ] Đã cài Node.js >= 18
- [ ] Đã cài pnpm
- [ ] Clone project thành công
- [ ] Chạy `./setup-team.sh` hoặc manual setup
- [ ] Backend đang chạy ở :8080
- [ ] `pnpm dev` chạy thành công
- [ ] Mở http://localhost:3000 được
- [ ] Đọc **SETUP_GUIDE.md**
- [ ] Đọc **ARCHITECTURE.md**
- [ ] Join team chat

---

**Last updated:** October 15, 2025  
**Frontend:** Next.js 15.2.4  
**Status:** ✅ Tested & Working

**Happy Coding! 🚀**

# ✅ Frontend Setup Checklist

> **Checklist cho team members khi setup Frontend lần đầu**

---

## 📋 Pre-Setup Checklist

### System Requirements
- [ ] **macOS, Linux, hoặc Windows** với WSL2
- [ ] **Node.js >= 18** installed (khuyến nghị 20.x LTS)
  ```bash
  node --version
  # Nếu chưa có: https://nodejs.org/
  ```
- [ ] **pnpm** installed (script sẽ tự cài nếu chưa có)
  ```bash
  pnpm --version
  # Nếu muốn cài trước: npm install -g pnpm
  ```
- [ ] **Git** installed
  ```bash
  git --version
  ```

### Access & Permissions
- [ ] Có quyền truy cập GitHub repository
- [ ] Đã clone project thành công
- [ ] Có thể chạy bash scripts (macOS/Linux native, Windows dùng WSL2)

---

## 🚀 Setup Steps

### Step 1: Clone Project
```bash
git clone https://github.com/bisosad1501/DATN.git
cd DATN
```
- [ ] Clone thành công
- [ ] Vào được folder DATN

### Step 2: Vào Frontend folder
```bash
cd Frontend-IELTSGo
```
- [ ] Folder Frontend-IELTSGo tồn tại
- [ ] Thấy các file: package.json, setup-team.sh, etc.

### Step 3: Run Setup Script
```bash
./setup-team.sh
```
- [ ] Script chạy không lỗi
- [ ] pnpm được cài (hoặc đã có sẵn)
- [ ] File .env.local được tạo
- [ ] Dependencies được install (pnpm install)
- [ ] Thấy thông báo "Setup hoàn tất!"

### Step 4: Check Backend (Optional nhưng khuyến nghị)
```bash
# Từ root project
cd ..
make dev
# hoặc
docker-compose up -d
```
- [ ] Backend services đang chạy
- [ ] API Gateway responding ở :8080
  ```bash
  curl http://localhost:8080/health
  # Should return: {"status":"ok"}
  ```

### Step 5: Start Frontend Dev Server
```bash
cd Frontend-IELTSGo
pnpm dev
```
- [ ] Dev server start thành công
- [ ] Thấy message: "Ready in XXXXms"
- [ ] Không có errors về routing conflicts

### Step 6: Test in Browser
- [ ] Mở http://localhost:3000
- [ ] Trang chủ load được
- [ ] Không có console errors (hoặc chỉ có warnings nhỏ)
- [ ] UI hiển thị đúng (header, footer, content)

---

## 📚 Documentation Checklist

### Must Read (Đọc bắt buộc)
- [ ] **SETUP_GUIDE.md** - Hướng dẫn setup chi tiết, troubleshooting
- [ ] **ARCHITECTURE.md** - Hiểu cấu trúc project, folder structure
- [ ] **README.md** - Features, tech stack overview

### Should Read (Nên đọc)
- [ ] **QUICK_START.md** - Quick reference commands
- [ ] **../FRONTEND_TEAM_SETUP.md** - Quick start guide ở root
- [ ] **../FRONTEND_MASTER_GUIDE.md** - Master guide cho 3 roles

### Reference (Tham khảo khi cần)
- [ ] **../IELTSGO_COLORS.md** - Brand colors & design system
- [ ] **../docs/ROLES_AND_PERMISSIONS.md** - Role permissions analysis
- [ ] **../V0_PROMPTS_GUIDE.md** - V0 prompts cho Student UI
- [ ] **../V0_PROMPTS_INSTRUCTOR.md** - V0 prompts cho Instructor UI
- [ ] **../V0_PROMPTS_ADMIN.md** - V0 prompts cho Admin UI

---

## 🎯 Development Workflow Checklist

### Daily Workflow
- [ ] **Pull latest code**
  ```bash
  git pull origin main
  ```
- [ ] **Install new dependencies** (nếu có)
  ```bash
  pnpm install
  ```
- [ ] **Start dev server**
  ```bash
  pnpm dev
  ```
- [ ] **Check backend is running** (nếu cần call API)
  ```bash
  curl http://localhost:8080/health
  ```

### Before Starting New Feature
- [ ] Create feature branch
  ```bash
  git checkout -b feature/your-feature-name
  ```
- [ ] Understand requirement
- [ ] Check ARCHITECTURE.md for structure
- [ ] Identify which components to create/modify

### Before Committing Code
- [ ] Code works locally
- [ ] No TypeScript errors (hoặc chỉ có minor warnings)
- [ ] No console errors
- [ ] Follows code style guidelines
- [ ] Write meaningful commit message
  ```bash
  git add .
  git commit -m "feat: add user profile page"
  ```

### Before Creating PR
- [ ] All files staged and committed
- [ ] Push to your branch
  ```bash
  git push origin feature/your-feature-name
  ```
- [ ] Create PR on GitHub
- [ ] Add description explaining changes
- [ ] Request review from team

---

## 🐛 Troubleshooting Checklist

### If `pnpm install` fails
- [ ] Check internet connection
- [ ] Clear pnpm cache
  ```bash
  pnpm store prune
  ```
- [ ] Delete node_modules and reinstall
  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

### If `pnpm dev` fails
- [ ] Port 3000 already in use?
  ```bash
  lsof -ti:3000 | xargs kill -9
  # Or run on different port
  pnpm dev --port 3001
  ```
- [ ] Clear Next.js cache
  ```bash
  rm -rf .next
  ```
- [ ] Check .env.local exists
  ```bash
  cat .env.local
  ```

### If Backend API not working
- [ ] Backend services running?
  ```bash
  docker-compose ps
  ```
- [ ] Check .env.local has correct API URL
  ```bash
  cat .env.local | grep API_URL
  # Should be: NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
  ```
- [ ] Test API directly
  ```bash
  curl http://localhost:8080/health
  curl http://localhost:8080/api/v1/courses
  ```

### If TypeScript errors
- [ ] Install missing @types packages
- [ ] Check tsconfig.json is correct
- [ ] Restart VS Code TypeScript server
  - VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"

---

## 🎨 Code Style Checklist

### File Naming
- [ ] Components: PascalCase (`UserCard.tsx`, `CourseList.tsx`)
- [ ] Utilities: camelCase (`formatDate.ts`, `apiClient.ts`)
- [ ] Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)

### Code Structure
- [ ] Import order:
  1. React & Next.js imports
  2. Third-party libraries
  3. Local components
  4. Utils & types
  5. Styles
- [ ] Use TypeScript for all files
- [ ] Export types/interfaces when needed
- [ ] Avoid `any` type (use proper types)

### Component Structure
```tsx
// 1. Imports
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { User } from "@/types"

// 2. Types/Interfaces
interface UserCardProps {
  user: User
  onClick?: () => void
}

// 3. Component
export function UserCard({ user, onClick }: UserCardProps) {
  // State
  const [loading, setLoading] = useState(false)
  
  // Handlers
  const handleClick = () => {
    // ...
  }
  
  // Render
  return (
    <div>...</div>
  )
}
```

---

## ✅ Final Verification

### Environment Check
- [ ] Node.js version >= 18
- [ ] pnpm installed and working
- [ ] .env.local exists with correct values
- [ ] node_modules folder created
- [ ] Backend API accessible

### Development Check
- [ ] `pnpm dev` starts without errors
- [ ] http://localhost:3000 loads
- [ ] Can navigate between pages
- [ ] No major console errors
- [ ] Hot reload works (change file → see changes)

### Team Communication
- [ ] Joined team chat (Slack/Discord)
- [ ] Know who to ask for help
- [ ] Have access to project documentation
- [ ] Understand project roadmap
- [ ] Know current sprint/tasks

---

## 🎉 You're Ready!

Nếu tất cả checklist trên đều ✅, bạn đã sẵn sàng để code!

### Next Steps:
1. **Pick a task** from your project board
2. **Read relevant docs** (ARCHITECTURE.md, component docs)
3. **Create feature branch**
4. **Start coding** 🚀
5. **Test locally**
6. **Commit & create PR**
7. **Get review & merge**

---

## 🆘 Still Having Issues?

1. **Re-read SETUP_GUIDE.md** carefully
2. **Check common issues** section
3. **Search in team chat** (maybe someone had same issue)
4. **Ask on team chat** with error details:
   - What command you ran
   - Error message (full text)
   - Your environment (OS, Node version, etc.)
   - What you've tried
5. **Create GitHub issue** if it's a bug

---

**Good luck! Happy coding! 🎉**

**Last updated:** October 15, 2025  
**Checklist version:** 1.0

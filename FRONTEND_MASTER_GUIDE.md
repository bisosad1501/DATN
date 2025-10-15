# 🎯 MASTER GUIDE - ROLE-BASED UI DEVELOPMENT

> Hướng dẫn tổng thể xây dựng frontend cho 3 roles: Student, Instructor, Admin

---

## 📚 TÀI LIỆU THAM KHẢO

### 🔐 Phân Tích Quyền Hạn
**File:** `docs/ROLES_AND_PERMISSIONS.md`

Chi tiết đầy đủ về:
- 3 roles: Student, Instructor, Admin
- Permissions của từng role
- API endpoints được phép truy cập
- Use cases và workflows
- Comparison table

**Đọc file này TRƯỚC KHI bắt đầu!**

---

### 🎨 Màu Sắc Chính Thức
**File:** `IELTSGO_COLORS.md`

Màu sắc từ logo IELTSGo:
- 🔴 Primary Red: `#ED372A`
- ⚫ Secondary Dark: `#101615`
- 🟡 Accent Cream: `#FEF7EC`
- 🔴 Dark Red: `#B92819`

**SỬ DỤNG ĐÚNG MÀU!** Không dùng blue/green/orange cũ.

---

## 🎓 ROLE 1: STUDENT (Học viên)

### Tài Liệu V0 Prompts
**File:** `V0_PROMPTS_GUIDE.md`

### 7 Layers của Student UI:
1. **Foundation & Setup** - Layout, Design system, Shadcn/UI
2. **Authentication** - Login, Register, Profile, Settings
3. **Course System** - Browse, Detail, Lesson Player
4. **Exercise System** - Browse, Practice Player, Results
5. **Progress Tracking** - Dashboard, Analytics, Goals, Achievements
6. **Notifications & Social** - Notifications, Leaderboard
7. **Additional Components** - Shared utilities, Mobile responsive

### Features Chính:
- ✅ Xem courses, enroll
- ✅ Học lessons (video, text, quiz)
- ✅ Làm exercises, xem kết quả
- ✅ Track tiến trình, goals, achievements
- ✅ Xem leaderboard, ranking
- ✅ Cài đặt preferences
- ✅ Notifications

### API Endpoints: ~80 endpoints

### Thời Gian: 6 tuần

---

## 👨‍🏫 ROLE 2: INSTRUCTOR (Giảng viên)

### Tài Liệu V0 Prompts
**File:** `V0_PROMPTS_INSTRUCTOR.md`

### Kế Thừa:
- ✅ **TẤT CẢ features của Student**
- Instructor có thể học như student
- Sử dụng toàn bộ Student UI

### 7 Layers Bổ Sung cho Instructor:
1. **Instructor Layout** - Top nav với Create dropdown
2. **Instructor Dashboard** - Overview content đã tạo, student stats
3. **Course Management** - My Courses list, Course Builder (WYSIWYG)
4. **Exercise Management** - My Exercises list, Exercise Builder
5. **Student Progress** - Track học viên, xem submissions
6. **Content Analytics** - Stats cho courses/exercises mình tạo
7. **Utilities** - Quick actions, Notifications, Settings

### Features Riêng:
- ➕ Tạo và chỉnh sửa courses
- ➕ Tạo và chỉnh sửa exercises
- ➕ Xem tiến trình của học viên
- ➕ Xem analytics của content mình tạo
- ➕ Quản lý tags
- ➕ Question bank

### Không Thể:
- ❌ Xóa courses (chỉ admin)
- ❌ Quản lý users
- ❌ System settings
- ❌ Xem analytics toàn hệ thống

### API Endpoints: ~105 endpoints (80 student + 25 instructor)

### Thời Gian: 5 tuần (có sẵn Student UI)

---

## 👑 ROLE 3: ADMIN (Quản trị viên)

### Tài Liệu V0 Prompts
**File:** `V0_PROMPTS_ADMIN.md`

### Kế Thừa:
- ✅ **TẤT CẢ features của Instructor**
- Admin có thể học như student
- Admin có thể tạo content như instructor

### 7 Layers Riêng cho Admin:
1. **Admin Layout** - Dark sidebar với admin navigation
2. **Dashboard Overview** - System stats, activity feed, charts
3. **User Management** - CRUD users, assign roles, lock/unlock
4. **Content Management** - Review/moderate courses, exercises, reviews
5. **Analytics & Reports** - Comprehensive system analytics
6. **Notification Center** - Bulk send, templates, scheduler
7. **System Settings** - Health monitor, Settings panel, Logs

### Features Riêng:
- ➕ Quản lý TẤT CẢ users (CRUD, roles, permissions)
- ➕ XÓA bất kỳ content nào (courses, exercises)
- ➕ Xem analytics toàn hệ thống
- ➕ Gửi bulk notifications
- ➕ System monitoring (health, logs, errors)
- ➕ System settings (email, auth, storage, backup)
- ➕ Content moderation

### API Endpoints: ~140+ endpoints (105 instructor + 35+ admin)

### Thời Gian: 6 tuần (có sẵn Instructor UI)

---

## 📊 COMPARISON: 3 ROLES

| Feature | Student | Instructor | Admin |
|---------|---------|------------|-------|
| **View Courses** | ✅ | ✅ | ✅ |
| **Enroll & Learn** | ✅ | ✅ | ✅ |
| **Submit Exercises** | ✅ | ✅ | ✅ |
| **View Own Progress** | ✅ | ✅ | ✅ |
| **Create Courses** | ❌ | ✅ | ✅ |
| **Create Exercises** | ❌ | ✅ | ✅ |
| **Delete Courses** | ❌ | ❌ | ✅ |
| **Delete Exercises** | ❌ | ✅ (own) | ✅ (all) |
| **View Student Progress** | ❌ | ✅ | ✅ |
| **Content Analytics** | ❌ | ✅ (own) | ✅ (all) |
| **Manage Users** | ❌ | ❌ | ✅ |
| **Assign Roles** | ❌ | ❌ | ✅ |
| **System Settings** | ❌ | ❌ | ✅ |
| **Bulk Notifications** | ❌ | ❌ | ✅ |
| **System Monitoring** | ❌ | ❌ | ✅ |

---

## 🚀 CHIẾN LƯỢC TRIỂN KHAI

### Phương Án 1: Tuần Tự (Recommended)
**Tổng thời gian: 17 tuần**

#### Phase 1: Student UI (Tuần 1-6)
- Tuần 1: Foundation & Auth
- Tuần 2: Course System
- Tuần 3: Exercise System
- Tuần 4: Progress & Dashboard
- Tuần 5: Notifications & Social
- Tuần 6: Polish & Testing

**Kết quả:** Student có thể sử dụng đầy đủ

#### Phase 2: Instructor UI (Tuần 7-11)
- Tuần 7: Instructor layout & dashboard
- Tuần 8: Course Builder
- Tuần 9: Exercise Builder
- Tuần 10: Student tracking & Analytics
- Tuần 11: Polish & Testing

**Kết quả:** Instructor có thể tạo content và track students

#### Phase 3: Admin UI (Tuần 12-17)
- Tuần 12: Admin layout & dashboard
- Tuần 13: User Management
- Tuần 14: Content Management
- Tuần 15: Analytics & Reports
- Tuần 16: Notifications & System Monitoring
- Tuần 17: Polish & Testing

**Kết quả:** Admin có thể quản lý toàn hệ thống

---

### Phương Án 2: Song Song (Faster)
**Tổng thời gian: 8-10 tuần**

Với team 3+ devs, chia role:

#### Team A: Student UI (6 tuần)
- Dev 1: Auth, Profile, Settings
- Dev 2: Courses, Lessons
- Dev 3: Exercises, Progress

#### Team B: Instructor UI (5 tuần, bắt đầu tuần 2)
- Dev 4: Course Builder
- Dev 5: Exercise Builder, Analytics

#### Team C: Admin UI (6 tuần, bắt đầu tuần 3)
- Dev 6: User Management, Analytics
- Dev 7: System Settings, Monitoring

**Kết quả:** Cả 3 roles hoàn thành sau 8-10 tuần

---

## 🛠️ TECH STACK

### Frontend
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript",
  "styling": "TailwindCSS",
  "components": "Shadcn/UI",
  "stateManagement": "Zustand",
  "dataFetching": "React Query (TanStack Query)",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "icons": "Lucide React",
  "richTextEditor": "@tiptap/react",
  "dragDrop": "@dnd-kit/core",
  "dateTime": "date-fns"
}
```

### Backend (Đã có sẵn)
```json
{
  "apiGateway": "http://localhost:8080",
  "services": "Microservices (Go)",
  "database": "PostgreSQL",
  "cache": "Redis",
  "messageQueue": "RabbitMQ",
  "authentication": "JWT"
}
```

---

## 📋 SETUP INSTRUCTIONS

### 1. Create Next.js Project
```bash
npx create-next-app@latest ieltsgo-frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd ieltsgo-frontend
```

### 2. Install Shadcn/UI
```bash
npx shadcn-ui@latest init
```

### 3. Install Dependencies
```bash
npm install \
  @tanstack/react-query \
  axios \
  zustand \
  react-hook-form \
  zod \
  @hookform/resolvers \
  recharts \
  lucide-react \
  date-fns \
  @tiptap/react @tiptap/starter-kit \
  @dnd-kit/core @dnd-kit/sortable \
  react-hot-toast
```

### 4. Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 5. Tailwind Config (Colors)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ED372A',
          hover: '#d42e22',
          light: '#fee2e2',
        },
        secondary: {
          DEFAULT: '#101615',
          hover: '#1f2937',
          light: '#f3f4f6',
        },
        accent: {
          DEFAULT: '#FEF7EC',
          hover: '#f5e5d3',
          light: '#fffbf5',
        },
        darkRed: {
          DEFAULT: '#B92819',
          hover: '#a01f12',
        },
      },
    },
  },
}
```

---

## 🔗 API INTEGRATION

### API Client Setup
```typescript
// lib/api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### Role-based Route Protection
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')
  const role = request.cookies.get('user_role')?.value

  // Protect instructor routes
  if (request.nextUrl.pathname.startsWith('/instructor')) {
    if (!token || (role !== 'instructor' && role !== 'admin')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token || role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/instructor/:path*', '/admin/:path*'],
}
```

---

## 📁 PROJECT STRUCTURE

```
ieltsgo-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (student)/         # Student pages
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── exercises/
│   │   │   └── profile/
│   │   ├── instructor/        # Instructor pages
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── exercises/
│   │   │   └── students/
│   │   ├── admin/             # Admin pages
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── content/
│   │   │   ├── analytics/
│   │   │   └── system/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Reusable components
│   │   ├── ui/               # Shadcn/UI components
│   │   ├── student/          # Student-specific
│   │   ├── instructor/       # Instructor-specific
│   │   ├── admin/            # Admin-specific
│   │   └── shared/           # Shared across roles
│   ├── lib/                  # Utilities
│   │   ├── api/              # API clients
│   │   ├── hooks/            # Custom hooks
│   │   ├── stores/           # Zustand stores
│   │   └── utils/            # Helper functions
│   └── types/                # TypeScript types
│       ├── api.ts
│       ├── student.ts
│       ├── instructor.ts
│       └── admin.ts
├── public/
│   └── logo/                 # IELTSGo logo files
├── .env.local
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## ✅ CHECKLIST HOÀN THÀNH

### Student UI
- [ ] Authentication (Login, Register, OAuth)
- [ ] User Profile & Settings
- [ ] Course Browsing & Detail
- [ ] Lesson Player (Video, Text, Quiz)
- [ ] Exercise System (Browse, Practice, Results)
- [ ] Progress Dashboard
- [ ] Leaderboard
- [ ] Notifications
- [ ] Mobile Responsive

### Instructor UI
- [ ] Instructor Dashboard
- [ ] My Courses List
- [ ] Course Builder (WYSIWYG)
- [ ] My Exercises List
- [ ] Exercise Builder (Question Bank)
- [ ] Student Progress Tracking
- [ ] Content Analytics
- [ ] Quick Actions & Utilities

### Admin UI
- [ ] Admin Dashboard Overview
- [ ] User Management (CRUD, Roles)
- [ ] Content Management (Review, Moderate)
- [ ] Comprehensive Analytics
- [ ] Notification Center (Bulk Send)
- [ ] System Health Monitor
- [ ] System Settings Panel

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Components: Jest + React Testing Library
- API functions: Jest
- Utils/Helpers: Jest

### Integration Tests
- User flows: Cypress or Playwright
- API integration: Mock Service Worker (MSW)

### E2E Tests
- Critical paths:
  * Student: Register → Enroll → Complete lesson → Submit exercise
  * Instructor: Login → Create course → Add lessons → Publish
  * Admin: Login → Manage users → View analytics

### Manual Testing
- Test with actual backend (http://localhost:8080)
- Test all 3 roles
- Test responsive on mobile/tablet
- Test different browsers

---

## 🚀 DEPLOYMENT

### Vercel (Recommended)
```bash
# 1. Connect to Vercel
vercel

# 2. Set environment variables in Vercel Dashboard
NEXT_PUBLIC_API_URL=https://api.ieltsgo.com/api/v1
NEXT_PUBLIC_APP_URL=https://ieltsgo.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# 3. Deploy
vercel --prod
```

### Environment-specific URLs
- Development: http://localhost:3000
- Staging: https://staging.ieltsgo.com
- Production: https://ieltsgo.com

---

## 📞 SUPPORT & RESOURCES

### Documentation
- Next.js: https://nextjs.org/docs
- Shadcn/UI: https://ui.shadcn.com
- TailwindCSS: https://tailwindcss.com
- React Query: https://tanstack.com/query

### Project Documentation
- Roles & Permissions: `docs/ROLES_AND_PERMISSIONS.md`
- API Endpoints: `docs/API_ENDPOINTS.md`
- Colors: `IELTSGO_COLORS.md`
- Backend Test Report: `FINAL_SYSTEM_TEST_REPORT.md`

### V0 Prompts
- Student: `V0_PROMPTS_GUIDE.md`
- Instructor: `V0_PROMPTS_INSTRUCTOR.md`
- Admin: `V0_PROMPTS_ADMIN.md`

---

## 🎯 SUCCESS CRITERIA

### Student Experience
- ✅ Có thể đăng ký, đăng nhập (email + Google)
- ✅ Browse và enroll vào courses
- ✅ Xem lessons (video, text, quiz)
- ✅ Làm exercises và xem kết quả
- ✅ Track tiến trình học tập
- ✅ Xem leaderboard và ranking
- ✅ Responsive trên mobile

### Instructor Experience
- ✅ Tạo courses với modules/lessons
- ✅ Upload videos, tạo quiz
- ✅ Tạo exercises với nhiều loại câu hỏi
- ✅ Xem tiến trình học viên
- ✅ Xem analytics của content mình tạo
- ✅ Publish/unpublish content

### Admin Experience
- ✅ Quản lý users (CRUD, roles, permissions)
- ✅ Review và moderate content
- ✅ Xem analytics toàn hệ thống
- ✅ Gửi bulk notifications
- ✅ Monitor system health
- ✅ Configure system settings

### Performance
- ✅ Page load: <2s
- ✅ API response: <100ms (frontend side)
- ✅ Lighthouse score: >90
- ✅ No console errors

### Quality
- ✅ TypeScript: No type errors
- ✅ Responsive: Mobile, Tablet, Desktop
- ✅ Accessibility: WCAG AA
- ✅ Browser support: Chrome, Firefox, Safari, Edge

---

## 🎉 GETTING STARTED

### For Student UI:
1. Đọc `ROLES_AND_PERMISSIONS.md`
2. Đọc `IELTSGO_COLORS.md`
3. Mở `V0_PROMPTS_GUIDE.md`
4. Bắt đầu với **Prompt 1.1: Project Setup**
5. Copy prompt vào https://v0.dev
6. Làm theo 7 layers tuần tự

### For Instructor UI:
1. Hoàn thành Student UI trước
2. Đọc `V0_PROMPTS_INSTRUCTOR.md`
3. Bắt đầu với **Prompt 1.1: Instructor Layout**
4. Làm theo 7 layers instructor

### For Admin UI:
1. Hoàn thành Instructor UI trước
2. Đọc `V0_PROMPTS_ADMIN.md`
3. Bắt đầu với **Prompt 1.1: Admin Layout**
4. Làm theo 7 layers admin

---

**Good luck! 🚀**

**Document created:** 2025-10-15  
**Project:** IELTSGo Platform  
**Backend:** Operational (28/28 APIs working)  
**Quality Score:** 95/100  
**Ready for Frontend Development:** ✅

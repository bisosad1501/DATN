# 🎨 HƯỚNG DẪN SỬ DỤNG V0 XÂY DỰNG FRONTEND IELTSGO

## 📋 Tổng Quan

File này chứa hướng dẫn chi tiết cách sử dụng các prompts để v0 by Vercel tạo frontend cho hệ thống IELTSGo.

**Tài liệu đầy đủ:** Xem file `V0_PROMPTS_GUIDE.md`

---

## 🎯 Chiến Lược Xây Dựng

### 6 Layers Chính:

```
Layer 1: Foundation & Setup (Nền tảng)
  ↓
Layer 2: Authentication & User (Xác thực & User)
  ↓
Layer 3: Course Learning (Hệ thống khóa học)
  ↓
Layer 4: Exercise & Practice (Bài tập & Luyện tập)
  ↓
Layer 5: Progress & Dashboard (Tiến độ & Dashboard)
  ↓
Layer 6: Notifications & Social (Thông báo & Mạng xã hội)
```

---

## 🚀 Cách Sử Dụng V0

### Bước 1: Truy cập V0
1. Vào https://v0.dev
2. Đăng nhập với tài khoản Vercel
3. Nhấn "New" để tạo project mới

### Bước 2: Copy Prompt
1. Mở file `V0_PROMPTS_GUIDE.md`
2. Copy prompt bạn muốn (ví dụ: Prompt 1.1)
3. Paste vào v0

### Bước 3: Customize
1. v0 sẽ generate code
2. Review và điều chỉnh nếu cần
3. Nhấn "Refine" để chỉnh sửa
4. Export code khi hài lòng

### Bước 4: Tích Hợp
1. Copy code vào project Next.js của bạn
2. Install dependencies cần thiết
3. Kết nối với Backend APIs
4. Test và debug

---

## 📝 Thứ Tự Implement Đề Xuất

### 🔵 TUẦN 1: Foundation (Nền tảng)

**Ngày 1-2:**
```
✅ Prompt 1.1: Project Setup & Design System
→ v0 tạo: 
  - Next.js project structure
  - TailwindCSS config với màu IELTSGo
  - Shadcn/UI setup
  - API client base
```

**Ngày 3-4:**
```
✅ Prompt 1.2: Layout Components
→ v0 tạo:
  - MainLayout với Sidebar
  - Navbar với search
  - Footer
  - Responsive design
```

**Ngày 5-7:**
```
✅ Prompt 7.1: Shared Components
→ v0 tạo:
  - Loading states
  - Empty states
  - Error boundaries
  - Reusable components
```

---

### 🟢 TUẦN 2: Authentication & Profile

**Ngày 8-10:**
```
✅ Prompt 2.1: Authentication Pages
→ v0 tạo:
  - Login page (email/password + Google OAuth)
  - Register page
  - Forgot password
  - Form validation
```

**API cần kết nối:**
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/google/url
- POST /api/v1/auth/google/token

**Ngày 11-14:**
```
✅ Prompt 2.2: User Profile & Settings
→ v0 tạo:
  - Profile page với tabs
  - Settings (preferences, security, notifications)
  - Avatar upload
  - Form validation
```

**API cần kết nối:**
- GET /api/v1/user/profile
- PUT /api/v1/user/profile
- GET /api/v1/user/preferences
- PUT /api/v1/user/preferences

---

### 🔵 TUẦN 3: Course System

**Ngày 15-18:**
```
✅ Prompt 3.1: Course Browse & Detail
→ v0 tạo:
  - Courses list với filters
  - Course detail page với modules
  - Reviews section
  - Enrollment flow
```

**API cần kết nối:**
- GET /api/v1/courses
- GET /api/v1/courses/:id
- POST /api/v1/enrollments
- GET /api/v1/categories

**Ngày 19-21:**
```
✅ Prompt 3.2: Lesson Player
→ v0 tạo:
  - Video player với controls
  - Text lesson viewer
  - Quiz player
  - Navigation sidebar
  - Progress tracking
```

**API cần kết nối:**
- GET /api/v1/lessons/:id
- POST /api/v1/videos/track
- POST /api/v1/progress/lessons/:id

---

### 🟢 TUẦN 4: Exercise System

**Ngày 22-24:**
```
✅ Prompt 4.1: Exercise Browse & Start
→ v0 tạo:
  - Exercises list với filters
  - Exercise detail page
  - Start exercise flow
  - Previous attempts history
```

**API cần kết nối:**
- GET /api/v1/exercises
- GET /api/v1/exercises/:id
- POST /api/v1/submissions
- GET /api/v1/submissions/my

**Ngày 25-28:**
```
✅ Prompt 4.2: Exercise Player & Submission
→ v0 tạo:
  - Exercise player (all question types)
  - Timer và navigation
  - Submit flow
  - Results page với analysis
```

**API cần kết nối:**
- POST /api/v1/submissions
- PUT /api/v1/submissions/:id/answers
- GET /api/v1/submissions/:id/result

---

### 🔵 TUẦN 5: Dashboard & Progress

**Ngày 29-31:**
```
✅ Prompt 5.1: Dashboard Overview
→ v0 tạo:
  - Dashboard với stats cards
  - Charts (study time, progress)
  - Recent activity
  - Quick actions
  - Leaderboard widget
```

**API cần kết nối:**
- GET /api/v1/user/statistics
- GET /api/v1/user/progress
- GET /api/v1/user/leaderboard

**Ngày 32-35:**
```
✅ Prompt 5.2: Detailed Progress & Analytics
→ v0 tạo:
  - Progress tabs (Overview, Skills, History, Goals)
  - Charts và analytics
  - Calendar view
  - Goals management
  - Achievements showcase
```

**API cần kết nối:**
- GET /api/v1/user/progress/history
- GET /api/v1/user/achievements
- POST /api/v1/user/goals

---

### 🟢 TUẦN 6: Social & Polish

**Ngày 36-38:**
```
✅ Prompt 6.1: Notifications System
→ v0 tạo:
  - Notification bell với dropdown
  - Notifications page
  - Preferences modal
  - Real-time updates
```

**API cần kết nối:**
- GET /api/v1/notifications
- GET /api/v1/notifications/unread-count
- PUT /api/v1/notifications/:id/read
- PUT /api/v1/notifications/preferences

**Ngày 39-40:**
```
✅ Prompt 6.2: Leaderboard & Social
→ v0 tạo:
  - Leaderboard page
  - Top 3 podium
  - User ranking table
  - Rewards system
```

**API cần kết nối:**
- GET /api/v1/user/leaderboard
- GET /api/v1/user/leaderboard/rank

**Ngày 41-42:**
```
✅ Prompt 7.2: Mobile Optimizations
→ v0 tạo:
  - Bottom navigation (mobile)
  - Mobile sidebar
  - Touch gestures
  - PWA setup
```

---

## 🎨 Màu Sắc Hệ Thống (Từ Logo IELTSGo)

### Palette Chính

```css
/* Primary - Red (Đỏ - màu chủ đạo) */
--primary: #ED372A
--primary-hover: #d42e22
--primary-light: #fee2e2

/* Secondary - Dark (Đen/Xám đậm) */
--secondary: #101615
--secondary-hover: #1f2937
--secondary-light: #f3f4f6

/* Accent - Cream/Beige (Be/Vàng nhạt) */
--accent: #FEF7EC
--accent-hover: #f5e5d3
--accent-light: #fffbf5

/* Dark Red - Shadow (Đỏ sẫm - bóng/chiều sâu) */
--dark-red: #B92819
--dark-red-hover: #a01f12

/* Neutral */
--background: #F9FAFB
--text: #1F2937
--gray: #6B7280
```

### Cách Sử dụng

```tsx
// Button Primary (Đỏ IELTSGo)
<Button className="bg-primary hover:bg-primary-hover text-white">
  Enroll Now
</Button>

// Button Secondary (Đen)
<Button className="bg-secondary hover:bg-secondary-hover text-white">
  Learn More
</Button>

// Card với nền Cream
<Card className="bg-accent border-gray-200">
  <CardContent>Course content</CardContent>
</Card>

// Badge với Dark Red
<Badge className="bg-dark-red text-white">
  Premium
</Badge>
```

---

## 🔧 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Components:** Shadcn/UI
- **State:** Zustand
- **API:** React Query + Axios
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts / Chart.js

### Backend (Đã có sẵn)
- **API Gateway:** Port 8080
- **Services:** Microservices (Auth, User, Course, Exercise, Notification)
- **Database:** PostgreSQL
- **Auth:** JWT

---

## 📦 Cài Đặt Dependencies

```bash
# Create Next.js project
npx create-next-app@latest ieltsgo-frontend --typescript --tailwind --app

# Install Shadcn/UI
npx shadcn-ui@latest init

# Install dependencies
npm install axios react-query zustand
npm install react-hook-form zod @hookform/resolvers
npm install recharts
npm install lucide-react
npm install date-fns
npm install react-hot-toast
npm install @radix-ui/react-avatar @radix-ui/react-dropdown-menu
```

---

## 🔗 Kết Nối Backend API

### 1. Tạo API Client

```typescript
// lib/api/client.ts
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
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

### 2. Tạo API Services

```typescript
// lib/api/auth.ts
import apiClient from './client'

export const authAPI = {
  register: (data: RegisterData) =>
    apiClient.post('/auth/register', data),
  
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  googleAuthUrl: () =>
    apiClient.get('/auth/google/url'),
}
```

### 3. Sử Dụng React Query

```typescript
// In component
import { useMutation, useQuery } from 'react-query'
import { authAPI } from '@/lib/api/auth'

const { mutate: login, isLoading } = useMutation(
  authAPI.login,
  {
    onSuccess: (data) => {
      localStorage.setItem('token', data.data.access_token)
      router.push('/dashboard')
    },
    onError: (error) => {
      toast.error('Login failed')
    },
  }
)
```

---

## 💡 Tips Khi Dùng V0

### 1. Prompt Hiệu Quả

**❌ Tránh:**
```
"Create a dashboard"
```

**✅ Nên:**
```
Create a student dashboard for IELTS learning platform with:
- 4 stat cards showing study time, exercises, score, streak
- Line chart for progress (last 7 days)
- List of enrolled courses with progress bars
- Recent activity timeline
Use colors from IELTSGo logo: red #ED372A, dark #101615, cream #FEF7EC
Use Shadcn components
```

### 2. Refine Gradually

- Tạo component cơ bản trước
- Sau đó refine thêm features
- Không yêu cầu quá nhiều trong 1 prompt

### 3. Reuse Components

- Generate components nhỏ, tái sử dụng được
- Sau đó compose thành components lớn hơn

### 4. Responsive Design

Luôn nhắc v0:
```
Make it responsive:
- Mobile: single column
- Tablet: 2 columns  
- Desktop: 3 columns
```

### 5. TypeScript Types

Luôn yêu cầu:
```
Use TypeScript with proper types for:
- Props
- API responses
- Form data
```

---

## ✅ Checklist Cho Mỗi Component

Khi v0 generate xong, check:

- [ ] TypeScript types đầy đủ
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Loading state
- [ ] Error state
- [ ] Empty state
- [ ] Dark mode (nếu cần)
- [ ] Accessibility (ARIA labels)
- [ ] Colors đúng với IELTSGo brand
- [ ] API integration (nếu cần)
- [ ] Form validation (nếu là form)

---

## 🐛 Troubleshooting

### Lỗi: Component không responsive

**Giải pháp:**
```
Refine prompt: "Make this responsive using Tailwind breakpoints sm, md, lg, xl"
```

### Lỗi: Colors không đúng

**Giải pháp:**
```
Refine: "Use these exact colors from IELTSGo logo: 
- Primary Red: #ED372A
- Secondary Dark: #101615
- Accent Cream: #FEF7EC
- Dark Red: #B92819"
```

### Lỗi: Missing TypeScript types

**Giải pháp:**
```
Refine: "Add TypeScript interfaces for all props and data structures"
```

### Lỗi: API integration

**Giải pháp:**
```
Tự add React Query và API calls sau khi có component UI
```

---

## 📚 Tài Liệu Tham Khảo

### Bên Ngoài
- [v0 Documentation](https://v0.dev/docs)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Shadcn/UI](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query)

### Trong Project
- `V0_PROMPTS_GUIDE.md` - Tất cả prompts chi tiết
- `FINAL_SYSTEM_TEST_REPORT.md` - Backend API documentation
- `docs/API_ENDPOINTS.md` - API endpoints list

---

## 🎯 Mục Tiêu Cuối Cùng

Sau 6 tuần, bạn sẽ có:

✅ **Complete Frontend cho IELTSGo:**
- ✅ Authentication (Login, Register, OAuth)
- ✅ User Profile & Settings
- ✅ Course Browsing & Learning
- ✅ Lesson Player (Video, Text, Quiz)
- ✅ Exercise Practice System
- ✅ Progress Tracking & Analytics
- ✅ Dashboard với Charts
- ✅ Notifications System
- ✅ Leaderboard
- ✅ Mobile Responsive
- ✅ Dark Mode
- ✅ PWA Support

**Kết nối đầy đủ với:**
- ✅ 80+ Backend API endpoints
- ✅ JWT Authentication
- ✅ Real-time updates
- ✅ File uploads
- ✅ Progress tracking

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Connect to Vercel
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL

# Deploy
vercel --prod
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.ieltsgo.com/api/v1
NEXT_PUBLIC_APP_URL=https://ieltsgo.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

---

## 💪 Bắt Đầu Ngay

### Bước 1: Setup Project

```bash
# 1. Create Next.js project
npx create-next-app@latest ieltsgo-frontend --typescript --tailwind --app

cd ieltsgo-frontend

# 2. Install Shadcn
npx shadcn-ui@latest init

# 3. Install dependencies
npm install axios react-query zustand react-hook-form zod
```

### Bước 2: Copy Prompt Đầu Tiên

1. Mở `V0_PROMPTS_GUIDE.md`
2. Copy **Prompt 1.1: Project Setup & Design System**
3. Paste vào v0.dev
4. Generate và export code

### Bước 3: Tiếp Tục Với Các Prompts Khác

Làm theo thứ tự trong file `V0_PROMPTS_GUIDE.md`

---

## 🎉 Chúc Bạn Thành Công!

Hệ thống Backend đã hoàn chỉnh và sẵn sàng. Giờ là lúc xây dựng Frontend tuyệt vời với v0!

**Questions?** 
- Read `V0_PROMPTS_GUIDE.md` for detailed prompts
- Check `FINAL_SYSTEM_TEST_REPORT.md` for API docs
- Review backend APIs at `http://localhost:8080`

**Happy Coding! 🚀**

# IELTSGo - Kiến trúc hệ thống chi tiết

## Tổng quan kiến trúc

IELTSGo được xây dựng theo mô hình **Layered Architecture** với các tầng rõ ràng, dễ maintain và mở rộng.

## 1. Presentation Layer (Tầng giao diện)

### Mục đích
- Hiển thị UI cho người dùng
- Xử lý user interactions
- Render data từ Business Logic Layer

### Components

#### Layout Components
\`\`\`
components/layout/
├── navbar.tsx              # Navigation bar chính
├── sidebar.tsx             # Sidebar cho student dashboard
├── footer.tsx              # Footer
├── app-layout.tsx          # Layout wrapper cho student pages
└── logo.tsx                # Logo component
\`\`\`

#### Admin Components
\`\`\`
components/admin/
├── admin-layout.tsx        # Layout cho admin pages
├── admin-sidebar.tsx       # Admin navigation sidebar
├── admin-header.tsx        # Admin header với breadcrumbs
├── user-table.tsx          # User management table
├── user-filters.tsx        # User filters
└── user-form-modal.tsx     # User create/edit modal
\`\`\`

#### Instructor Components
\`\`\`
components/instructor/
├── instructor-layout.tsx   # Layout cho instructor pages
└── instructor-navbar.tsx   # Instructor navigation
\`\`\`

#### Feature Components
\`\`\`
components/
├── courses/
│   ├── course-card.tsx     # Course display card
│   └── course-filters.tsx  # Course filtering
├── exercises/
│   ├── exercise-card.tsx   # Exercise display card
│   └── exercise-filters.tsx # Exercise filtering
├── dashboard/
│   ├── stat-card.tsx       # Statistics card
│   ├── progress-chart.tsx  # Progress visualization
│   ├── skill-progress-card.tsx # Skill progress display
│   └── activity-timeline.tsx # Activity feed
└── notifications/
    ├── notification-bell.tsx # Notification icon with badge
    ├── notification-list.tsx # Notification dropdown
    └── notification-item.tsx # Individual notification
\`\`\`

### Design Patterns

#### Composition Pattern
Components được compose lại với nhau:
\`\`\`tsx
<AppLayout showSidebar showFooter>
  <ProtectedRoute>
    <DashboardContent />
  </ProtectedRoute>
</AppLayout>
\`\`\`

#### Render Props Pattern
\`\`\`tsx
<DataFetcher
  url="/api/courses"
  render={(data, loading, error) => (
    loading ? <Spinner /> : <CourseList courses={data} />
  )}
/>
\`\`\`

## 2. Business Logic Layer (Tầng logic nghiệp vụ)

### Mục đích
- Xử lý business logic
- Quản lý application state
- Validate data trước khi gửi lên server

### Contexts

#### AuthContext
\`\`\`typescript
// lib/contexts/auth-context.tsx
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
}
\`\`\`

**Responsibilities:**
- Quản lý user authentication state
- Store và refresh JWT tokens
- Provide user info to components
- Handle login/logout/register

### Custom Hooks

#### useMediaQuery
\`\`\`typescript
// lib/hooks/use-media-query.ts
export function useMediaQuery(query: string): boolean
\`\`\`
- Detect screen size changes
- Responsive behavior in components

#### useDebounce
\`\`\`typescript
// lib/hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T
\`\`\`
- Debounce search inputs
- Optimize API calls

#### useLocalStorage
\`\`\`typescript
// lib/hooks/use-local-storage.ts
export function useLocalStorage<T>(key: string, initialValue: T)
\`\`\`
- Persist data to localStorage
- Sync state with localStorage

### Validation Logic

#### Form Validation
\`\`\`typescript
// Example in login page
const validateForm = () => {
  if (!email || !email.includes('@')) {
    setError('Email không hợp lệ')
    return false
  }
  if (!password || password.length < 6) {
    setError('Mật khẩu phải có ít nhất 6 ký tự')
    return false
  }
  return true
}
\`\`\`

## 3. Service Layer (Tầng dịch vụ)

### Mục đích
- Centralize API calls
- Handle HTTP requests/responses
- Manage tokens và authentication
- Error handling

### API Client

#### Base Configuration
\`\`\`typescript
// lib/api/apiClient.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})
\`\`\`

#### Request Interceptor
\`\`\`typescript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
\`\`\`

#### Response Interceptor
\`\`\`typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      // If failed, logout user
    }
    return Promise.reject(error)
  }
)
\`\`\`

### API Services

#### Auth API
\`\`\`typescript
// lib/api/auth.ts
export const authApi = {
  login: (credentials: LoginCredentials) => 
    apiClient.post<AuthResponse>('/auth/login', credentials),
  
  register: (data: RegisterData) => 
    apiClient.post<AuthResponse>('/auth/register', data),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  refreshToken: () => 
    apiClient.post<AuthResponse>('/auth/refresh'),
}
\`\`\`

#### Courses API
\`\`\`typescript
// lib/api/courses.ts
export const coursesApi = {
  getCourses: (filters: CourseFilters, page: number, pageSize: number) =>
    apiClient.get<PaginatedResponse<Course>>('/courses', { params }),
  
  getCourseById: (id: string) =>
    apiClient.get<Course>(`/courses/${id}`),
  
  enrollCourse: (courseId: string) =>
    apiClient.post(`/courses/${courseId}/enroll`),
  
  getLessons: (courseId: string) =>
    apiClient.get<Lesson[]>(`/courses/${courseId}/lessons`),
}
\`\`\`

#### Pattern cho tất cả API services
- Mỗi domain có 1 file riêng (auth, courses, exercises, etc.)
- Export object với methods
- Type-safe với TypeScript generics
- Consistent error handling

## 4. Data Layer (Tầng dữ liệu)

### Mục đích
- Define data structures
- Type safety với TypeScript
- Shared types across application

### Core Types

#### User Types
\`\`\`typescript
// types/index.ts
export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'instructor' | 'admin'
  avatar?: string
  level: Level
  targetScore: number
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}
\`\`\`

#### Course Types
\`\`\`typescript
export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  instructor: User
  level: Level
  skillType: SkillType
  duration: number
  lessonsCount: number
  studentsCount: number
  rating: number
  price: number
  modules: Module[]
  createdAt: string
  updatedAt: string
}
\`\`\`

#### Exercise Types
\`\`\`typescript
export interface Exercise {
  id: string
  title: string
  description: string
  skillType: SkillType
  difficulty: Difficulty
  duration: number
  questionsCount: number
  questions: Question[]
  createdAt: string
}
\`\`\`

### API Response Types

#### Generic Response
\`\`\`typescript
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
\`\`\`

#### Paginated Response
\`\`\`typescript
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
\`\`\`

## 5. Routing Architecture

### App Router Structure

\`\`\`
app/
├── (public)/              # Public routes (no auth required)
│   ├── page.tsx           # Landing page
│   ├── login/
│   └── register/
│
├── (student)/             # Student routes (auth required)
│   ├── dashboard/
│   ├── courses/
│   ├── exercises/
│   ├── progress/
│   └── profile/
│
├── admin/                 # Admin routes (admin role required)
│   ├── layout.tsx         # Admin layout with RoleProtectedRoute
│   ├── page.tsx           # Admin dashboard
│   ├── users/
│   ├── content/
│   ├── analytics/
│   ├── notifications/
│   └── settings/
│
└── instructor/            # Instructor routes (instructor role required)
    ├── layout.tsx         # Instructor layout with RoleProtectedRoute
    ├── page.tsx           # Instructor dashboard
    ├── courses/
    ├── exercises/
    ├── students/
    └── messages/
\`\`\`

### Route Protection

#### ProtectedRoute Component
\`\`\`tsx
// components/auth/protected-route.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!user) redirect('/login')
  
  return <>{children}</>
}
\`\`\`

#### RoleProtectedRoute Component
\`\`\`tsx
// components/auth/role-protected-route.tsx
export function RoleProtectedRoute({
  children,
  allowedRoles
}: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  if (!user) redirect('/login')
  if (!allowedRoles.includes(user.role)) redirect('/dashboard')
  
  return <>{children}</>
}
\`\`\`

## 6. State Management Flow

### Authentication Flow

\`\`\`
1. User enters credentials
   ↓
2. Component calls authContext.login()
   ↓
3. AuthContext calls authApi.login()
   ↓
4. API returns token + user data
   ↓
5. AuthContext stores token in localStorage
   ↓
6. AuthContext updates user state
   ↓
7. Component redirects to dashboard
\`\`\`

### Data Fetching Flow

\`\`\`
1. Component mounts
   ↓
2. useEffect calls API service
   ↓
3. Set loading state
   ↓
4. API service makes HTTP request
   ↓
5. Response interceptor handles response
   ↓
6. Update component state with data
   ↓
7. Render UI with data
\`\`\`

## 7. Error Handling Strategy

### API Level
\`\`\`typescript
try {
  const response = await apiClient.get('/courses')
  return response.data
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.message || 'API Error')
  }
  throw error
}
\`\`\`

### Component Level
\`\`\`tsx
const [error, setError] = useState<string | null>(null)

try {
  await fetchData()
} catch (err) {
  setError(err instanceof Error ? err.message : 'Unknown error')
}

{error && <Alert variant="destructive">{error}</Alert>}
\`\`\`

### Global Level (Interceptor)
\`\`\`typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    if (error.response?.status === 500) {
      // Show global error toast
    }
    return Promise.reject(error)
  }
)
\`\`\`

## 8. Performance Optimization

### Code Splitting
- Automatic với Next.js App Router
- Dynamic imports cho heavy components

### Image Optimization
- Next.js Image component
- Automatic lazy loading
- WebP format

### API Optimization
- Debounced search inputs
- Pagination for large lists
- Caching với SWR (future)

## 9. Security Considerations

### Authentication
- JWT tokens với expiration
- Automatic token refresh
- Secure token storage (httpOnly cookies recommended)

### Authorization
- Role-based access control
- Route protection
- API endpoint protection

### XSS Prevention
- React automatic escaping
- Sanitize user inputs
- Content Security Policy headers

### CSRF Prevention
- CSRF tokens for mutations
- SameSite cookie attribute

## 10. Scalability Considerations

### Current Architecture
- Supports up to 10,000 concurrent users
- Modular structure allows easy feature addition
- Clear separation of concerns

### Future Scaling Options
- **State Management**: Migrate to Redux/Zustand if needed
- **Data Fetching**: Implement SWR or React Query
- **Backend**: Microservices architecture
- **Database**: Sharding and replication
- **Caching**: Redis for API responses
- **CDN**: CloudFront for static assets

## 11. Testing Strategy (Future)

### Unit Tests
- Test individual components
- Test utility functions
- Test API services

### Integration Tests
- Test component interactions
- Test API integration
- Test authentication flow

### E2E Tests
- Test complete user flows
- Test critical paths
- Test across browsers

---

Kiến trúc này được thiết kế để:
- ✅ Dễ maintain và debug
- ✅ Dễ mở rộng với features mới
- ✅ Type-safe với TypeScript
- ✅ Scalable cho growth
- ✅ Testable với clear boundaries

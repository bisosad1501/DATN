# 👑 V0 PROMPTS - ADMIN DASHBOARD (IELTSGO)

> Prompts for v0 by Vercel to build Admin dashboard for IELTSGo platform

**Prerequisites**: Read `ROLES_AND_PERMISSIONS.md` for full context

---

## 🎨 Brand Colors (IELTSGo Logo)

```css
--primary: #ED372A;        /* Red - Main brand */
--secondary: #101615;      /* Dark - Text/headers */
--accent: #FEF7EC;         /* Cream - Backgrounds */
--dark-red: #B92819;       /* Shadow/depth */
```

---

## 📋 ADMIN DASHBOARD STRUCTURE

### Main Sections:
1. **Overview Dashboard** - System stats, charts, quick actions
2. **User Management** - CRUD users, assign roles, manage accounts
3. **Content Management** - Review/moderate courses & exercises
4. **Analytics & Reports** - Comprehensive system analytics
5. **Notification Center** - Bulk send, templates, scheduler
6. **System Settings** - Configuration, health monitoring

---

# LAYER 1: ADMIN LAYOUT & NAVIGATION

## Prompt 1.1: Admin Sidebar & Layout

```
Create an admin dashboard layout for IELTSGo (IELTS learning platform) with:

LAYOUT STRUCTURE:
- Fixed sidebar (280px wide) with logo at top
- Collapsible sidebar (icon-only mode 80px)
- Main content area with header bar
- Breadcrumbs below header
- Footer with system status indicators

SIDEBAR NAVIGATION:
1. 📊 Dashboard (default active)
2. 👥 Users
   - All Users
   - Students
   - Instructors
   - Admins
3. 📚 Content
   - Courses
   - Exercises
   - Reviews
   - Question Bank
4. 📊 Analytics
   - Overview
   - User Analytics
   - Content Analytics
   - Engagement
5. 📢 Notifications
   - Send Notification
   - Bulk Send
   - Scheduled
   - Templates
6. ⚙️ System
   - Settings
   - Health Monitor
   - Logs
   - Database

HEADER BAR:
- Breadcrumbs (left)
- Search bar (center)
- Notification bell with count
- Admin profile dropdown (right)
  - View Profile
   - Settings
   - Switch to Instructor View
   - Switch to Student View
   - Logout

DESIGN:
- Sidebar: Dark background (#101615) with red accents (#ED372A)
- Active menu item: Red background with white text
- Hover states: Lighter dark (#1f2937)
- Icons: Use Lucide React icons
- Logo: "IELTSGo Admin" in red
- Responsive: Hide sidebar on mobile, show hamburger menu

COLORS:
- Primary Red: #ED372A (active states, logo)
- Dark: #101615 (sidebar background)
- Cream: #FEF7EC (main content background)
- Text: White for sidebar, #101615 for content

TECH STACK:
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn/UI components
- Lucide React for icons
```

---

# LAYER 2: DASHBOARD OVERVIEW

## Prompt 2.1: Admin Dashboard Overview

```
Create an admin dashboard overview page for IELTSGo with:

PAGE LAYOUT:
- Full-width dashboard with 4 stat cards at top
- 2 large charts in middle row
- Activity feed on right sidebar
- Quick actions panel at bottom

STAT CARDS (Grid 4 columns):
1. Total Users
   - Count with icon (Users)
   - Trend indicator (+12% this month)
   - Breakdown: Students, Instructors, Admins
   - Color: Blue gradient

2. Total Courses
   - Count with icon (BookOpen)
   - Active/Draft breakdown
   - Most popular course name
   - Color: Green gradient

3. Total Exercises
   - Count with icon (PenTool)
   - Completed submissions today
   - Average completion rate
   - Color: Orange gradient

4. System Health
   - Status indicator (green dot)
   - "All services operational"
   - CPU/Memory usage bars
   - Color: Red gradient (#ED372A)

CHARTS (Grid 2 columns):
1. User Growth Chart (Line chart)
   - Last 30 days
   - Lines for: Total, Students, Instructors
   - X-axis: Dates
   - Y-axis: User count
   - Use Recharts library

2. Enrollment Statistics (Bar chart)
   - Last 7 days
   - Bars for: New enrollments, Completions
   - Color scheme: Red (#ED372A) and Dark (#101615)

ACTIVITY FEED (Right sidebar, scrollable):
- Real-time activity list
- Show last 20 activities:
  * New user registrations
  * Course publications
  * Exercise submissions
  * Review submissions
- Each item: Avatar, action text, timestamp
- Auto-refresh every 30 seconds

QUICK ACTIONS PANEL (Bottom, grid 4 columns):
- "Create Notification" button → modal
- "Add New User" button → form
- "Review Pending Content" button → /content
- "View System Logs" button → /system/logs

DESIGN:
- Stat cards: White background, shadow, rounded corners
- Charts: White background cards with padding
- Activity feed: Cream background (#FEF7EC), scrollbar styled
- Use red (#ED372A) for primary actions
- Responsive: Stack cards on mobile

API INTEGRATION:
- GET /api/v1/admin/analytics/overview
- GET /api/v1/admin/analytics/users (for chart)
- GET /api/v1/admin/analytics/enrollments (for chart)
- WebSocket for real-time activity feed

TYPESCRIPT TYPES:
interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalAdmins: number
  totalCourses: number
  activeCourses: number
  draftCourses: number
  totalExercises: number
  submissionsToday: number
  averageCompletionRate: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  cpuUsage: number
  memoryUsage: number
}

interface Activity {
  id: string
  type: 'user' | 'course' | 'exercise' | 'review'
  action: string
  actorName: string
  actorAvatar?: string
  timestamp: string
}

LIBRARIES:
- recharts for charts
- date-fns for date formatting
- Lucide React for icons
- Shadcn/UI Card, Badge, Button components
```

---

# LAYER 3: USER MANAGEMENT

## Prompt 3.1: User Management Table

```
Create a comprehensive user management page for IELTSGo admin with:

PAGE STRUCTURE:
- Header with title "User Management" and "Add User" button
- Filter bar with tabs and search
- Data table with sorting and pagination
- Bulk action toolbar (when rows selected)

FILTER BAR:
- Tabs: All | Students | Instructors | Admins
- Search input (by name, email)
- Filter dropdowns:
  * Status: All, Active, Inactive, Locked
  * Registration date: Last 7 days, 30 days, All time
- Export button (CSV)

DATA TABLE (Columns):
1. Checkbox (select row)
2. Avatar + Name
   - Display avatar image
   - Name (clickable → detail)
   - Email below name (muted)
3. Role
   - Badge with color:
     * Student: Blue
     * Instructor: Green
     * Admin: Red (#ED372A)
   - Can have multiple roles
4. Status
   - Active: Green dot + text
   - Inactive: Gray dot + text
   - Locked: Red dot + text
5. Enrolled Courses (for students)
   - Count with link
6. Created Courses (for instructors)
   - Count with link
7. Last Login
   - Formatted date (e.g., "2 days ago")
8. Actions
   - Three-dot menu with:
     * View Details
     * Edit User
     * Assign Role
     * Activate/Deactivate
     * Lock/Unlock
     * Reset Password
     * Delete User (with confirmation)

BULK ACTIONS (when ≥1 row selected):
- Floating toolbar at bottom
- Shows: "X users selected"
- Actions:
  * Assign Role (bulk)
  * Activate (bulk)
  * Deactivate (bulk)
  * Export Selected
  * Delete Selected (with confirmation)

TABLE FEATURES:
- Sortable columns (click header)
- Pagination: 10, 25, 50, 100 rows per page
- Loading skeleton when fetching
- Empty state: "No users found"
- Hover effect on rows

DESIGN:
- Table: White background, bordered
- Header: Dark text (#101615), sticky
- Badges: Rounded, small
- Actions: Icon buttons with tooltips
- Red (#ED372A) for delete actions
- Responsive: Horizontal scroll on mobile

API INTEGRATION:
- GET /api/v1/admin/users?page=1&limit=25&role=student&status=active&search=query
- PUT /api/v1/admin/users/:id/activate
- PUT /api/v1/admin/users/:id/deactivate
- PUT /api/v1/admin/users/:id/lock
- PUT /api/v1/admin/users/:id/unlock
- POST /api/v1/admin/users/:id/assign-role
- DELETE /api/v1/admin/users/:id

TYPESCRIPT TYPES:
interface User {
  id: string
  email: string
  fullName: string
  avatar?: string
  roles: ('student' | 'instructor' | 'admin')[]
  status: 'active' | 'inactive' | 'locked'
  enrolledCoursesCount?: number
  createdCoursesCount?: number
  lastLoginAt: string
  createdAt: string
}

interface UserFilters {
  role?: 'student' | 'instructor' | 'admin'
  status?: 'active' | 'inactive' | 'locked'
  search?: string
  dateFrom?: string
  dateTo?: string
}

LIBRARIES:
- @tanstack/react-table for table
- Shadcn/UI Table, Badge, Dropdown components
- Lucide React icons
- date-fns for dates
```

## Prompt 3.2: User Detail & Edit Modal

```
Create a user detail/edit modal for IELTSGo admin with:

MODAL STRUCTURE:
- Large modal (800px width)
- Tabbed interface with 4 tabs
- Save/Cancel buttons at bottom

TABS:
1. Profile (default)
2. Roles & Permissions
3. Activity & Login History
4. Danger Zone

TAB 1: PROFILE
- Avatar section (left):
  * Large avatar display (120px)
  * "Change Avatar" button
  * Upload and preview
- Info fields (right, in grid 2 columns):
  * Full Name (input)
  * Email (input)
  * Phone (input, optional)
  * Bio (textarea)
  * Language Preference (select)
  * Timezone (select)
  * Registration Date (readonly, formatted)
  * Last Login (readonly, formatted)
  * Last Login IP (readonly)
- Status toggle:
  * Active/Inactive switch
  * Email Verified badge
  * Account Locked indicator

TAB 2: ROLES & PERMISSIONS
- Current Roles section:
  * List of assigned roles with badges
  * Remove role button (X) for each
- Add Role section:
  * Select dropdown: Student, Instructor, Admin
  * "Assign Role" button (red #ED372A)
- Permissions Preview:
  * Show permissions based on roles
  * Readonly list with checkmarks
  * Categories: Courses, Exercises, Users, System, Analytics

TAB 3: ACTIVITY & LOGIN HISTORY
- Study Stats (for students):
  * Total study hours
  * Courses enrolled
  * Exercises completed
  * Current streak
- Content Stats (for instructors):
  * Courses created
  * Exercises created
  * Total students taught
- Login History Table:
  * Date/Time
  * IP Address
  * Device Type
  * Location (if available)
  * Status (Success/Failed)
  * Last 20 entries
- Failed Login Attempts:
  * Count with warning icon
  * Reset button

TAB 4: DANGER ZONE
- Warning box (red border):
  * Title: "Danger Zone"
  * Subtitle: "Irreversible actions"
- Actions (each with confirmation modal):
  1. Lock Account
     - Button: "Lock Account"
     - Reason textarea
     - Confirm with password
  2. Reset Password
     - Button: "Force Password Reset"
     - Send email to user
  3. Revoke All Sessions
     - Button: "Logout All Devices"
     - Kills all refresh tokens
  4. Delete Account
     - Button: "Delete User" (red)
     - Confirmation with "DELETE" text input
     - Soft delete vs hard delete option

DESIGN:
- Modal: White background, rounded, shadow
- Tabs: Red underline for active (#ED372A)
- Form: 2-column grid, labeled inputs
- Badges: Color-coded by role
- Danger actions: Red background on hover
- Save button: Red (#ED372A)
- Cancel: Gray outline

API INTEGRATION:
- GET /api/v1/admin/users/:id (load data)
- PUT /api/v1/admin/users/:id (update profile)
- POST /api/v1/admin/users/:id/assign-role
- DELETE /api/v1/admin/users/:id/revoke-role
- POST /api/v1/admin/users/:id/lock
- POST /api/v1/admin/users/:id/unlock
- POST /api/v1/admin/users/:id/reset-password
- DELETE /api/v1/admin/users/:id

VALIDATION:
- Email: Valid email format
- Phone: Optional, international format
- Role assignment: Cannot remove last admin role
- Deletion: Require confirmation text match

LIBRARIES:
- Shadcn/UI Dialog, Tabs, Form components
- React Hook Form for validation
- Zod for schema validation
- Lucide React icons
```

---

# LAYER 4: CONTENT MANAGEMENT

## Prompt 4.1: Content Review Queue

```
Create a content review and moderation page for IELTSGo admin with:

PAGE LAYOUT:
- Header with title "Content Management"
- Stats cards (3 columns)
- Tabs for content types
- Content cards grid with filters

STATS CARDS:
1. Pending Review
   - Count with clock icon
   - "Requires attention"
2. Published Today
   - Count with check icon
   - Approval rate percentage
3. Flagged Content
   - Count with flag icon
   - Needs moderation

TABS:
1. Courses (default)
2. Exercises
3. Reviews
4. Reported Content

TAB 1: COURSES
- Filter sidebar (left 25%):
  * Status: All, Draft, Published, Archived
  * Created by: Select instructor
  * Date range: Calendar picker
  * Level: Beginner, Intermediate, Advanced
  * Category: IELTS skill filters
- Course cards grid (right 75%):
  * Card shows:
    - Thumbnail image
    - Course title
    - Instructor name + avatar
    - Status badge (Draft/Published/Archived)
    - Creation date
    - Enrollment count
    - Actions: View, Edit, Delete, Archive
  * 3 columns on desktop, 1 on mobile
- Pagination at bottom

TAB 2: EXERCISES
- Similar layout to Courses
- Exercise cards show:
  * Exercise title
  * Type badge (Reading, Listening, Writing, Speaking)
  * Difficulty badge (Easy, Medium, Hard)
  * Creator name
  * Question count
  * Submission count
  * Average score
  * Status (Draft/Published)
  * Actions: View, Edit, Analytics, Delete

TAB 3: REVIEWS
- Table layout:
  * Columns:
    - User (name + avatar)
    - Course/Exercise title
    - Rating (1-5 stars)
    - Comment (truncated, expandable)
    - Date
    - Status (Pending/Approved/Rejected)
    - Actions: Approve, Reject, Delete
  * Filter: Pending, Approved, Rejected, Flagged
  * Sort by: Date, Rating

TAB 4: REPORTED CONTENT
- Table of flagged/reported items:
  * Columns:
    - Content Type (Course/Exercise/Review)
    - Content Title (link)
    - Reported By (user)
    - Reason (select: Spam, Inappropriate, Copyright, Other)
    - Report Date
    - Status (Pending/Reviewed/Dismissed)
    - Actions: View Details, Take Action
  * "Take Action" opens modal:
    - View full report
    - View content
    - Actions: Approve, Remove Content, Ban User, Dismiss Report

DESIGN:
- Content cards: White background, hover shadow
- Status badges: Color-coded
  * Draft: Gray
  * Published: Green
  * Archived: Orange
  * Flagged: Red (#ED372A)
- Grid: Gap between cards
- Responsive: Stack filters on mobile

API INTEGRATION:
- GET /api/v1/admin/content/courses?status=draft&instructor=uuid
- GET /api/v1/admin/content/exercises?difficulty=medium
- GET /api/v1/admin/content/reviews?status=pending
- GET /api/v1/admin/content/reports?type=all
- PUT /api/v1/admin/content/reviews/:id/approve
- PUT /api/v1/admin/content/reviews/:id/reject
- DELETE /api/v1/admin/courses/:id
- DELETE /api/v1/admin/exercises/:id

TYPESCRIPT TYPES:
interface ContentItem {
  id: string
  type: 'course' | 'exercise'
  title: string
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  thumbnail?: string
}

interface Review {
  id: string
  userId: string
  userName: string
  contentId: string
  contentTitle: string
  contentType: 'course' | 'exercise'
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface Report {
  id: string
  reporterId: string
  reporterName: string
  contentId: string
  contentType: 'course' | 'exercise' | 'review'
  contentTitle: string
  reason: string
  details: string
  status: 'pending' | 'reviewed' | 'dismissed'
  createdAt: string
}

LIBRARIES:
- Shadcn/UI Card, Badge, Table, Dialog
- Lucide React icons
- React Query for data fetching
```

---

# LAYER 5: ANALYTICS & REPORTS

## Prompt 5.1: Comprehensive Analytics Dashboard

```
Create an advanced analytics dashboard for IELTSGo admin with:

PAGE STRUCTURE:
- Header with date range selector (last 7/30/90 days, custom)
- Export buttons (PDF, CSV, Excel)
- Multiple chart sections with tabs

SECTION 1: USER ANALYTICS
Tab subtabs: Overview | Growth | Engagement | Demographics

Overview Tab:
- 4 metric cards:
  * Total Users (all time)
  * New Users (period)
  * Active Users (period)
  * Churn Rate (percentage)
- User Growth Chart (Line):
  * X-axis: Dates
  * Y-axis: Cumulative users
  * Lines: Total, Students, Instructors
  * Area fill with gradient
- User Distribution (Pie chart):
  * Segments: Students (%), Instructors (%), Admins (%)
  * Colors: Blue, Green, Red (#ED372A)

Growth Tab:
- New Registrations Chart (Bar):
  * Daily/Weekly/Monthly toggle
  * Bars: New users per period
  * Overlay line: Trend
- Registration Sources (Donut chart):
  * Direct, Google OAuth, Referral
  * Percentages

Engagement Tab:
- Active Users Chart (Line):
  * Daily active users (DAU)
  * Weekly active users (WAU)
  * Monthly active users (MAU)
- Session Duration (Bar):
  * Average session length
  * Breakdown by role
- Feature Usage (Horizontal bar):
  * Courses viewed
  * Exercises attempted
  * Videos watched
  * Rankings by popularity

Demographics Tab:
- Country Distribution (Map):
  * Choropleth map
  * Hover shows count
- Age Distribution (Bar chart)
- Language Preferences (Pie)
- Timezone Distribution (Bar)

SECTION 2: CONTENT ANALYTICS
Tab subtabs: Courses | Exercises | Performance

Courses Tab:
- Top 10 Courses (Table):
  * Rank, Title, Instructor, Enrollments, Completion Rate, Avg Rating
  * Click title → course analytics detail
- Course Enrollments Trend (Line chart):
  * Over time
  * Filter by course or all
- Category Performance (Bar):
  * Enrollments by IELTS skill
  * Reading, Listening, Writing, Speaking

Exercises Tab:
- Exercise Completion Rates (Funnel):
  * Started → In Progress → Completed
  * Abandonment rate highlighted
- Top Exercises (Table):
  * Rank, Title, Type, Attempts, Avg Score, Difficulty
- Difficulty Distribution (Bar):
  * Count by Easy, Medium, Hard
- Average Scores Over Time (Line):
  * Shows learning improvement trend

Performance Tab:
- Overall System Performance:
  * API response times (line chart)
  * Database query times
  * Error rates
- Content Performance Matrix:
  * X-axis: Enrollments/Attempts
  * Y-axis: Completion Rate
  * Bubble size: Avg Score
  * Quadrants: Star Performers, Needs Improvement, etc.

SECTION 3: REVENUE ANALYTICS (if applicable)
- Total Revenue (card with trend)
- Revenue by Course (Table)
- Revenue Forecast (Line with confidence interval)
- Payment Methods (Pie chart)

SECTION 4: ENGAGEMENT METRICS
- Leaderboard Activity (Line):
  * Points earned over time
- Notification Engagement:
  * Sent, Delivered, Read, Clicked
  * Funnel chart
- Feature Adoption (Stacked bar):
  * New features usage over time

DESIGN:
- Chart cards: White background, shadow, padding
- Date picker: Red primary (#ED372A)
- Export buttons: Outline style
- Charts: Professional color palette
- Tooltips on hover with details
- Loading skeletons while fetching
- Responsive: Stack charts on mobile

API INTEGRATION:
- GET /api/v1/admin/analytics/users?from=date&to=date
- GET /api/v1/admin/analytics/courses?from=date&to=date
- GET /api/v1/admin/analytics/exercises?from=date&to=date
- GET /api/v1/admin/analytics/engagement?from=date&to=date
- GET /api/v1/admin/analytics/revenue?from=date&to=date
- POST /api/v1/admin/analytics/export?format=pdf

TYPESCRIPT TYPES:
interface AnalyticsData {
  period: { from: string; to: string }
  users: UserAnalytics
  content: ContentAnalytics
  engagement: EngagementMetrics
  revenue?: RevenueAnalytics
}

interface UserAnalytics {
  totalUsers: number
  newUsers: number
  activeUsers: number
  churnRate: number
  growthData: { date: string; count: number }[]
  distribution: { role: string; count: number; percentage: number }[]
}

LIBRARIES:
- Recharts for all charts
- react-date-picker for date range
- jsPDF for PDF export
- xlsx for Excel export
- Shadcn/UI Card, Tabs components
```

---

# LAYER 6: NOTIFICATION CENTER

## Prompt 6.1: Notification Management & Bulk Send

```
Create a notification management center for IELTSGo admin with:

PAGE LAYOUT:
- Header with "Create Notification" button (red #ED372A)
- Tabs: Send | Scheduled | History | Templates

TAB 1: SEND (Create & Send Notification)
- Large form with sections:

**Recipients Section:**
- Radio buttons:
  * All Users
  * By Role: Checkboxes for Student, Instructor, Admin
  * By Course: Select dropdown (multi-select)
  * By Status: Active, Inactive
  * Custom List: Upload CSV or paste user IDs
- Preview count: "Will send to X users"

**Content Section:**
- Notification Type: Select (Info, Success, Warning, Error, Announcement)
- Title: Input (required, max 100 chars)
- Message: Textarea (required, max 500 chars, rich text editor)
- Action Button (optional):
  * Button Text: Input
  * Button URL: Input (validate URL)
- Icon: Icon picker (optional)
- Preview pane on right:
  * Shows how notification will look
  * Desktop and mobile preview tabs

**Delivery Section:**
- Send Now / Schedule Later: Radio buttons
- If Schedule:
  * Date picker
  * Time picker (with timezone display)
- Priority: Low, Normal, High, Urgent
- Expire After: Checkbox + duration input (hours)

**Actions:**
- "Send Now" button (red #ED372A)
- "Schedule" button (if scheduled)
- "Save as Draft" button
- "Save as Template" button

TAB 2: SCHEDULED
- Table of scheduled notifications:
  * Columns:
    - Title
    - Recipients (count + icon for type)
    - Scheduled Date/Time
    - Status (Pending, Sent, Failed)
    - Actions: Edit, Cancel, Send Now
  * Sortable by date
  * Filter: Pending, Sent, Failed

TAB 3: HISTORY
- Table of past notifications:
  * Columns:
    - Title
    - Type (badge with icon)
    - Recipients Sent (count)
    - Recipients Read (count + percentage)
    - Clicked (if has action button)
    - Sent Date
    - Actions: View Details, Resend, Archive
  * Filters:
    - Date range
    - Type
    - Read/Unread
  * Export to CSV

**Notification Detail Modal:**
- Opens when clicking "View Details"
- Shows:
  * Full content
  * Delivery stats (pie chart):
    - Sent: X
    - Delivered: X
    - Read: X
    - Failed: X
  * Recipient list (table, paginated)
  * Click-through rate (if has button)
  * Time-to-read distribution (histogram)

TAB 4: TEMPLATES
- Grid of template cards:
  * Template preview thumbnail
  * Template name
  * Last used date
  * Actions: Use, Edit, Delete
- "Create Template" button
- Templates categories:
  * Welcome Message
  * Course Reminder
  * Achievement Unlocked
  * Deadline Warning
  * System Announcement
  * Maintenance Notice

**Template Editor Modal:**
- Similar to Send form
- Save as template
- Variables: {{user_name}}, {{course_title}}, etc.
- Preview with sample data

DESIGN:
- Form sections: White cards with spacing
- Preview pane: Fixed position, cream background (#FEF7EC)
- Type badges: Color-coded
  * Info: Blue
  * Success: Green
  * Warning: Orange
  * Error: Red (#ED372A)
- Send button: Large, red, with icon
- Responsive: Stack preview below form on mobile

API INTEGRATION:
- POST /api/v1/admin/notifications (create & send)
- POST /api/v1/admin/notifications/bulk (bulk send)
- POST /api/v1/admin/notifications/scheduled (schedule)
- GET /api/v1/admin/notifications/history
- GET /api/v1/admin/notifications/scheduled
- PUT /api/v1/admin/notifications/scheduled/:id (edit)
- DELETE /api/v1/admin/notifications/scheduled/:id (cancel)
- GET /api/v1/admin/notifications/:id/stats (delivery stats)
- GET /api/v1/admin/notifications/templates
- POST /api/v1/admin/notifications/templates (save template)

TYPESCRIPT TYPES:
interface NotificationPayload {
  recipientType: 'all' | 'role' | 'course' | 'custom'
  recipientRoles?: ('student' | 'instructor' | 'admin')[]
  recipientCourseIds?: string[]
  recipientUserIds?: string[]
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement'
  title: string
  message: string
  actionButton?: {
    text: string
    url: string
  }
  icon?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scheduledFor?: string
  expiresAfterHours?: number
}

interface NotificationStats {
  id: string
  totalSent: number
  delivered: number
  read: number
  failed: number
  clickedAction: number
  averageTimeToRead: number
}

VALIDATION:
- Title: Required, max 100 chars
- Message: Required, max 500 chars
- Recipients: At least 1 recipient
- Scheduled date: Must be future
- URL: Valid format if action button

LIBRARIES:
- React Hook Form + Zod validation
- @tiptap/react for rich text editor
- react-date-picker for scheduling
- Recharts for stats charts
- Shadcn/UI Form, Table, Dialog components
- Lucide React icons
```

---

# LAYER 7: SYSTEM SETTINGS & MONITORING

## Prompt 7.1: System Health Monitor

```
Create a system health monitoring page for IELTSGo admin with:

PAGE LAYOUT:
- Header with auto-refresh toggle (every 30s)
- Overall system status badge (large)
- Services grid
- Logs viewer at bottom

OVERALL STATUS:
- Large badge at top center:
  * "All Systems Operational" (green)
  * "Degraded Performance" (yellow)
  * "Service Disruption" (red #ED372A)
- Uptime percentage: 99.95%
- Last incident: Date or "None"

SERVICES GRID (6 cards, 3 columns):
Each service card shows:
1. API Gateway (Port 8080)
   - Status indicator (green/yellow/red dot)
   - Response time: 5ms (avg)
   - Requests: 1.2K/min
   - Success rate: 99.8%
   - Mini line chart (last 1 hour)
   - "View Logs" button

2. Auth Service (Port 8081)
   - Status, Response time, Requests
   - Active sessions: 245
   - Failed logins: 3 (last hour)

3. User Service (Port 8082)
   - Status, Response time, Requests
   - Database connections: 5/20

4. Course Service (Port 8083)
   - Status, Response time, Requests
   - Active enrollments: 89

5. Exercise Service (Port 8084)
   - Status, Response time, Requests
   - Submissions/min: 12

6. Notification Service (Port 8085)
   - Status, Response time, Requests
   - Queue size: 15

INFRASTRUCTURE STATUS:
- Database (PostgreSQL):
  * Status: Connected
  * Active connections: 45/100
  * Query time: 12ms avg
  * Disk usage: 45% (15GB / 50GB)
  * Last backup: 2 hours ago
- Redis:
  * Status: Connected
  * Memory usage: 128MB / 512MB
  * Hit rate: 95.3%
- RabbitMQ:
  * Status: Connected
  * Messages in queue: 8
  * Throughput: 150 msg/s

RESOURCE USAGE (Metrics):
- CPU Usage: Progress bar (65%)
- Memory Usage: Progress bar (72%)
- Disk I/O: Graph over time
- Network: In/Out bandwidth graph

LOGS VIEWER (Bottom):
- Tabs: All | Errors | Warnings | Info
- Table with:
  * Timestamp
  * Service (badge)
  * Level (Error/Warning/Info with color)
  * Message (truncated, click to expand)
  * Action: View full log
- Filters:
  * Service: Dropdown multi-select
  * Level: Checkboxes
  * Date range: Calendar
  * Search: Text input
- Real-time updates (WebSocket)
- "Export Logs" button

ALERTS SECTION (If any):
- Alert cards (red border):
  * Title: "High memory usage on User Service"
  * Description: "Memory at 85%"
  * Severity: Critical/Warning
  * Time: "5 minutes ago"
  * Actions: Acknowledge, View Details, Restart Service

DESIGN:
- Service cards: White background, green border if healthy
- Status dots: Large, animated pulse
- Charts: Small inline charts
- Logs: Monospace font
- Alert cards: Red (#ED372A) border and icon
- Auto-refresh indicator: Rotating icon
- Responsive: Stack cards on mobile

API INTEGRATION:
- GET /api/v1/admin/system/health (overall)
- GET /api/v1/admin/system/services (all services status)
- GET /api/v1/admin/system/metrics (CPU, memory, disk)
- GET /api/v1/admin/system/logs?service=user&level=error&from=date
- POST /api/v1/admin/system/services/:name/restart
- WebSocket: ws://api.ieltsgo.com/admin/system/stream (real-time updates)

TYPESCRIPT TYPES:
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  uptime: number
  lastIncident: string | null
  services: ServiceStatus[]
  infrastructure: InfrastructureStatus
  metrics: SystemMetrics
}

interface ServiceStatus {
  name: string
  port: number
  status: 'up' | 'down' | 'degraded'
  responseTime: number
  requestsPerMinute: number
  successRate: number
  metrics: { timestamp: string; value: number }[]
}

interface InfrastructureStatus {
  database: DatabaseStatus
  redis: RedisStatus
  rabbitmq: RabbitMQStatus
}

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskIO: { timestamp: string; read: number; write: number }[]
  network: { timestamp: string; in: number; out: number }[]
}

interface LogEntry {
  id: string
  timestamp: string
  service: string
  level: 'error' | 'warning' | 'info'
  message: string
  details?: string
}

LIBRARIES:
- Recharts for mini charts
- react-use-websocket for real-time updates
- Shadcn/UI Card, Badge, Progress components
- Lucide React icons (Activity, AlertTriangle)
- date-fns for timestamps
```

## Prompt 7.2: System Settings Panel

```
Create a system settings configuration page for IELTSGo admin with:

PAGE LAYOUT:
- Vertical tabs on left (sidebar 25%)
- Settings content on right (75%)
- Save/Reset buttons at bottom

TABS:
1. General
2. Email
3. Authentication
4. Storage
5. API & Integrations
6. Backup & Maintenance

TAB 1: GENERAL SETTINGS
- Site Information:
  * Site Name: Input (IELTSGo)
  * Site URL: Input
  * Logo: File upload (current logo preview)
  * Favicon: File upload
- Localization:
  * Default Language: Select (English, Vietnamese)
  * Timezone: Select (Asia/Ho_Chi_Minh)
  * Date Format: Select (DD/MM/YYYY, MM/DD/YYYY)
  * Currency: Select (if payment feature)
- User Registration:
  * Allow Registration: Toggle
  * Email Verification Required: Toggle
  * Default Role: Select (Student)
  * Auto-create profile: Toggle

TAB 2: EMAIL SETTINGS
- SMTP Configuration:
  * SMTP Host: Input
  * SMTP Port: Input (587)
  * SMTP Username: Input
  * SMTP Password: Input (masked)
  * Use TLS: Toggle
  * "Test Email" button → sends test email
- Email Templates:
  * Welcome Email: Editor
  * Password Reset: Editor
  * Course Enrollment: Editor
  * Achievement Earned: Editor
  * Variables available: {{user_name}}, {{course_title}}, etc.
- Email Footer:
  * Company Info: Textarea
  * Social Links: Input fields (Facebook, Twitter, etc.)

TAB 3: AUTHENTICATION
- JWT Settings:
  * Access Token Expiry: Input (minutes) - 15
  * Refresh Token Expiry: Input (days) - 7
  * Token Secret: Input (masked) with "Regenerate" button
- OAuth Providers:
  * Google OAuth:
    - Enabled: Toggle
    - Client ID: Input
    - Client Secret: Input (masked)
    - Callback URL: Display (readonly)
- Session Management:
  * Max Active Sessions per User: Input (5)
  * Auto Logout After Inactivity: Input (minutes) - 30
- Security:
  * Max Failed Login Attempts: Input (5)
  * Account Lock Duration: Input (minutes) - 30
  * Password Requirements:
    - Min Length: Input (8)
    - Require Uppercase: Toggle
    - Require Numbers: Toggle
    - Require Symbols: Toggle

TAB 4: STORAGE SETTINGS
- File Upload:
  * Max File Size: Input (MB) - 10
  * Allowed Extensions: Tags input (.jpg, .png, .pdf, .mp4)
  * Storage Location: Radio (Local, S3, Other)
- Video Storage:
  * YouTube Integration: Toggle
  * YouTube API Key: Input (if enabled)
- Database:
  * Connection Pool Size: Input (20)
  * Query Timeout: Input (seconds) - 30

TAB 5: API & INTEGRATIONS
- API Configuration:
  * API Rate Limit: Input (requests/minute) - 100
  * Allow CORS: Toggle
  * Allowed Origins: Textarea (URLs)
- External APIs:
  * AI Service (if implemented):
    - Enabled: Toggle
    - API Endpoint: Input
    - API Key: Input (masked)
- Webhooks:
  * New User Registered: Input (webhook URL)
  * Course Completed: Input
  * Exercise Submitted: Input
  * "Test Webhook" button

TAB 6: BACKUP & MAINTENANCE
- Automated Backups:
  * Enable Auto Backup: Toggle
  * Backup Frequency: Select (Daily, Weekly)
  * Backup Time: Time picker
  * Retention Period: Input (days) - 30
  * Last Backup: Display date + "Backup Now" button
- Database Maintenance:
  * Auto Vacuum: Toggle
  * Vacuum Schedule: Select
  * Reindex Schedule: Select
- Maintenance Mode:
  * Enable Maintenance Mode: Toggle (red)
  * Maintenance Message: Textarea
  * Allowed IPs: Textarea (admin IPs can still access)
- System Cache:
  * "Clear All Cache" button
  * "Clear Redis Cache" button
  * "Rebuild Search Index" button

DESIGN:
- Tabs: Vertical list, left sidebar
- Active tab: Red background (#ED372A), white text
- Settings content: White card, padding
- Sections: Labeled with dividers
- Toggles: Shadcn/UI Switch component
- Masked inputs: Show/hide button
- Warning messages: Yellow background for sensitive settings
- Save button: Red (#ED372A), bottom-right, sticky
- Reset button: Gray outline

API INTEGRATION:
- GET /api/v1/admin/system/settings (load all settings)
- PUT /api/v1/admin/system/settings (update settings)
- POST /api/v1/admin/system/email/test (test email)
- POST /api/v1/admin/system/webhook/test (test webhook)
- POST /api/v1/admin/system/backup/now (manual backup)
- POST /api/v1/admin/system/cache/clear (clear cache)
- POST /api/v1/admin/system/maintenance (toggle maintenance mode)

VALIDATION:
- Email: Valid email format
- URLs: Valid URL format
- Numbers: Min/max constraints
- Required fields: Cannot be empty
- Password requirements: Validate strength
- Confirmation modals for destructive actions

TYPESCRIPT TYPES:
interface SystemSettings {
  general: GeneralSettings
  email: EmailSettings
  authentication: AuthSettings
  storage: StorageSettings
  api: APISettings
  backup: BackupSettings
}

interface GeneralSettings {
  siteName: string
  siteUrl: string
  logo: string
  favicon: string
  defaultLanguage: string
  timezone: string
  dateFormat: string
  allowRegistration: boolean
  emailVerificationRequired: boolean
  defaultRole: 'student' | 'instructor'
}

// ... other settings interfaces

LIBRARIES:
- React Hook Form + Zod validation
- Shadcn/UI Tabs, Form, Switch, Input components
- @tiptap/react for email template editor
- Lucide React icons
- react-hot-toast for success/error messages
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Week 1: Core Admin Structure
- [ ] Prompt 1.1: Admin sidebar and layout
- [ ] Prompt 2.1: Dashboard overview

### Week 2: User Management
- [ ] Prompt 3.1: User management table
- [ ] Prompt 3.2: User detail & edit modal

### Week 3: Content & Analytics
- [ ] Prompt 4.1: Content review queue
- [ ] Prompt 5.1: Analytics dashboard

### Week 4: Notifications & System
- [ ] Prompt 6.1: Notification management
- [ ] Prompt 7.1: System health monitor
- [ ] Prompt 7.2: System settings panel

---

## 🔗 INTEGRATION NOTES

### Authentication
- All admin routes require JWT token
- Check role: Must be "admin"
- Add to headers: `Authorization: Bearer {token}`
- Store token in: localStorage or httpOnly cookie

### API Base URL
```typescript
const ADMIN_API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1/admin'
```

### Error Handling
- 401: Redirect to login
- 403: Show "Access Denied" page
- 500: Show error toast, log to console

### Real-time Updates
- Use WebSocket for:
  * Activity feed updates
  * System health metrics
  * Log streaming
- Fallback to polling if WebSocket fails

---

## 📚 REFERENCE DOCUMENTS

- **Roles & Permissions**: `ROLES_AND_PERMISSIONS.md`
- **API Endpoints**: `docs/API_ENDPOINTS.md`
- **Brand Colors**: `IELTSGO_COLORS.md`
- **Backend Test Results**: `FINAL_SYSTEM_TEST_REPORT.md`

---

**Created**: 2025-10-15  
**For**: IELTSGo Admin Dashboard  
**Tech Stack**: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI  
**API Gateway**: http://localhost:8080  
**Version**: 1.0

# 🎨 V0 BY VERCEL - PROMPTS XÂY DỰNG FRONTEND IELTSGO

**Hệ thống:** IELTS Learning Platform  
**Tech Stack:** Next.js 14, TypeScript, TailwindCSS, Shadcn/UI  
**Backend:** Microservices REST APIs (đã có sẵn)

---

## 📋 THÔNG TIN HỆ THỐNG

### Logo & Brand Colors

**Logo:** IELTSGo  
## 🎨 Brand Colors (From IELTSGo Logo)

Based on the IELTSGo logo analysis, use these exact colors:

```css
/* Primary - Red */
--primary: #ED372A;
--primary-hover: #d42e22;
--primary-light: #fef2f2;

/* Secondary - Dark */
--secondary: #101615;
--secondary-hover: #1f2937;
--secondary-light: #f3f4f6;

/* Accent - Cream/Beige */
--accent: #FEF7EC;
--accent-hover: #fef3e2;
--accent-light: #fffbf5;

/* Additional - Dark Red for shadows/depth */
--dark-red: #B92819;
```

**Usage Examples:**
- **Primary Red (#ED372A):** Main CTAs, active states, links, primary buttons, branding elements
- **Secondary Dark (#101615):** Text, headings, navigation, footer, important content
- **Accent Cream (#FEF7EC):** Backgrounds, cards, sections, soft highlights
- **Dark Red (#B92819):** Hover states, shadows, depth, secondary buttons

**Typography:**
- Font chính: Inter / Sans-serif
- Font heading: Poppins (bold, modern)

---

## 🎯 CHIẾN LƯỢC XÂY DỰNG

### Layer 1: Foundation & Setup
### Layer 2: Authentication & User Management
### Layer 3: Course Learning System
### Layer 4: Exercise & Practice System
### Layer 5: Progress Tracking & Dashboard
### Layer 6: Notifications & Social Features

---

# 📝 LAYER 1: FOUNDATION & SETUP

## Prompt 1.1: Project Setup & Design System

\`\`\`
Create a Next.js 14 project setup for an IELTS learning platform called "IELTSGo" with:

DESIGN SYSTEM:
- Primary color: #ED372A (Red - from IELTSGo logo)
- Secondary color: #101615 (Dark - from IELTSGo logo)  
- Accent color: #FEF7EC (Cream/Beige - from IELTSGo logo)
- Dark Red: #B92819 (Shadow/depth - from IELTSGo logo)
- Use Shadcn/UI components
- TailwindCSS configuration
- Dark mode support

TECH STACK:
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn/UI
- Zustand (state management)
- React Query (API calls)
- Axios

PROJECT STRUCTURE:
/app
  /(auth)
    /login
    /register
  /(dashboard)
    /dashboard
    /courses
    /exercises
    /progress
  /api
/components
  /ui (Shadcn components)
  /layout
  /features
/lib
  /api
  /hooks
  /utils
/types
/styles

REQUIREMENTS:
1. Create tailwind.config with brand colors
2. Setup Shadcn/UI with custom theme
3. Create base layout with responsive sidebar
4. Add loading states and error boundaries
5. Setup Axios instance with interceptors for JWT
6. Create base API service structure

Please generate the complete project structure with all configuration files.
\`\`\`

---

## Prompt 1.2: Layout Components

\`\`\`
Create responsive layout components for IELTSGo platform:

COMPONENTS NEEDED:

1. MainLayout (app/layout.tsx)
   - Responsive navigation bar with logo
   - Sidebar for desktop (collapsible)
   - Bottom navigation for mobile
   - User avatar with dropdown menu
   - Notification bell icon
   - Dark mode toggle

2. Sidebar (components/layout/Sidebar.tsx)
   - Navigation items:
     * Dashboard (Home icon)
     * My Courses (Book icon)
     * Exercises (FileText icon)
     * Progress (TrendingUp icon)
     * Leaderboard (Trophy icon)
     * Notifications (Bell icon)
     * Settings (Settings icon)
   - Active state highlighting (blue background)
   - Collapsed state for mobile
   - User profile section at bottom

3. Navbar (components/layout/Navbar.tsx)
   - Logo on left (text "IELTSGo" with gradient)
   - Search bar in center (for courses/exercises)
   - Right side:
     * Notification bell with badge count
     * User avatar with dropdown
     * Dark mode toggle

4. Footer (components/layout/Footer.tsx)
   - Copyright info
   - Quick links (About, Contact, Terms, Privacy)
   - Social media icons

DESIGN:
- Responsive sidebar navigation with icons
- Use colors: Primary #ED372A (Red), Secondary #101615 (Dark), Accent #FEF7EC (Cream)
- Smooth animations (hover, transitions)
- Responsive breakpoints: sm, md, lg, xl
- Use Shadcn components: Button, Avatar, Badge, DropdownMenu
- Add tooltips for collapsed sidebar items

Generate these layout components with TypeScript and modern design.
\`\`\`

---

# 📝 LAYER 2: AUTHENTICATION & USER MANAGEMENT

## Prompt 2.1: Authentication Pages

\`\`\`
Create authentication pages for IELTSGo with modern design:

API ENDPOINTS:
- POST /api/v1/auth/register - Register new user
- POST /api/v1/auth/login - Login
- GET /api/v1/auth/google/url - Get Google OAuth URL
- POST /api/v1/auth/google/token - Exchange Google code for token

PAGES NEEDED:

1. Login Page (app/(auth)/login/page.tsx)
   - Email input (with validation)
   - Password input (show/hide toggle)
   - Remember me checkbox
   - Login button (loading state)
   - Divider "OR"
   - Google OAuth button (with Google icon)
   - Link to "Forgot password?"
   - Link to "Don't have account? Sign up"
   - Form validation with react-hook-form + zod

2. Register Page (app/(auth)/register/page.tsx)
   - Full name input
   - Email input (email validation)
   - Password input (strength indicator)
   - Confirm password
   - Role selection (Student/Instructor) - radio buttons
   - Terms & conditions checkbox
   - Register button
   - Google OAuth option
   - Link to "Already have account? Login"

3. Forgot Password (app/(auth)/forgot-password/page.tsx)
   - Email input
   - Send code button
   - 6-digit code input (OTP style)
   - New password input
   - Reset button

DESIGN REQUIREMENTS:
- Split screen layout: Left side = illustration/image, Right side = form
- Gradient background for illustration side (blue to green)
- Card-based form with shadow
- Icons for all inputs (Mail, Lock, User)
- Error messages below inputs (red color)
- Success messages (green color)
- Loading spinner on buttons
- Responsive (stack vertically on mobile)

API INTEGRATION:
- Use React Query for mutations
- Store JWT in httpOnly cookie or localStorage
- Redirect to /dashboard on success
- Handle errors (display error messages)
- Google OAuth: Open popup window, handle callback

Generate complete authentication flow with TypeScript.
\`\`\`

---

## Prompt 2.2: User Profile & Settings

\`\`\`
Create user profile and settings pages for IELTSGo:

API ENDPOINTS:
- GET /api/v1/user/profile - Get user profile
- PUT /api/v1/user/profile - Update profile
- POST /api/v1/user/profile/avatar - Upload avatar
- GET /api/v1/user/preferences - Get preferences
- PUT /api/v1/user/preferences - Update preferences

COMPONENTS:

1. Profile Page (app/(dashboard)/profile/page.tsx)
   - Sections with tabs:
     * Personal Info
     * Preferences
     * Security
     * Notifications
   
   PERSONAL INFO TAB:
   - Avatar upload (drag & drop or click)
   - Full name (editable)
   - Email (read-only)
   - Bio (textarea)
   - Target IELTS band score (select: 5.0 - 9.0)
   - Study goals (multi-select chips)
   - Save button

   PREFERENCES TAB:
   - Language (English/Vietnamese)
   - Theme (Light/Dark/Auto)
   - Font size (Small/Medium/Large)
   - Timezone (dropdown)
   - Auto play next lesson (toggle)
   - Show answer explanations (toggle)
   - Playback speed (0.5x - 2x slider)

   SECURITY TAB:
   - Change password form
   - Two-factor authentication (toggle)
   - Active sessions list
   - Logout from all devices button

   NOTIFICATIONS TAB:
   - Email notifications (toggle)
   - Push notifications (toggle)
   - Study reminders (toggle)
   - Weekly report (toggle)
   - Course updates (toggle)
   - Marketing emails (toggle)
   - Quiet hours (time range picker)

DESIGN:
- Tabs at top (Pills style)
- Card layout for each section
- Save button sticky at bottom
- Success toast on save
- Form validation
- Loading skeleton while fetching
- Responsive grid layout

Generate these components with proper state management and API integration.
\`\`\`

---

# 📝 LAYER 3: COURSE LEARNING SYSTEM

## Prompt 3.1: Course Browse & Detail

\`\`\`
Create course browsing and detail pages for IELTSGo:

API ENDPOINTS:
- GET /api/v1/courses - List courses (with filters)
- GET /api/v1/courses/:id - Get course detail
- POST /api/v1/enrollments - Enroll in course
- GET /api/v1/enrollments/my - Get my enrollments
- GET /api/v1/categories - Get categories

PAGES:

1. Courses List (app/(dashboard)/courses/page.tsx)
   
   LAYOUT:
   - Header with title "Explore Courses"
   - Search bar (search by title)
   - Filter sidebar (left):
     * Skill type (Listening, Reading, Writing, Speaking)
     * Level (Beginner, Intermediate, Advanced)
     * Category (multi-select)
     * Enrollment type (Free, Paid)
     * Rating (5 stars filter)
   
   COURSE CARDS (Grid 3 columns desktop, 2 tablet, 1 mobile):
   - Course thumbnail image
   - Skill badge (colored by type)
   - Course title
   - Instructor name (with avatar)
   - Rating stars + review count
   - Enrollment count
   - Level badge
   - Price (or "Free" badge)
   - Progress bar (if enrolled)
   - Enroll/Continue button
   - Bookmark icon (top right)

   FEATURES:
   - Sorting (Most popular, Newest, Highest rated)
   - Pagination or infinite scroll
   - Loading skeletons
   - Empty state (no courses found)

2. Course Detail (app/(dashboard)/courses/[id]/page.tsx)
   
   SECTIONS:
   
   A. Hero Section:
   - Course title (large)
   - Instructor info (avatar, name, bio)
   - Rating + reviews
   - Enrollment count
   - Last updated date
   - Skill badges
   - Enroll button (sticky on scroll)
   - Share button

   B. Course Info Tabs:
   - Overview
   - Curriculum
   - Reviews
   - Q&A (future)

   OVERVIEW TAB:
   - Description (rich text)
   - What you'll learn (bullet points with checkmarks)
   - Requirements
   - Target band score
   - Duration
   - Number of lessons/videos
   - Skills covered (badges)

   CURRICULUM TAB:
   - Accordion for modules
   - Each module shows:
     * Module title
     * Duration
     * Number of lessons
     * Lessons list (nested)
       - Lesson title
       - Content type icon (video/article/quiz)
       - Duration
       - Preview/Lock icon
       - Completion checkmark (if completed)
   - Preview available lessons for non-enrolled users

   REVIEWS TAB:
   - Overall rating (large)
   - Rating breakdown (5★-1★ with bars)
   - Sort by (Most helpful, Recent, Highest/Lowest)
   - Review cards:
     * User avatar + name
     * Rating stars
     * Date
     * Review text
     * Helpful count (thumbs up)
   - Write review button (if enrolled)

   C. Related Courses Section:
   - Carousel of similar courses
   - "Students also viewed" section

DESIGN:
- Use primary blue color for CTAs
- Green badges for completion
- Orange badges for in-progress
- Smooth transitions
- Responsive layout
- Loading states

Generate these course pages with full TypeScript types and API integration.
\`\`\`

---

## Prompt 3.2: Lesson Player & Learning Experience

\`\`\`
Create interactive lesson player for IELTSGo course learning:

API ENDPOINTS:
- GET /api/v1/lessons/:id - Get lesson detail
- POST /api/v1/videos/track - Track video progress
- POST /api/v1/progress/lessons/:id - Mark lesson as complete
- GET /api/v1/courses/:id/progress - Get course progress

COMPONENTS:

1. Lesson Player Page (app/(dashboard)/courses/[id]/lessons/[lessonId]/page.tsx)

   LAYOUT:
   - Left: Content area (70% width)
   - Right: Course navigation sidebar (30% width)
   - Bottom: Navigation buttons (Previous/Next lesson)

   CONTENT AREA:
   
   A. Video Lesson:
   - Custom video player (use react-player or video.js)
   - Controls:
     * Play/Pause
     * Progress bar (seek)
     * Playback speed (0.5x, 1x, 1.5x, 2x)
     * Volume
     * Subtitles toggle (CC button)
     * Quality selector
     * Fullscreen
   - Auto-track watch progress every 10 seconds
   - Continue from last position
   - Subtitles display (WebVTT format)

   B. Text/Article Lesson:
   - Rich text content (Markdown renderer)
   - Table of contents (sticky sidebar)
   - Reading progress indicator
   - Copy code button for code blocks
   - Syntax highlighting

   C. Quiz Lesson:
   - Question counter (1 of 10)
   - Question text
   - Multiple choice options (radio buttons)
   - Next question button
   - Submit quiz button (last question)
   - Results page:
     * Score (with percentage)
     * Correct/Incorrect breakdown
     * Review answers option

   LESSON INFO SECTION (Below player):
   - Tabs: Overview, Resources, Notes, Comments
   
   OVERVIEW:
   - Lesson description
   - Key takeaways (bullet points)
   - Useful links

   RESOURCES:
   - Downloadable materials (PDF, slides, transcripts)
   - Download button for each

   NOTES:
   - Personal notes (textarea)
   - Save notes button
   - Timestamp linking (for videos)
   - Previous notes list

   COMMENTS:
   - Comment input (textarea)
   - Submit button
   - Comments list:
     * User avatar + name
     * Comment text
     * Like/Reply buttons
     * Timestamp
   - Sort by (Newest, Most liked)

   NAVIGATION SIDEBAR:
   
   - Course title (link back)
   - Progress bar (overall course progress)
   - Module accordion:
     * Current module expanded
     * Lessons list:
       - Lesson title
       - Content type icon
       - Duration
       - Completion checkmark
       - Current lesson highlighted (blue bg)
       - Click to navigate

   BOTTOM NAVIGATION:
   - Previous lesson button (disabled if first)
   - Mark as complete checkbox
   - Next lesson button (disabled if last)
   - Auto-advance option (toggle)

2. Video Progress Tracker (hook: useVideoProgress.ts)
   - Track every 10 seconds
   - Save on pause/before unmount
   - Resume from last position
   - Mark complete at 90%

FEATURES:
- Keyboard shortcuts (Space=play/pause, Arrow keys=seek)
- Picture-in-picture mode
- Save video quality preference
- Responsive (stack sidebar below on mobile)
- Offline detection (show warning)
- Auto-save notes (debounced)

DESIGN:
- Dark theme for video player area
- Clean, distraction-free layout
- Smooth transitions between lessons
- Loading states for all content
- Error handling (video load failed, etc.)

Generate complete lesson player with all TypeScript types and hooks.
\`\`\`

---

# 📝 LAYER 4: EXERCISE & PRACTICE SYSTEM

## Prompt 4.1: Exercise Browse & Start

\`\`\`
Create exercise browsing and practice system for IELTSGo:

API ENDPOINTS:
- GET /api/v1/exercises - List exercises
- GET /api/v1/exercises/:id - Get exercise detail
- POST /api/v1/submissions - Start exercise
- PUT /api/v1/submissions/:id/answers - Submit answers
- GET /api/v1/submissions/:id/result - Get result
- GET /api/v1/submissions/my - Get my submissions

PAGES:

1. Exercises List (app/(dashboard)/exercises/page.tsx)
   
   HEADER:
   - Title "IELTS Practice Exercises"
   - Stats cards row:
     * Total completed (number + icon)
     * Average score (percentage + chart icon)
     * Current streak (days + fire icon)
     * Time spent (hours + clock icon)

   FILTERS (Top bar):
   - Skill type (Listening/Reading/Writing/Speaking)
   - Difficulty (Easy/Medium/Hard)
   - Type (Practice/Mock test/Question bank)
   - Tags (multi-select chips)
   - Sort by (Newest/Popular/Difficulty)

   EXERCISE CARDS (Grid layout):
   - Card design:
     * Title
     * Skill badge (colored)
     * Difficulty badge (green/yellow/red)
     * Type badge
     * Stats:
       - Questions count
       - Time limit (minutes)
       - Average score (%)
       - Attempts count
     * Tags (chips)
     * Start/Resume button
     * Bookmark icon
     * Best score badge (if attempted)

   FEATURES:
   - Quick filter buttons (All/Listening/Reading/etc.)
   - Search by title
   - "Recommended for you" section (based on weak skills)
   - "Continue practice" section (unfinished exercises)

2. Exercise Detail/Start (app/(dashboard)/exercises/[id]/page.tsx)
   
   BEFORE START (Preview):
   - Exercise title
   - Description
   - Instructions (expandable)
   - Information panel:
     * Number of questions
     * Number of sections
     * Time limit
     * Passing score
     * Difficulty
     * Skills covered
   - Previous attempts table:
     * Date
     * Score
     * Time taken
     * View results button
   - Start exercise button (large, primary)
   - Timer warning (appears 5 sec before start)

   START CONFIRMATION MODAL:
   - "Are you ready?" message
   - Exercise summary
   - Tips:
     * Find quiet place
     * Ensure stable internet
     * Don't refresh page
   - Confirm & Start button
   - Cancel button

Generate these exercise pages with proper state management.
\`\`\`

---

## Prompt 4.2: Exercise Player & Submission

\`\`\`
Create interactive exercise player for IELTSGo practice system:

COMPONENTS:

1. Exercise Player (app/(dashboard)/exercises/[id]/practice/page.tsx)

   LAYOUT:
   - Top bar (sticky):
     * Exercise title
     * Timer (countdown, turns red at <5 mins)
     * Question counter (3/40)
     * Exit button (with confirmation)
   - Left: Question area (65%)
   - Right: Answer area (35%)
   - Bottom: Navigation bar

   QUESTION TYPES:

   A. LISTENING:
   - Audio player (custom controls):
     * Play/Pause
     * Progress bar
     * Volume
     * Playback count (limited, show remaining)
     * Rewind 5s / Forward 5s buttons
   - Transcript button (disabled until after submit)
   - Question text below audio
   - Image/diagram (if applicable)

   B. READING:
   - Passage text (scrollable, left side)
   - Highlight tool (select text to highlight)
   - Font size adjuster
   - Question text (right side)

   C. WRITING:
   - Task description
   - Word count (live, min-max indicator)
   - Rich text editor:
     * Bold, italic, underline
     * Bullet points
     * Undo/Redo
   - Timer for this task
   - Save draft automatically

   D. SPEAKING:
   - Question text
   - Preparation timer (30s-1min)
   - Recording timer (1-2 mins)
   - Record button (microphone)
   - Playback recording
   - Re-record option
   - Waveform visualization

   ANSWER FORMATS:

   1. Multiple Choice:
   - Radio buttons (A, B, C, D)
   - Large clickable areas
   - Selected state (blue background)

   2. Multiple Select:
   - Checkboxes
   - Show "Select X answers" instruction
   - Limit selection to X

   3. Fill in the Blank:
   - Text input field
   - Character limit (if any)
   - Placeholder text

   4. Matching:
   - Drag and drop items
   - Or dropdown selects
   - Visual feedback on correct pairing

   5. True/False/Not Given:
   - Three buttons
   - Clear active state

   NAVIGATION:

   Bottom Bar:
   - Question palette (grid of numbers):
     * Not visited (white)
     * Answered (green)
     * Not answered (red)
     * Marked for review (yellow)
     * Current (blue border)
   - Previous button
   - Next button
   - Mark for review button (flag icon)
   - Submit button (only on last question)

   FEATURES:
   - Auto-save answers every 30 seconds
   - Keyboard shortcuts (Arrow keys for navigation)
   - Calculator (for some questions)
   - Notepad (scratch pad, not graded)
   - Pause warning (if idle for 5 mins)
   - Submit confirmation dialog:
     * Show unanswered count
     * "Are you sure?" message
     * Review unanswered / Submit anyway

2. Results Page (app/(dashboard)/exercises/[id]/results/[submissionId]/page.tsx)

   OVERALL RESULTS:
   - Large score display (85/100)
   - Band score equivalent (if IELTS)
   - Percentage (85%)
   - Pass/Fail badge
   - Time taken
   - Accuracy chart (pie chart)
   - Section breakdown (bar chart)
   
   PERFORMANCE ANALYSIS:
   - Strengths (what you did well)
   - Areas to improve
   - Skill breakdown:
     * Listening: 80% (progress bar)
     * Reading: 90%
     * Writing: 75%
     * Speaking: 85%
   
   DETAILED REVIEW:
   - Questions list (accordion):
     * Question number
     * Your answer
     * Correct answer
     * Result icon (✓ or ✗)
     * Explanation (expandable)
     * Time spent on question
   - Filter: All/Correct/Incorrect

   ACTION BUTTONS:
   - Retry exercise
   - View similar exercises
   - Save to favorites
   - Share score (social media)
   - Download PDF report

DESIGN:
- Clean, focused interface
- No distractions during practice
- Green for correct, red for wrong
- Yellow for warnings
- Loading states
- Auto-submit on timer end
- Responsive layout

Generate complete exercise player with TypeScript and state management.
\`\`\`

---

# 📝 LAYER 5: PROGRESS TRACKING & DASHBOARD

## Prompt 5.1: Dashboard Overview

\`\`\`
Create comprehensive dashboard for IELTSGo student tracking:

API ENDPOINTS:
- GET /api/v1/user/statistics - Get user statistics
- GET /api/v1/user/progress - Get learning progress
- GET /api/v1/user/progress/history - Get progress history
- GET /api/v1/user/achievements - Get achievements
- GET /api/v1/user/leaderboard - Get leaderboard

DASHBOARD PAGE (app/(dashboard)/dashboard/page.tsx):

SECTIONS:

1. HEADER (Welcome section):
   - "Welcome back, [User Name]!" (large)
   - Motivational message (random)
   - Current date
   - Study streak (days with fire icon)

2. STUDY STATS (4 Cards Row):
   
   Card 1: Total Study Time
   - Large number (hours)
   - Small chart (this week)
   - Percentage change from last week
   
   Card 2: Exercises Completed
   - Large number
   - Small progress ring
   - "X more to next milestone"
   
   Card 3: Average Score
   - Large percentage
   - Trend arrow (up/down)
   - Comparison to last month
   
   Card 4: Current Streak
   - Days count
   - Fire icon
   - "Keep it up!" message

3. PROGRESS OVERVIEW (2 columns):
   
   Left Column:
   
   A. Study Progress Chart
   - Line/Area chart (7 or 30 days)
   - Y-axis: Hours studied
   - X-axis: Dates
   - Tabs: 7 days / 30 days / 3 months
   - Smooth animations
   
   B. Skill Distribution (Radar Chart)
   - Axes: Listening, Reading, Writing, Speaking
   - Values: Scores (0-100%)
   - Color: Blue gradient
   - Tooltip on hover
   
   C. Recent Activity Feed
   - Timeline style
   - Items:
     * Completed exercise (check icon)
     * Enrolled in course (book icon)
     * Achievement earned (trophy icon)
     * Lesson completed (play icon)
   - Show last 10 items
   - "View all" link

   Right Column:
   
   D. Course Progress Cards
   - List of enrolled courses
   - Each card:
     * Course thumbnail
     * Title
     * Progress bar (percentage)
     * "X of Y lessons completed"
     * Continue button
   - "Browse more courses" link

   E. Upcoming Study Goals
   - List of active goals
   - Each item:
     * Goal title
     * Progress bar
     * Deadline date
     * Status badge
   - "Set new goal" button

4. QUICK ACTIONS (Cards):
   - Continue Last Exercise
   - Resume Last Lesson
   - Take Mock Test
   - Review Weak Areas

5. LEADERBOARD WIDGET (Bottom):
   - Title "Top Learners This Week"
   - Top 5 users:
     * Rank number
     * Avatar
     * Name
     * Points
     * Progress bar
   - Your rank (highlighted)
   - "View full leaderboard" link

6. ACHIEVEMENTS SHOWCASE:
   - Recent achievements (badges)
   - Grid of unlocked badges
   - Locked badges (grayscale)
   - Click to view details modal
   - Progress to next achievement

DESIGN:
- Use card components with shadows
- Gradient backgrounds for stats cards
- Smooth animations on charts
- Responsive grid (2 columns desktop, 1 mobile)
- Loading skeletons
- Empty states ("Start your journey!")
- Use Chart.js or Recharts for charts

Generate dashboard with all TypeScript types and chart integrations.
\`\`\`

---

## Prompt 5.2: Detailed Progress & Analytics

\`\`\`
Create detailed progress tracking page for IELTSGo:

PAGE (app/(dashboard)/progress/page.tsx):

LAYOUT:
- Tabs at top:
  * Overview
  * Skills Analysis
  * Study History
  * Goals
  * Achievements

TAB 1: OVERVIEW

A. Performance Summary Cards (4 cards):
   - Total exercises completed
   - Average score (with trend)
   - Study time (this month)
   - Improvement rate (percentage)

B. Score Trend Chart (Large)
   - Line chart (last 3 months)
   - Multiple lines:
     * Overall score (blue)
     * Listening (green)
     * Reading (yellow)
     * Writing (red)
     * Speaking (purple)
   - Date range selector
   - Export button (CSV/PDF)

C. Recent Test Results Table
   - Columns:
     * Date
     * Exercise name
     * Skill type
     * Score
     * Time taken
     * View details button
   - Sort by columns
   - Pagination
   - Filter by skill type

TAB 2: SKILLS ANALYSIS

A. Skill Cards (4 cards for each skill):
   Each card:
   - Skill icon (large)
   - Current level (Band 6.5)
   - Score percentage
   - Progress bar
   - Strengths list
   - Weaknesses list
   - "Practice this skill" button

B. Detailed Breakdown:
   - Accordion for each skill
   - Sub-skills:
     * Listening: Note taking, Multiple choice, Matching
     * Reading: Scanning, Skimming, Inference
     * Writing: Task 1 (data), Task 2 (essay)
     * Speaking: Part 1, 2, 3
   - Each sub-skill:
     * Score meter (circular)
     * Attempts count
     * Average score
     * Best score
     * Last practiced date

C. Recommendations:
   - "Focus on these areas" section
   - Cards with exercises to improve weak skills
   - Target band score progress

TAB 3: STUDY HISTORY

A. Calendar View:
   - Monthly calendar
   - Days with activity (colored dots)
   - Heat map style (darker = more study)
   - Click day to see details
   - Stats summary for selected month

B. Activity Timeline:
   - Vertical timeline (chronological)
   - Each entry:
     * Date & time
     * Activity type (icon)
     * Details
     * Duration
     * Score (if applicable)
   - Filter: All/Courses/Exercises/Goals
   - Date range picker

C. Study Patterns Analysis:
   - Best study time (bar chart by hour)
   - Most active days (bar chart)
   - Average session duration
   - Total study time (monthly)

TAB 4: GOALS

A. Active Goals Section:
   - Cards for each goal:
     * Goal title
     * Description
     * Target (e.g., "Complete 20 exercises")
     * Current progress (15/20)
     * Progress bar
     * Deadline date & countdown
     * Status badge (On track/Behind/Complete)
     * Edit/Delete buttons

B. Create Goal Modal:
   - Goal type (dropdown):
     * Study X hours per week
     * Complete X exercises
     * Achieve X band score
     * Complete X courses
     * Custom
   - Title input
   - Target value (number)
   - Deadline (date picker)
   - Priority (High/Medium/Low)
   - Create button

C. Completed Goals:
   - List of achieved goals
   - Completion date
   - Celebration confetti animation

TAB 5: ACHIEVEMENTS

A. Achievement Categories:
   - Beginner (badges)
   - Intermediate (badges)
   - Advanced (badges)
   - Expert (badges)

B. Achievement Grid:
   - Cards with badges
   - Each achievement:
     * Badge icon (unlocked: color, locked: grayscale)
     * Title
     * Description
     * Progress bar (if in progress)
     * Date earned (if unlocked)
     * Rarity label (Common/Rare/Epic/Legendary)
   - Filter by category/status
   - Sort by recent/rarity

C. Achievement Details Modal (on click):
   - Large badge icon
   - Title
   - Description
   - Requirements
   - Progress (if in progress)
   - Date earned
   - Share button (social media)

DESIGN:
- Use colorful charts (Chart.js/Recharts)
- Smooth animations
- Celebratory animations for achievements
- Responsive grid layouts
- Export functionality (PDF reports)
- Print-friendly styles
- Dark mode support

Generate this progress tracking system with full TypeScript types.
\`\`\`

---

# 📝 LAYER 6: NOTIFICATIONS & SOCIAL FEATURES

## Prompt 6.1: Notifications System

\`\`\`
Create comprehensive notifications system for IELTSGo:

API ENDPOINTS:
- GET /api/v1/notifications - Get notifications
- GET /api/v1/notifications/unread-count - Get unread count
- PUT /api/v1/notifications/:id/read - Mark as read
- PUT /api/v1/notifications/mark-all-read - Mark all as read
- DELETE /api/v1/notifications/:id - Delete notification
- GET /api/v1/notifications/preferences - Get preferences
- PUT /api/v1/notifications/preferences - Update preferences

COMPONENTS:

1. Notification Bell (components/features/NotificationBell.tsx)
   - Bell icon in navbar
   - Badge with unread count
   - Dropdown on click (don't navigate away):
     * Header: "Notifications" + "Mark all read" button
     * List of recent notifications (last 5)
     * Each item:
       - Icon (based on type)
       - Title (bold if unread)
       - Message (truncated)
       - Time ago
       - Blue dot if unread
     * "View all" link at bottom
   - Auto-refresh every 30 seconds
   - Real-time updates (WebSocket or polling)

2. Notifications Page (app/(dashboard)/notifications/page.tsx)
   
   HEADER:
   - Title "Notifications"
   - Tabs:
     * All
     * Unread (with count badge)
     * Achievements
     * Courses
     * Exercises
     * System
   - Actions:
     * Mark all as read button
     * Filter dropdown (Today/This week/This month)
     * Clear all button (with confirmation)

   NOTIFICATION LIST:
   - Grouped by date:
     * Today
     * Yesterday
     * This week
     * Older
   
   - Each notification card:
     * Icon with colored background (based on type):
       - Course: Book icon (blue)
       - Exercise: FileCheck icon (green)
       - Achievement: Trophy icon (yellow)
       - System: Bell icon (gray)
     * Title
     * Message/description
     * Timestamp (relative: "5 mins ago")
     * Action button (optional):
       - "View course"
       - "Start exercise"
       - "View achievement"
     * Mark as read button (eye icon)
     * Delete button (trash icon)
   
   - Unread indicator (left border, bold text)
   - Click to mark as read automatically
   - Swipe to delete (mobile)
   - Loading skeletons
   - Empty state ("No notifications yet")
   - Pagination or infinite scroll

3. Notification Preferences Modal
   
   SECTIONS:
   
   A. Email Notifications:
   - Enable email notifications (master toggle)
   - Checkboxes:
     * Course updates
     * Exercise reminders
     * Achievement earned
     * Weekly progress report
     * Marketing emails

   B. Push Notifications:
   - Enable push notifications (toggle)
   - Checkboxes:
     * Course updates
     * Exercise reminders
     * Achievement earned
     * Study streak reminders

   C. In-App Notifications:
   - Enable in-app (toggle)
   - Checkboxes for each type

   D. Quiet Hours:
   - Enable quiet hours (toggle)
   - Start time (time picker)
   - End time (time picker)
   - Days selector (checkboxes)

   E. Frequency:
   - Digest option (toggle):
     * Real-time
     * Daily digest
     * Weekly digest
   
   - Save preferences button
   - Reset to default button

NOTIFICATION TYPES:

1. Course Updates:
   - "New lesson added to [Course Name]"
   - "Assignment deadline approaching"
   - "Instructor posted announcement"

2. Exercise Reminders:
   - "You haven't practiced Listening today"
   - "New practice test available"
   - "Your weak area: Reading - Practice now"

3. Achievements:
   - "Congratulations! You earned [Badge Name]"
   - "You're close to unlocking [Achievement]"

4. Study Streak:
   - "Don't break your 7-day streak!"
   - "New record: 30-day streak!"

5. System:
   - "New feature available"
   - "Scheduled maintenance"
   - "Terms updated"

FEATURES:
- Real-time notifications (WebSocket)
- Push notifications (Service Worker)
- Toast notifications (react-hot-toast)
- Sound on new notification (optional)
- Desktop notifications (browser API)
- Notification grouping
- Priority levels

DESIGN:
- Smooth animations (slide in/fade)
- Color-coded by type
- Clear unread indicator
- Hover effects
- Responsive list
- Dark mode support

Generate notification system with TypeScript and WebSocket integration.
\`\`\`

---

## Prompt 6.2: Leaderboard & Social Features

\`\`\`
Create leaderboard and social features for IELTSGo:

API ENDPOINTS:
- GET /api/v1/user/leaderboard - Get leaderboard (with pagination)
- GET /api/v1/user/leaderboard/rank - Get user's rank

LEADERBOARD PAGE (app/(dashboard)/leaderboard/page.tsx):

HEADER:
- Title "Leaderboard"
- Subtitle "Compete with learners worldwide"
- Filter tabs:
  * Global
  * Country
  * Friends
- Time period selector:
  * This week
  * This month
  * All time

YOUR RANK CARD (Sticky at top):
- Card with gradient background
- Your avatar (large)
- Your rank (#125)
- Your name
- Points (number)
- Progress bar to next rank
- "Share your progress" button

TOP 3 PODIUM (Special section):
- Large cards for ranks 1, 2, 3
- Podium visualization:
  * 1st place: Gold, center, tallest
  * 2nd place: Silver, left, medium
  * 3rd place: Bronze, right, shortest
- Each shows:
  * Crown icon (for #1)
  * Avatar (large)
  * Name
  * Points
  * Badge/title
  * Country flag

LEADERBOARD TABLE (From rank 4):
- Columns:
  * Rank number (bold)
  * User (avatar + name)
  * Points (number)
  * Achievements count (trophy icon)
  * Study hours (clock icon)
  * Current streak (fire icon)
- Rows:
  * Alternating background colors
  * Your row: Highlighted (blue background)
  * Hover effect
- Pagination (25 per page)
- Loading skeleton

STATS SIDEBAR (Right side, desktop only):

A. Competition Stats:
   - Total participants (number)
   - Average score (percentage)
   - Top performer (name + avatar)

B. Milestones:
   - Next milestone (points needed)
   - Progress bar
   - Rewards preview

C. Recent Climbers:
   - Users who gained most ranks
   - Avatar + name + rank change

FEATURES:
- Search user by name
- View user profile (modal):
  * Avatar
  * Name
  * Bio
  * Stats (courses, exercises, achievements)
  * Recent activity
  * Follow button (future)
- Filter by skill type
- Share leaderboard position (social media)
- Animated rank changes

REWARDS SYSTEM (Modal):
- Weekly rewards for top 10:
  * 1st: 500 points + Premium badge
  * 2nd-3rd: 300 points + Gold badge
  * 4th-10th: 100 points + Silver badge
- Monthly grand prize
- Display previous winners

DESIGN:
- Use gold (#FFD700), silver (#C0C0C0), bronze (#CD7F32)
- Animated numbers (count up)
- Confetti animation for top 3
- Trophy icons
- Responsive table (card view on mobile)
- Smooth scroll to user's rank

Generate leaderboard with animations and TypeScript types.
\`\`\`

---

# 📝 ADDITIONAL COMPONENTS

## Prompt 7.1: Shared Components & Utilities

\`\`\`
Create reusable components and utilities for IELTSGo:

COMPONENTS:

1. Loading States:
   - PageLoader (full page spinner)
   - SkeletonCard (for cards)
   - SkeletonTable (for tables)
   - SkeletonText (for text)
   - ButtonLoader (spinner in button)

2. Empty States:
   - EmptyState component:
     * Icon
     * Title
     * Message
     * Action button
   - Variants:
     * NoCourses
     * NoExercises
     * NoNotifications
     * NoResults (search)

3. Error States:
   - ErrorBoundary (catch React errors)
   - ErrorMessage component
   - NetworkError component
   - 404Page component
   - 500Page component

4. Modals:
   - ConfirmDialog (Yes/No)
   - AlertDialog (OK)
   - CustomModal (wrapper)
   - FullscreenModal

5. Data Display:
   - StatCard (number + label + icon)
   - ProgressRing (circular progress)
   - ProgressBar (linear progress)
   - BadgeCollection (tags/badges)
   - AvatarGroup (multiple avatars)

6. Forms:
   - FormInput (with label, error)
   - FormTextarea
   - FormSelect
   - FormCheckbox
   - FormRadio
   - FormDatePicker
   - FormTimePicker
   - FormSlider

7. Cards:
   - CourseCard
   - ExerciseCard
   - AchievementCard
   - LessonCard
   - UserCard

8. Feedback:
   - Toast (success/error/info/warning)
   - Banner (top of page)
   - Tooltip
   - Popover

UTILITIES:

1. API Client (lib/api/client.ts):
   - Axios instance with:
     * Base URL from env
     * JWT interceptor (add token to headers)
     * Refresh token interceptor
     * Error handling
     * Request/Response logging
   - Methods:
     * get, post, put, delete, patch
   - Type-safe API calls

2. Auth Utils (lib/auth/utils.ts):
   - getToken() - get JWT from storage
   - setToken() - save JWT
   - removeToken() - clear JWT
   - isAuthenticated() - check if logged in
   - getUser() - get user from token
   - refreshToken() - refresh JWT

3. Date Utils (lib/utils/date.ts):
   - formatDate() - format timestamp
   - formatRelative() - "2 hours ago"
   - formatDuration() - "1h 30m"
   - isToday(), isYesterday()

4. Format Utils (lib/utils/format.ts):
   - formatNumber() - 1,234
   - formatCurrency() - $12.34
   - formatPercentage() - 85%
   - truncateText() - "Long text..."

5. Validation Schemas (lib/validation/schemas.ts):
   - Using Zod:
     * loginSchema
     * registerSchema
     * profileSchema
     * courseSchema
     * exerciseSchema

HOOKS:

1. useAuth() - authentication state
2. useUser() - current user data
3. useDebounce() - debounce value
4. useLocalStorage() - persist state
5. useMediaQuery() - responsive breakpoints
6. usePagination() - pagination logic
7. useInfiniteScroll() - infinite loading
8. useTimer() - countdown timer
9. useAudio() - audio player state
10. useVideoProgress() - video tracking

TYPES (types/index.ts):
- User
- Course
- Exercise
- Lesson
- Submission
- Notification
- Achievement
- Progress

Generate all these utilities with proper TypeScript types.
\`\`\`

---

## Prompt 7.2: Mobile Responsive Enhancements

\`\`\`
Create mobile-specific enhancements for IELTSGo:

FEATURES:

1. Bottom Navigation (Mobile Only):
   - Fixed bottom bar
   - Icons with labels
   - Items:
     * Home (HomeIcon)
     * Courses (BookIcon)
     * Exercises (FileTextIcon)
     * Progress (TrendingUpIcon)
     * Profile (UserIcon)
   - Active state (blue color, indicator)
   - Smooth transitions

2. Mobile Sidebar (Drawer):
   - Slide from left
   - Overlay backdrop
   - User profile at top:
     * Avatar
     * Name
     * Email
   - Menu items (same as desktop)
   - Sign out button at bottom
   - Swipe to close

3. Touch Gestures:
   - Swipe to delete (notifications, items)
   - Pull to refresh (lists)
   - Swipe between tabs
   - Long press for options menu

4. Mobile Optimizations:
   - Lazy load images
   - Virtualized lists (react-window)
   - Reduced animations
   - Offline support (Service Worker)
   - Progressive Web App (PWA):
     * manifest.json
     * Icons (192x192, 512x512)
     * Splash screens
     * Install prompt

5. Mobile Search:
   - Full-screen search overlay
   - Search icon in navbar
   - Recent searches
   - Search suggestions
   - Voice search button

6. Mobile Video Player:
   - Landscape mode optimization
   - Auto-rotate on fullscreen
   - Picture-in-picture
   - Background playback (if supported)

7. Mobile Exercise Player:
   - Single column layout
   - Fixed navigation at bottom
   - Sticky timer at top
   - Optimized for touch
   - Larger touch targets

RESPONSIVE BREAKPOINTS:
- Mobile: 0-640px (sm)
- Tablet: 641-1024px (md-lg)
- Desktop: 1025px+ (xl)

TAILWIND CONFIG:
- Mobile-first approach
- Hide desktop elements: hidden md:block
- Show mobile elements: block md:hidden
- Responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

Generate mobile-specific components with touch optimizations.
\`\`\`

---

# 📋 IMPLEMENTATION ORDER

Implement prompts in this order for best results:

## Phase 1: Foundation (Week 1)
1. Prompt 1.1 - Project Setup
2. Prompt 1.2 - Layout Components
3. Prompt 7.1 - Shared Components

## Phase 2: Authentication (Week 1-2)
4. Prompt 2.1 - Auth Pages
5. Prompt 2.2 - Profile & Settings

## Phase 3: Course System (Week 2-3)
6. Prompt 3.1 - Course Browse & Detail
7. Prompt 3.2 - Lesson Player

## Phase 4: Exercise System (Week 3-4)
8. Prompt 4.1 - Exercise Browse
9. Prompt 4.2 - Exercise Player

## Phase 5: Dashboard (Week 4-5)
10. Prompt 5.1 - Dashboard Overview
11. Prompt 5.2 - Progress Tracking

## Phase 6: Social Features (Week 5-6)
12. Prompt 6.1 - Notifications
13. Prompt 6.2 - Leaderboard

## Phase 7: Polish (Week 6)
14. Prompt 7.2 - Mobile Optimizations
15. Testing & Bug fixes
16. Performance optimization
17. Deployment

---

# 🎨 DESIGN GUIDELINES

## Colors (Based on IELTSGo Logo)

\`\`\`css
:root {
  /* Primary Colors - Red (IELTSGo Brand) */
  --primary-50: #fef2f2;
  --primary-100: #fee2e2;
  --primary-500: #ED372A; /* Main red - from logo */
  --primary-600: #d42e22;
  --primary-700: #b91c1c;

  /* Secondary Colors - Dark (IELTSGo Brand) */
  --secondary-50: #f9fafb;
  --secondary-100: #f3f4f6;
  --secondary-500: #101615; /* Main dark - from logo */
  --secondary-600: #0a0f0e;
  --secondary-700: #1f2937;

  /* Accent Colors - Cream/Beige (IELTSGo Brand) */
  --accent-50: #fffbf5;
  --accent-100: #fef7ec;
  --accent-500: #FEF7EC; /* Main cream - from logo */
  --accent-600: #f5e5d3;
  --accent-700: #e8d4ba;

  /* Dark Red - Shadow/Depth */
  --dark-red: #B92819; /* From logo */
  --dark-red-hover: #a01f12;

  /* Neutrals */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-500: #6b7280;
  --gray-900: #1f2937;

  /* Status Colors */
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #ED372A; /* Use brand red for info */
}
\`\`\`

## Typography

\`\`\`css
/* Headings */
h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }

/* Body */
body { font-size: 1rem; line-height: 1.5; }
small { font-size: 0.875rem; }
\`\`\`

## Spacing

\`\`\`
Margin/Padding scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32
\`\`\`

## Border Radius

\`\`\`
Small: 0.25rem (4px)
Medium: 0.5rem (8px)
Large: 1rem (16px)
\`\`\`

---

# 🔗 API INTEGRATION NOTES

## Base URL
\`\`\`typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
\`\`\`

## Authentication Header
\`\`\`typescript
headers: {
  'Authorization': \`Bearer \${token}\`,
  'Content-Type': 'application/json'
}
\`\`\`

## Error Handling
\`\`\`typescript
try {
  const response = await api.get('/endpoint')
  return response.data
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 403) {
    // Show permission denied
  } else {
    // Show error message
  }
}
\`\`\`

---

# ✅ CHECKLIST

For each component generated by v0:

- [ ] TypeScript types defined
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Dark mode support
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimized (lazy loading, memoization)
- [ ] API integration with React Query
- [ ] Form validation (if applicable)
- [ ] Toast notifications for success/error
- [ ] Smooth animations/transitions

---

# 🚀 DEPLOYMENT

## Environment Variables

\`\`\`.env
NEXT_PUBLIC_API_URL=https://api.ieltsgo.com/api/v1
NEXT_PUBLIC_APP_URL=https://ieltsgo.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
\`\`\`

## Build Commands

\`\`\`bash
npm run build
npm run start
\`\`\`

## Deployment Platforms
- Vercel (recommended)
- Netlify
- AWS Amplify

---

**🎉 Hoàn tất! Sử dụng các prompts trên với v0 by Vercel để xây dựng từng layer một!**

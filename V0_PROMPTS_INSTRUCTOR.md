# 👨‍🏫 V0 PROMPTS - INSTRUCTOR DASHBOARD (IELTSGO)

> Prompts for v0 by Vercel to build Instructor dashboard for IELTSGo platform

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

## 📋 INSTRUCTOR DASHBOARD STRUCTURE

### Main Sections:
1. **Instructor Dashboard** - Overview của content đã tạo, stats học viên
2. **My Courses** - Quản lý courses (CRUD)
3. **My Exercises** - Quản lý exercises (CRUD)
4. **Course Builder** - Tool tạo course mới (drag-drop, WYSIWYG)
5. **Exercise Builder** - Tool tạo exercise (question bank, templates)
6. **Student Progress** - Xem tiến trình học viên
7. **Analytics** - Stats của courses/exercises mình tạo

### Note:
- Instructor có TẤT CẢ features của Student
- Sử dụng V0_PROMPTS_GUIDE.md cho Student UI
- File này chỉ bổ sung phần Instructor-specific

---

# LAYER 1: INSTRUCTOR LAYOUT

## Prompt 1.1: Instructor Navigation & Layout

```
Create an instructor dashboard layout for IELTSGo with:

LAYOUT STRUCTURE:
- Top navigation bar (not sidebar)
- Logo left, menu center, profile right
- Breadcrumbs below nav
- Main content area with cream background (#FEF7EC)

TOP NAVIGATION:
Logo (left):
- "IELTSGo" logo in red (#ED372A)
- "Instructor Portal" subtitle

Menu Items (center):
1. 🏠 Dashboard (default active)
2. 📚 My Courses
3. 📝 My Exercises
4. 👥 Students
5. 📊 Analytics
6. 💡 Learning (link to student view)

Right Section:
- "Create" dropdown button (red #ED372A):
  * New Course
  * New Exercise
  * Upload Video
- Notification bell with badge
- Instructor profile dropdown:
  * View Profile
  * Switch to Student View
  * Settings
  * Help & Support
  * Logout

DESIGN:
- Nav bar: White background, shadow below
- Active menu: Red underline (#ED372A)
- Hover: Red text
- Create button: Red background, white text
- Sticky navigation on scroll
- Responsive: Hamburger menu on mobile

COLORS:
- Primary Red: #ED372A (active, buttons)
- Dark: #101615 (text)
- Cream: #FEF7EC (page background)
- White: Nav background

TECH STACK:
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Shadcn/UI components
- Lucide React icons
```

---

# LAYER 2: INSTRUCTOR DASHBOARD OVERVIEW

## Prompt 2.1: Instructor Dashboard Home

```
Create an instructor dashboard overview page for IELTSGo with:

PAGE LAYOUT:
- Welcome header with greeting
- Quick stats (4 cards)
- Recent activity section
- My courses grid (first 6)
- My exercises grid (first 6)
- Student engagement chart

WELCOME HEADER:
- Large heading: "Welcome back, [Instructor Name]!"
- Subtitle: "Here's what's happening with your content"
- Date display: "Tuesday, October 15, 2025"
- Quick action buttons:
  * "Create Course" (red #ED372A)
  * "Create Exercise"
  * "View All Students"

QUICK STATS (Grid 4 cards):
1. My Courses
   - Count with icon (BookOpen)
   - Published vs Draft
   - "View all" link
   - Color: Blue gradient

2. My Exercises
   - Count with icon (PenTool)
   - Published vs Draft
   - "View all" link
   - Color: Green gradient

3. Total Students
   - Count with icon (Users)
   - Active learners
   - "View students" link
   - Color: Orange gradient

4. Avg Completion Rate
   - Percentage with icon (TrendingUp)
   - Trend indicator (↑ 5%)
   - "View analytics" link
   - Color: Red gradient (#ED372A)

RECENT ACTIVITY (Timeline):
- Shows last 10 activities:
  * Student enrolled in your course
  * Student completed your exercise
  * New review on your course
  * Exercise submission graded
- Each item: Icon, action text, timestamp, student name
- "View all activity" link at bottom

MY COURSES SECTION:
- Heading: "My Courses" with "View All" button
- Grid of 6 course cards:
  * Thumbnail image
  * Course title
  * Status badge (Draft/Published/Archived)
  * Enrollment count
  * Completion rate progress bar
  * Average rating (stars)
  * Actions: Edit, Analytics, Archive
- 3 columns desktop, 1 column mobile
- "Create New Course" card at end

MY EXERCISES SECTION:
- Similar to courses
- Grid of 6 exercise cards:
  * Exercise title
  * Type badge (Reading/Listening/Writing/Speaking)
  * Difficulty badge (Easy/Medium/Hard)
  * Status (Draft/Published)
  * Total attempts
  * Average score
  * Actions: Edit, Analytics, Duplicate
- "Create New Exercise" card at end

STUDENT ENGAGEMENT CHART:
- Line chart showing last 30 days:
  * Enrollments in your courses
  * Exercise attempts
  * Completions
- X-axis: Dates
- Y-axis: Count
- Use Recharts

DESIGN:
- Cards: White background, shadow, rounded
- Stats: Large numbers, colorful icons
- Activity: Timeline with left border
- Course/Exercise cards: Hover effect, shadow on hover
- Charts: White card with padding
- Use cream background (#FEF7EC) for page

API INTEGRATION:
- GET /api/v1/instructor/dashboard/stats
- GET /api/v1/instructor/dashboard/activity
- GET /api/v1/instructor/courses?limit=6
- GET /api/v1/instructor/exercises?limit=6
- GET /api/v1/instructor/analytics/engagement?days=30

TYPESCRIPT TYPES:
interface InstructorStats {
  totalCourses: number
  publishedCourses: number
  draftCourses: number
  totalExercises: number
  publishedExercises: number
  draftExercises: number
  totalStudents: number
  activeStudents: number
  averageCompletionRate: number
  completionTrend: number
}

interface Activity {
  id: string
  type: 'enrollment' | 'completion' | 'review' | 'submission'
  action: string
  studentName: string
  studentAvatar?: string
  contentTitle: string
  timestamp: string
}

LIBRARIES:
- Recharts for charts
- date-fns for date formatting
- Lucide React icons
- Shadcn/UI Card, Badge, Progress
```

---

# LAYER 3: COURSE MANAGEMENT

## Prompt 3.1: My Courses List & Management

```
Create a course management page for IELTSGo instructors with:

PAGE STRUCTURE:
- Header with "My Courses" title and "Create Course" button (red #ED372A)
- Filter/search bar
- View toggle (Grid/List)
- Courses display area
- Pagination

FILTER BAR:
- Search input (by course title, description)
- Status filter: All, Published, Draft, Archived
- Category filter: All, Reading, Listening, Writing, Speaking, General
- Level filter: All, Beginner, Intermediate, Advanced
- Sort by: Newest, Oldest, Most Popular, Highest Rated
- "Clear Filters" button

VIEW MODES:
Toggle between Grid and List view

GRID VIEW (3 columns):
Course cards with:
- Thumbnail image (hover overlay with "Edit" button)
- Status badge (top-right corner):
  * Draft: Gray
  * Published: Green
  * Archived: Orange
- Course title (bold, truncated)
- Short description (2 lines, truncated)
- Category badge
- Level badge
- Stats row:
  * 👥 Enrollments: Count
  * ⭐ Rating: Stars + count
  * 📊 Completion: Percentage
- Actions row:
  * "Edit" button
  * "Analytics" button
  * "More" dropdown:
    - Duplicate
    - Publish/Unpublish
    - Archive
    - Delete (with confirmation)

LIST VIEW (Table):
Columns:
1. Thumbnail (small)
2. Title + Description
3. Status (badge)
4. Category
5. Enrollments
6. Rating
7. Completion Rate
8. Last Updated
9. Actions (3-dot menu)

EMPTY STATE:
- Large icon (BookOpen)
- "No courses yet"
- "Create your first course to get started"
- "Create Course" button (red #ED372A)

COURSE ACTIONS:
Edit Course:
- Opens course builder (see Prompt 3.2)

Analytics:
- Opens analytics modal/page for that course

Duplicate:
- Creates copy with "[Copy]" in title
- Status set to Draft

Publish/Unpublish:
- Toggle publication status
- Confirmation modal

Archive:
- Move to archived (hidden from students)
- Can unarchive later

Delete:
- Confirmation modal: "Type course title to confirm"
- Soft delete (can restore from admin)

DESIGN:
- Cards: White background, hover shadow
- Status badges: Color-coded
- Action buttons: Icon buttons with tooltips
- Grid: Gap between cards
- Responsive: 3 cols desktop → 1 col mobile

API INTEGRATION:
- GET /api/v1/instructor/courses?status=published&category=reading&sort=newest
- POST /api/v1/admin/courses (create - uses admin endpoint)
- PUT /api/v1/admin/courses/:id (update)
- POST /api/v1/admin/courses/:id/publish
- POST /api/v1/admin/courses/:id/duplicate
- DELETE /api/v1/admin/courses/:id (only if admin, otherwise request admin)

TYPESCRIPT TYPES:
interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  status: 'draft' | 'published' | 'archived'
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  enrollmentCount: number
  averageRating: number
  ratingCount: number
  completionRate: number
  createdAt: string
  updatedAt: string
  instructorId: string
  instructorName: string
}

LIBRARIES:
- Shadcn/UI Card, Table, Badge, Dialog
- Lucide React icons
- React Query for data fetching
```

## Prompt 3.2: Course Builder (Create/Edit)

```
Create a comprehensive course builder for IELTSGo instructors with:

PAGE LAYOUT:
- Full-screen builder interface
- Top bar with save/publish actions
- Left sidebar: Course outline/structure
- Main editor area: Content editor
- Right sidebar: Preview

TOP BAR:
- Course title input (inline edit)
- Status indicator (Draft/Published)
- Actions (right):
  * "Save Draft" button (outline)
  * "Preview" button
  * "Publish" button (red #ED372A)
  * "Close" button (×)

LEFT SIDEBAR (Course Structure):
- "Course Info" section (always expanded)
- "Modules" section (collapsible list):
  * Module 1
    - Lesson 1.1
    - Lesson 1.2
    - + Add Lesson
  * Module 2
    - Lesson 2.1
    - + Add Lesson
  * + Add Module button
- Drag handles for reordering
- Click module/lesson to edit in main area
- Active item highlighted (red #ED372A)

MAIN EDITOR AREA:
Shows different forms based on selection:

COURSE INFO FORM:
- Thumbnail upload (drag-drop or click)
- Title: Input (required)
- Subtitle: Input
- Description: Rich text editor (WYSIWYG)
  * Bold, italic, lists, links
  * Image upload
- Category: Select (Reading, Listening, Writing, Speaking, General)
- Level: Select (Beginner, Intermediate, Advanced)
- Language: Select (English, Vietnamese)
- Duration: Input (estimated hours)
- Price: Input (if paid feature, else free)
- Tags: Tag input (multi-select)
- What you'll learn: List builder
  * Add bullet points
  * Reorder with drag
- Requirements: List builder
- Target audience: Textarea

MODULE FORM (when module selected):
- Module title: Input (e.g., "Module 1: Introduction")
- Module description: Textarea
- Order: Number (auto)
- "Delete Module" button (with confirmation)

LESSON FORM (when lesson selected):
- Lesson title: Input
- Lesson type: Select
  * Video Lesson
  * Text/Article
  * Quiz
  * Mixed
- Content based on type:

  If Video:
  - YouTube URL: Input (auto-embed preview)
  - OR Upload video file
  - Video duration: Auto-detected
  - Transcript: Textarea (optional)

  If Text:
  - Rich text editor (full-featured)
  - Support: Images, code blocks, embeds
  - Word count display

  If Quiz:
  - Quiz builder (see below)

  If Mixed:
  - Multiple content blocks
  - Add: Video, Text, Quiz blocks
  - Reorder blocks

- Duration: Input (minutes)
- Is free preview: Checkbox
- "Delete Lesson" button

QUIZ BUILDER (for lesson type Quiz):
- Question list (numbered)
- Each question:
  * Question text: Input
  * Question type: Select
    - Multiple Choice
    - True/False
    - Fill in the blank
  * Options: Dynamic inputs (A, B, C, D for MC)
  * Correct answer: Select/mark
  * Explanation: Textarea (optional)
  * Points: Input (default 1)
- "Add Question" button
- Total points display
- Passing score: Input (percentage)

RIGHT SIDEBAR (Preview):
- Live preview of current editing
- Shows how it looks to students
- Toggle device: Desktop/Tablet/Mobile
- "Open in new tab" button

DESIGN:
- Builder: White background
- Sidebar: Light gray (#f3f4f6)
- Active item: Red highlight (#ED372A)
- Editor: WYSIWYG with toolbar
- Drag handles: 6-dot icon
- Save states: Auto-save indicator
- Validation errors: Red borders, error messages

API INTEGRATION:
- POST /api/v1/admin/courses (create)
- GET /api/v1/admin/courses/:id (load for edit)
- PUT /api/v1/admin/courses/:id (update)
- POST /api/v1/admin/modules (create module)
- PUT /api/v1/admin/modules/:id (update module)
- DELETE /api/v1/admin/modules/:id (delete module)
- POST /api/v1/admin/lessons (create lesson)
- PUT /api/v1/admin/lessons/:id (update lesson)
- DELETE /api/v1/admin/lessons/:id (delete lesson)
- POST /api/v1/admin/lessons/:lesson_id/videos (add video)
- POST /api/v1/admin/courses/:id/publish (publish)

TYPESCRIPT TYPES:
interface CourseBuilder {
  id?: string
  title: string
  subtitle: string
  description: string
  thumbnail?: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  duration: number
  price: number
  tags: string[]
  learningOutcomes: string[]
  requirements: string[]
  targetAudience: string
  modules: Module[]
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  moduleId: string
  title: string
  type: 'video' | 'text' | 'quiz' | 'mixed'
  content: any // varies by type
  duration: number
  isFreePreview: boolean
  order: number
}

VALIDATION:
- Title: Required, min 5 chars, max 200
- Description: Required, min 50 chars
- Category: Required
- Each module must have ≥1 lesson
- Each lesson must have content
- Video URL: Valid YouTube URL
- Quiz: Must have ≥1 question with correct answer

FEATURES:
- Auto-save every 30 seconds
- Unsaved changes warning on close
- Keyboard shortcuts (Ctrl+S to save)
- Undo/Redo for text editor
- Image optimization on upload
- Video preview player

LIBRARIES:
- @tiptap/react for rich text editor
- @dnd-kit/core for drag-drop
- React Hook Form + Zod validation
- react-youtube for video embed
- Shadcn/UI Form, Input, Textarea components
- Lucide React icons
```

---

# LAYER 4: EXERCISE MANAGEMENT

## Prompt 4.1: My Exercises List & Management

```
Create an exercise management page for IELTSGo instructors with:

PAGE STRUCTURE:
- Header with "My Exercises" and "Create Exercise" button (red #ED372A)
- Filter bar
- View toggle (Grid/Table)
- Exercises display
- Pagination

FILTER BAR:
- Search: Input (by title)
- Type: All, Reading, Listening, Writing, Speaking
- Difficulty: All, Easy, Medium, Hard
- Status: All, Published, Draft
- Sort: Newest, Oldest, Most Attempted, Highest Avg Score
- "Clear Filters"

GRID VIEW (4 columns):
Exercise cards:
- Type badge (top-left): Reading/Listening/Writing/Speaking
  * Color-coded icons
- Difficulty badge (top-right): Easy (green), Medium (orange), Hard (red)
- Status badge: Draft (gray), Published (green)
- Exercise title (bold)
- Question count: "15 questions"
- Stats:
  * 📝 Attempts: Count
  * 📊 Avg Score: Percentage
  * ⏱️ Avg Time: Minutes
- Actions:
  * "Edit" button
  * "Analytics" button
  * "More" dropdown:
    - Preview
    - Duplicate
    - Publish/Unpublish
    - Export (JSON/PDF)
    - Delete

TABLE VIEW:
Columns:
1. Title
2. Type (badge)
3. Difficulty (badge)
4. Questions (count)
5. Status (badge)
6. Attempts
7. Avg Score
8. Created
9. Actions

EMPTY STATE:
- Icon (PenTool)
- "No exercises yet"
- "Create your first exercise"
- "Create Exercise" button

EXERCISE ACTIONS:
Edit:
- Opens Exercise Builder (Prompt 4.2)

Analytics:
- Opens analytics modal:
  * Total attempts
  * Completion rate
  * Score distribution (histogram)
  * Time distribution
  * Question-level analytics (correct rate per question)
  * Most missed questions
  * Student performance table

Preview:
- Opens exercise as student would see
- Full preview with timer
- Cannot submit (preview mode)

Duplicate:
- Creates copy with "[Copy]" suffix
- Status: Draft

Publish/Unpublish:
- Toggle status
- Validation: Must have ≥1 question

Export:
- JSON: For backup/sharing
- PDF: Printable version

Delete:
- Confirmation: "Type exercise title"
- Soft delete

DESIGN:
- Cards: White, hover shadow
- Type badges:
  * Reading: Blue
  * Listening: Purple
  * Writing: Orange
  * Speaking: Green
- Difficulty badges:
  * Easy: Green
  * Medium: Orange
  * Hard: Red (#ED372A)
- Responsive: 4 cols → 2 cols → 1 col

API INTEGRATION:
- GET /api/v1/instructor/exercises?type=reading&difficulty=medium
- POST /api/v1/admin/exercises (create)
- GET /api/v1/admin/exercises/:id (get detail)
- PUT /api/v1/admin/exercises/:id (update)
- POST /api/v1/admin/exercises/:id/publish
- POST /api/v1/admin/exercises/:id/unpublish
- POST /api/v1/admin/exercises/:id/duplicate
- DELETE /api/v1/admin/exercises/:id
- GET /api/v1/admin/exercises/:id/analytics

TYPESCRIPT TYPES:
interface Exercise {
  id: string
  title: string
  description: string
  type: 'reading' | 'listening' | 'writing' | 'speaking'
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'published'
  questionCount: number
  totalAttempts: number
  averageScore: number
  averageCompletionTime: number
  createdAt: string
  updatedAt: string
  instructorId: string
}

interface ExerciseAnalytics {
  exerciseId: string
  totalAttempts: number
  completedAttempts: number
  abandonedAttempts: number
  averageScore: number
  medianScore: number
  highestScore: number
  lowestScore: number
  scoreDistribution: { range: string; count: number }[]
  questionStatistics: QuestionStat[]
}

interface QuestionStat {
  questionNumber: number
  correctRate: number
  averageTime: number
  mostCommonWrongAnswer?: string
}

LIBRARIES:
- Recharts for analytics charts
- Shadcn/UI Card, Table, Dialog
- Lucide React icons
```

## Prompt 4.2: Exercise Builder (Create/Edit)

```
Create a comprehensive exercise builder for IELTSGo instructors with:

PAGE LAYOUT:
- Full-screen builder
- Top bar with save/publish
- Left sidebar: Exercise settings
- Main area: Question builder
- Right sidebar: Preview

TOP BAR:
- Exercise title input (inline)
- Status: Draft/Published
- Actions:
  * "Save Draft"
  * "Preview" (opens preview modal)
  * "Publish" button (red #ED372A)
  * "Close" (×)

LEFT SIDEBAR (Exercise Settings):
- Basic Info section:
  * Type: Select (Reading, Listening, Writing, Speaking)
  * Difficulty: Select (Easy, Medium, Hard)
  * Time limit: Input (minutes)
  * Passing score: Input (percentage)
  * Tags: Multi-select
- Description: Textarea
- Instructions: Rich text editor (shown to students before exercise)
- Resources section (if Reading/Listening):
  * Passage/Audio file upload
  * Passage text: Rich text editor
  * Audio URL: Input (if Listening)

MAIN AREA (Question Builder):
- Question list (numbered):
  * Question 1
  * Question 2
  * ...
  * + Add Question button

QUESTION EDITOR (when question selected):
Shows form based on question type:

Question Header:
- Question number: Display
- Question type: Select
  * Multiple Choice (single answer)
  * Multiple Choice (multiple answers)
  * True/False
  * Fill in the Blank
  * Short Answer (for Writing/Speaking)
  * Matching
  * Ordering
- Points: Input (default 1)
- "Delete Question" button

MULTIPLE CHOICE:
- Question text: Rich text editor
  * Can include images
- Options (A, B, C, D...):
  * Option text: Input for each
  * Correct answer: Radio/Checkbox (single/multiple)
  * "Add option" button (up to 6 options)
  * "Remove option" (×)
- Explanation: Textarea (shown after submission)

TRUE/FALSE:
- Statement: Rich text editor
- Correct answer: Radio (True/False)
- Explanation: Textarea

FILL IN THE BLANK:
- Sentence: Input with [blank] placeholder
  * Example: "The capital of France is [blank]."
- Correct answers: List (accept multiple correct answers)
  * "Paris", "paris"
- Case sensitive: Checkbox
- Explanation: Textarea

SHORT ANSWER (Writing/Speaking):
- Prompt: Rich text editor
- Word count: Min/Max inputs
- Sample answer: Textarea (optional, for reference)
- Rubric: List of criteria
  * Grammar: 0-25 points
  * Vocabulary: 0-25 points
  * Task Achievement: 0-25 points
  * Coherence: 0-25 points
- Notes: "This will be manually graded" message

MATCHING:
- Left column items: List builder
  * Item 1, Item 2, Item 3...
- Right column items: List builder (shuffled)
- Correct matches: Pair selector
- Partial credit: Checkbox

ORDERING:
- Items to order: List builder
- Correct order: Auto-numbered based on list
- Partial credit: Checkbox

QUESTION BANK INTEGRATION:
- "Add from Question Bank" button
- Opens modal:
  * Search questions by type, difficulty, tags
  * Select questions to import
  * Preview before adding

SECTIONS (for long exercises):
- "Add Section" button
- Section title: Input
- Section instructions: Textarea
- Questions grouped under sections
- Drag to move questions between sections

RIGHT SIDEBAR (Preview):
- Shows how current question looks to student
- Toggle: Desktop/Mobile view
- "Preview Full Exercise" button
  * Opens full preview modal
  * Can take exercise as student
  * See timer, navigation
  * Submit (test mode)

DESIGN:
- Question list: Numbered, collapsible
- Active question: Red highlight (#ED372A)
- Drag handles: Reorder questions
- Type icons: Color-coded
- Validation errors: Red borders
- Auto-save: Indicator in top bar

API INTEGRATION:
- POST /api/v1/admin/exercises (create)
- GET /api/v1/admin/exercises/:id (load)
- PUT /api/v1/admin/exercises/:id (update)
- POST /api/v1/admin/exercises/:id/sections (create section)
- POST /api/v1/admin/questions (create question)
- PUT /api/v1/admin/questions/:id (update question)
- DELETE /api/v1/admin/questions/:id (delete question)
- POST /api/v1/admin/questions/:id/options (add option)
- POST /api/v1/admin/questions/:id/answer (set answer)
- GET /api/v1/admin/question-bank?type=multiple_choice&difficulty=medium
- POST /api/v1/admin/exercises/:id/publish

TYPESCRIPT TYPES:
interface ExerciseBuilder {
  id?: string
  title: string
  type: 'reading' | 'listening' | 'writing' | 'speaking'
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number
  passingScore: number
  tags: string[]
  description: string
  instructions: string
  passage?: string // for Reading
  audioUrl?: string // for Listening
  sections: Section[]
}

interface Section {
  id: string
  title: string
  instructions: string
  order: number
  questions: Question[]
}

interface Question {
  id: string
  sectionId?: string
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer' | 'matching' | 'ordering'
  questionText: string
  points: number
  order: number
  options?: Option[] // for multiple choice
  correctAnswers: any // varies by type
  explanation?: string
  rubric?: Rubric[] // for short answer
}

interface Option {
  id: string
  text: string
  isCorrect: boolean
  order: number
}

interface Rubric {
  criterion: string
  maxPoints: number
}

VALIDATION:
- Title: Required, min 5 chars
- Exercise must have ≥1 question
- Each question must have:
  * Question text
  * Correct answer set
  * Points > 0
- Multiple choice: ≥2 options, ≥1 correct
- Fill blank: ≥1 correct answer
- Time limit: > 0
- Passing score: 0-100

FEATURES:
- Auto-save every 30 seconds
- Keyboard shortcuts (Ctrl+N for new question)
- Duplicate question button
- Bulk import questions from CSV
- Export to PDF for printing
- Question templates (quick start)
- Image upload for questions
- LaTeX support for math equations (if needed)

LIBRARIES:
- @tiptap/react for rich text
- @dnd-kit/core for drag-drop
- React Hook Form + Zod
- Shadcn/UI Form, Select, Textarea
- Lucide React icons
- katex for math (optional)
```

---

# LAYER 5: STUDENT PROGRESS TRACKING

## Prompt 5.1: Student Progress Dashboard

```
Create a student progress tracking page for IELTSGo instructors with:

PAGE STRUCTURE:
- Header with "My Students" and filters
- Stats cards
- Students table/grid
- Export options

HEADER:
- Title: "My Students"
- Subtitle: "Track your students' progress"
- Filter by:
  * Course: Select (my courses)
  * Status: All, Active, Inactive, Completed
  * Date enrolled: Date range picker
- Export button: Export to CSV

STATS CARDS (4 cards):
1. Total Students
   - Count across all courses
   - Icon: Users
2. Active This Week
   - Students with activity last 7 days
   - Icon: Activity
3. Avg Completion Rate
   - Percentage across all students
   - Trend indicator
   - Icon: TrendingUp
4. Avg Score
   - Average score on exercises
   - Icon: Award

STUDENTS TABLE:
Columns:
1. Student
   - Avatar + Name
   - Email below
2. Enrolled Courses
   - Count with dropdown to see list
3. Progress
   - Overall percentage
   - Progress bar (green)
4. Exercises Completed
   - Count
5. Avg Score
   - Percentage with color:
     * Green: ≥70%
     * Orange: 50-69%
     * Red: <50%
6. Last Active
   - Formatted date ("2 days ago")
7. Actions
   - "View Details" button
   - "Send Message" button

TABLE FEATURES:
- Sortable columns
- Search by name/email
- Pagination: 25, 50, 100 per page
- Row click: Opens student detail modal

STUDENT DETAIL MODAL:
Large modal (900px) with tabs:

TAB 1: OVERVIEW
- Student info:
  * Avatar
  * Full name
  * Email
  * Registration date
  * Total study hours
- Enrolled courses list:
  * Course title
  * Enrollment date
  * Progress bar
  * Completion status
  * "View details" link

TAB 2: COURSE PROGRESS
- For each enrolled course:
  * Course title (expandable)
  * Overall progress: X% (Y/Z lessons completed)
  * Module breakdown:
    - Module 1: 100% (5/5 lessons)
    - Module 2: 60% (3/5 lessons)
    - Module 3: 0% (0/4 lessons)
  * Last accessed: Date
  * Time spent: Hours
  * Completion trend (mini line chart)

TAB 3: EXERCISE PERFORMANCE
- Exercise attempts table:
  * Exercise title
  * Type (badge)
  * Attempt date
  * Score (percentage)
  * Time taken
  * Status (Completed/Abandoned)
  * "View submission" link
- Overall stats:
  * Total exercises attempted
  * Average score
  * Improvement trend (line chart)
- Performance by skill:
  * Reading: 75%
  * Listening: 82%
  * Writing: 68%
  * Speaking: 70%
  * Radar chart

TAB 4: ACTIVITY LOG
- Timeline of all activities:
  * Enrolled in [Course]
  * Completed [Lesson]
  * Attempted [Exercise]
  * Submitted [Exercise]
  * Reviewed [Course]
- Filter: Last 7/30/90 days, All time
- Export activity log

DESIGN:
- Table: White background, alternating row colors
- Progress bars: Green gradient
- Score colors: Green (high), Orange (mid), Red (low)
- Modal: Large, clean, tabbed
- Charts: Inline, compact
- Responsive: Table scrolls horizontally on mobile

API INTEGRATION:
- GET /api/v1/instructor/students?course=uuid&status=active
- GET /api/v1/instructor/students/:id/progress
- GET /api/v1/instructor/students/:id/courses
- GET /api/v1/instructor/students/:id/exercises
- GET /api/v1/instructor/students/:id/activity
- POST /api/v1/instructor/students/export (CSV export)

TYPESCRIPT TYPES:
interface Student {
  id: string
  fullName: string
  email: string
  avatar?: string
  enrolledCoursesCount: number
  overallProgress: number
  exercisesCompleted: number
  averageScore: number
  lastActiveAt: string
  registeredAt: string
}

interface StudentProgress {
  studentId: string
  courseId: string
  courseTitle: string
  enrolledAt: string
  progress: number
  lessonsCompleted: number
  totalLessons: number
  timeSpent: number
  lastAccessedAt: string
  modules: ModuleProgress[]
}

interface ModuleProgress {
  moduleId: string
  moduleTitle: string
  progress: number
  lessonsCompleted: number
  totalLessons: number
}

interface ExerciseAttempt {
  id: string
  exerciseId: string
  exerciseTitle: string
  exerciseType: string
  attemptDate: string
  score: number
  timeTaken: number
  status: 'completed' | 'abandoned'
}

LIBRARIES:
- Recharts for charts
- Shadcn/UI Table, Dialog, Tabs
- date-fns for date formatting
- Lucide React icons
```

---

# LAYER 6: INSTRUCTOR ANALYTICS

## Prompt 6.1: Content Analytics Dashboard

```
Create an analytics dashboard for IELTSGo instructors to track their content performance:

PAGE STRUCTURE:
- Header with date range selector
- Tab navigation: Overview | Courses | Exercises
- Content varies by tab
- Export button (PDF/CSV)

HEADER:
- Title: "My Analytics"
- Date range selector: Last 7/30/90 days, Custom
- Compare toggle: Compare with previous period
- Export dropdown: PDF Report, CSV Data

TAB 1: OVERVIEW

SUMMARY CARDS (4 cards):
1. Total Views
   - Count
   - Trend vs previous period
2. Total Enrollments
   - Count
   - Trend
3. Total Completions
   - Count
   - Completion rate (%)
4. Total Revenue (if paid)
   - Amount
   - Trend

ENGAGEMENT CHART:
- Line chart with 3 lines:
  * Views (blue)
  * Enrollments (green)
  * Completions (red #ED372A)
- X-axis: Dates
- Y-axis: Count
- Hover tooltip: Details

CONTENT PERFORMANCE TABLE:
- Top 10 courses/exercises by enrollments
- Columns:
  * Rank
  * Title
  * Type (Course/Exercise)
  * Views
  * Enrollments/Attempts
  * Completion Rate
  * Avg Rating
  * Revenue (if applicable)
- Click row: Go to detailed analytics

STUDENT ENGAGEMENT:
- Active students: Count
- Average study time: Hours
- Most active students (top 5):
  * Avatar, Name
  * Study hours
  * Courses completed

FEEDBACK SUMMARY:
- Average rating: Large number with stars
- Total reviews: Count
- Recent reviews (last 5):
  * Student name
  * Rating (stars)
  * Comment (truncated)
  * Course title
  * Date
- "View all reviews" link

TAB 2: COURSES ANALYTICS

COURSE PERFORMANCE TABLE:
- All my courses
- Columns:
  * Course title (with thumbnail)
  * Status (Published/Draft)
  * Enrollments
  * Active students
  * Completion rate
  * Avg time to complete
  * Avg rating
  * Revenue (if paid)
  * Actions: View Details
- Sort by any column
- Filter: Published, Draft, All

COURSE DETAIL VIEW (click "View Details"):
Opens detailed modal/page:

Overview section:
- Enrollment trend (line chart, last 30 days)
- Completion funnel:
  * Enrolled: 100 (100%)
  * Started: 80 (80%)
  * 50% complete: 50 (50%)
  * Completed: 30 (30%)
- Average rating trend (line chart)

Module Performance:
- Table of modules:
  * Module title
  * Completion rate
  * Avg time spent
  * Drop-off rate
- Identify problematic modules (low completion)

Lesson Performance:
- Table of lessons:
  * Lesson title
  * Type (Video/Text/Quiz)
  * Completion rate
  * Avg time
  * Engagement score
- Heatmap: Which lessons students skip

Student Demographics:
- Country distribution (pie chart)
- Age range (bar chart)
- Registration sources (pie)

Reviews & Ratings:
- Rating distribution (bar chart: 5★, 4★, 3★, 2★, 1★)
- Recent reviews list
- Common keywords (word cloud)

TAB 3: EXERCISES ANALYTICS

EXERCISE PERFORMANCE TABLE:
- All my exercises
- Columns:
  * Exercise title
  * Type (badge)
  * Difficulty (badge)
  * Total attempts
  * Completion rate
  * Avg score
  * Avg time
  * Actions: View Details

EXERCISE DETAIL VIEW (click "View Details"):

Overview:
- Attempt trend (line chart)
- Score distribution (histogram)
- Time distribution (histogram)

Question-Level Analytics:
- Table of questions:
  * Question number
  * Question type
  * Correct rate (%)
  * Avg time to answer
  * Most common wrong answer
- Identify difficult questions (low correct rate)

Student Performance:
- Top performers (leaderboard)
- Students needing help (low scores)
- Improvement trends

Recommendations:
- AI-powered insights:
  * "Question 5 has only 40% correct rate - consider revising"
  * "Students spend 3x longer on Section 2"
  * "90% of students skip the instructions"

DESIGN:
- Charts: Professional, colorful
- Tables: Sortable, filterable
- Cards: White background, shadow
- Insights: Blue info boxes
- Recommendations: Yellow warning boxes
- Export: PDF with charts and tables
- Responsive: Stack cards on mobile

API INTEGRATION:
- GET /api/v1/instructor/analytics/overview?from=date&to=date
- GET /api/v1/instructor/analytics/courses?from=date&to=date
- GET /api/v1/instructor/analytics/courses/:id/detail
- GET /api/v1/instructor/analytics/exercises?from=date&to=date
- GET /api/v1/instructor/analytics/exercises/:id/detail
- GET /api/v1/admin/exercises/:id/analytics (uses admin endpoint)
- POST /api/v1/instructor/analytics/export?format=pdf

TYPESCRIPT TYPES:
interface AnalyticsOverview {
  period: { from: string; to: string }
  totalViews: number
  viewsTrend: number
  totalEnrollments: number
  enrollmentsTrend: number
  totalCompletions: number
  completionsTrend: number
  totalRevenue?: number
  revenueTrend?: number
  engagementData: { date: string; views: number; enrollments: number; completions: number }[]
  topContent: ContentPerformance[]
  studentEngagement: StudentEngagement
  feedbackSummary: FeedbackSummary
}

interface ContentPerformance {
  id: string
  title: string
  type: 'course' | 'exercise'
  views: number
  enrollments: number
  completionRate: number
  averageRating: number
  revenue?: number
}

LIBRARIES:
- Recharts for all charts
- react-date-picker for date range
- jsPDF for PDF export
- xlsx for CSV export
- Shadcn/UI Card, Table, Tabs
- Lucide React icons
```

---

# LAYER 7: ADDITIONAL INSTRUCTOR FEATURES

## Prompt 7.1: Quick Actions & Utilities

```
Create utility components for IELTSGo instructors:

COMPONENT 1: QUICK CREATE MODAL
Opened from "Create" button in nav:

Modal content:
- Title: "What would you like to create?"
- 3 large cards (grid):
  1. New Course
     - Icon: BookOpen
     - Description: "Create a comprehensive IELTS course"
     - "Start" button (red #ED372A)
  2. New Exercise
     - Icon: PenTool
     - Description: "Create a practice exercise"
     - "Start" button
  3. Upload Video
     - Icon: Video
     - Description: "Upload a video lesson"
     - "Upload" button

Actions:
- New Course: Redirects to Course Builder
- New Exercise: Redirects to Exercise Builder
- Upload Video: Opens video upload modal

VIDEO UPLOAD MODAL:
- Drag-drop area (large)
- OR YouTube URL input
- Video preview after upload
- Video details form:
  * Title: Input
  * Description: Textarea
  * Course: Select (my courses)
  * Module: Select (based on course)
  * Lesson: Select or "Create new lesson"
  * Duration: Auto-detected
  * Thumbnail: Upload or auto-generate
- "Upload & Add to Course" button

COMPONENT 2: NOTIFICATION CENTER (Instructor-specific)
Bell icon in nav, opens dropdown:

Notification types:
1. New enrollment:
   - "[Student Name] enrolled in [Course]"
   - Time ago
   - "View student" link
2. New review:
   - "[Student] left a 5-star review on [Course]"
   - Preview comment
   - "View review" link
3. Exercise submission:
   - "[Student] completed [Exercise]"
   - Score: 85%
   - "View submission" link
4. Question asked (if Q&A feature):
   - "[Student] asked a question in [Course]"
   - Preview question
   - "Answer" button
5. Milestone achieved:
   - "🎉 Your course reached 100 enrollments!"
   - "View analytics" link

Notification actions:
- Mark as read
- Mark all as read
- Go to notification settings
- Filter: All, Unread, Important

COMPONENT 3: HELP & SUPPORT
Dropdown from profile menu:

Help options:
1. Documentation
   - "Getting Started Guide"
   - "How to Create a Course"
   - "How to Create an Exercise"
   - "Student Management"
   - "Analytics Guide"
2. Video Tutorials
   - Embedded video list
3. Contact Support
   - Opens support form:
     * Subject: Input
     * Category: Select (Technical, Content, Payment, Other)
     * Description: Textarea
     * Attach screenshot: Upload
     * "Submit" button (red #ED372A)
4. Feature Requests
   - Link to feedback form
5. Community Forum
   - Link to instructor community

COMPONENT 4: INSTRUCTOR SETTINGS
Page accessible from profile dropdown:

TABS:
1. Profile
   - Avatar upload
   - Full name: Input
   - Bio: Rich text editor
   - Headline: Input (e.g., "IELTS Expert with 10 years experience")
   - Website: Input
   - Social links: Facebook, LinkedIn, YouTube
   - "Save" button

2. Notification Preferences
   - Email notifications:
     * New enrollment: Toggle
     * New review: Toggle
     * Exercise submission: Toggle
     * Question asked: Toggle
     * Milestone achieved: Toggle
   - Push notifications (same list)
   - Frequency: Immediate, Daily digest, Weekly digest

3. Payment Settings (if applicable)
   - Bank account: Input
   - PayPal email: Input
   - Preferred currency: Select
   - Minimum payout: Input
   - Tax information: Form

4. Privacy
   - Show profile to students: Toggle
   - Show email to students: Toggle
   - Allow students to message: Toggle
   - Show in instructor directory: Toggle

DESIGN:
- Quick Create Modal: Large cards, hover effect
- Video Upload: Drag-drop with dashed border
- Notifications: List with unread indicator (red dot)
- Settings: Clean form layout
- All components: Red primary color (#ED372A)

API INTEGRATION:
- POST /api/v1/admin/lessons/:lesson_id/videos (video upload)
- GET /api/v1/instructor/notifications?unread=true
- PUT /api/v1/instructor/notifications/:id/read
- PUT /api/v1/instructor/notifications/read-all
- GET /api/v1/instructor/settings
- PUT /api/v1/instructor/settings
- POST /api/v1/instructor/support (submit support request)

LIBRARIES:
- react-dropzone for file upload
- Shadcn/UI Dialog, Dropdown, Form
- Lucide React icons
- @tiptap/react for bio editor
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Week 1: Instructor Core
- [ ] Prompt 1.1: Instructor navigation & layout
- [ ] Prompt 2.1: Dashboard overview

### Week 2: Course Management
- [ ] Prompt 3.1: My courses list
- [ ] Prompt 3.2: Course builder

### Week 3: Exercise Management
- [ ] Prompt 4.1: My exercises list
- [ ] Prompt 4.2: Exercise builder

### Week 4: Students & Analytics
- [ ] Prompt 5.1: Student progress tracking
- [ ] Prompt 6.1: Content analytics

### Week 5: Polish
- [ ] Prompt 7.1: Quick actions & utilities
- [ ] Test all flows
- [ ] Mobile responsiveness

---

## 🔗 INTEGRATION NOTES

### Authentication
- Instructor routes require JWT token
- Check role: Must be "instructor" or "admin"
- Add header: `Authorization: Bearer {token}`

### API Base URLs
```typescript
const INSTRUCTOR_API = process.env.NEXT_PUBLIC_API_URL + '/api/v1/instructor'
const ADMIN_API = process.env.NEXT_PUBLIC_API_URL + '/api/v1/admin'
// Instructor uses admin endpoints for content creation
```

### Content Creation Flow
1. Instructor creates course/exercise (uses admin endpoints)
2. Content starts as "Draft"
3. Instructor can preview
4. Instructor publishes (status → "Published")
5. Students can now see and enroll

### Real-time Features
- Use WebSocket for:
  * New enrollment notifications
  * New review notifications
  * Exercise submission notifications
- Fallback to polling every 30 seconds

### File Uploads
- Images: Max 5MB, .jpg/.png
- Videos: Max 500MB, .mp4/.mov/.avi
- Documents: Max 10MB, .pdf
- Use multipart/form-data
- Show upload progress bar

---

## 📚 REFERENCE DOCUMENTS

- **Roles & Permissions**: `ROLES_AND_PERMISSIONS.md`
- **Student UI Prompts**: `V0_PROMPTS_GUIDE.md` (Instructor có tất cả student features)
- **Admin UI Prompts**: `V0_PROMPTS_ADMIN.md` (nếu cần reference)
- **API Endpoints**: `docs/API_ENDPOINTS.md`
- **Brand Colors**: `IELTSGO_COLORS.md`

---

## 💡 KEY DIFFERENCES: INSTRUCTOR vs STUDENT

| Feature | Student | Instructor |
|---------|---------|------------|
| **Dashboard** | Learning progress | Content performance |
| **Courses** | Browse & enroll | Create & manage |
| **Exercises** | Take & submit | Create & manage |
| **Students** | View leaderboard | Track all students |
| **Analytics** | Own progress only | Content analytics |
| **Notifications** | System updates | Enrollments, reviews |
| **Content** | Consumer | Creator |

---

**Created**: 2025-10-15  
**For**: IELTSGo Instructor Dashboard  
**Tech Stack**: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI  
**API Gateway**: http://localhost:8080  
**Version**: 1.0

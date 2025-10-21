# Exercise Module - Frontend Implementation

## 📁 File Structure

```
app/exercises/
├── README.md                                    # This file
├── page.tsx                                     # OLD: Exercise results page (legacy)
├── list/
│   └── page.tsx                                 # NEW: Exercise list with filters
├── history/
│   └── page.tsx                                 # NEW: My submissions history
└── [exerciseId]/
    ├── page.tsx                                 # Exercise detail & start page
    ├── take/
    │   └── [submissionId]/
    │       └── page.tsx                         # NEW: Take exercise (doing the test)
    └── result/
        └── [submissionId]/
            └── page.tsx                         # NEW: View submission result
```

## 🎯 Pages Overview

### 1. Exercise List (`/exercises/list`)
**File**: `list/page.tsx`

**Features**:
- Browse all available exercises
- Filter by:
  - Skill type (Listening, Reading, Writing, Speaking)
  - Difficulty (Easy, Medium, Hard)
  - Search by title
- Pagination (12 exercises per page)
- Display exercise cards with:
  - Title, description
  - Skill type icon
  - Difficulty badge
  - Stats (questions, time limit, sections, average score)
  - Exercise type badge
  - Free badge

**API Used**:
- `GET /api/v1/exercises?skill_type=...&difficulty=...&page=1&limit=12`

---

### 2. Exercise Detail (`/exercises/[exerciseId]`)
**File**: `[exerciseId]/page.tsx`

**Features**:
- View exercise details
- Display badges (skill, difficulty, type, free)
- Show stats:
  - Total questions
  - Total sections
  - Time limit
  - Passing score
- Preview sections with:
  - Section number and title
  - Description
  - Question count
  - Time limit per section
  - Instructions
- **Start Exercise** button → creates submission and navigates to take page

**API Used**:
- `GET /api/v1/exercises/:id` - Get exercise with sections and questions
- `POST /api/v1/submissions` - Start exercise (create submission)

---

### 3. Take Exercise (`/exercises/[exerciseId]/take/[submissionId]`)
**File**: `take/[submissionId]/page.tsx`

**Features**:
- Display current question with:
  - Question number and text
  - Context text (if available)
  - Image (if available)
  - Answer input:
    - Multiple choice: Radio buttons with options
    - Text input: For fill-in-blank, etc.
  - Tips (if available)
- Header with:
  - Exercise title
  - Current question number
  - Timer (counts up)
  - Answered count badge
  - Progress bar
- Navigation:
  - Previous/Next buttons
  - Submit button on last question
- Question Navigator:
  - Grid of all questions
  - Click to jump to any question
  - Visual indicators:
    - Current question (primary color)
    - Answered questions (green)
    - Unanswered questions (gray)
- Auto-save answers to state
- Confirmation before submit

**API Used**:
- `GET /api/v1/exercises/:id` - Get questions
- `PUT /api/v1/submissions/:id/answers` - Submit all answers

---

### 4. View Result (`/exercises/[exerciseId]/result/[submissionId]`)
**File**: `result/[submissionId]/page.tsx`

**Features**:
- Result header with:
  - Success/Fail icon
  - Congratulations message
  - Score display (X/Y)
  - Progress bar
  - Percentage
  - IELTS Band Score (if available)
- Stats grid:
  - Correct answers (green)
  - Incorrect answers (red)
  - Skipped answers (gray)
  - Time spent (blue)
  - Accuracy percentage
  - Average time per question
- Answer Review:
  - All questions with user's answers
  - Correct/Incorrect badge
  - Show correct answer if wrong
  - Points earned
  - Time spent per question
  - Explanation (if available)
  - Tips (if available, shown for incorrect answers)
- Actions:
  - Back to Exercises
  - Try Again

**API Used**:
- `GET /api/v1/submissions/:id/result` - Get detailed result

---

### 5. My Submissions History (`/exercises/history`)
**File**: `history/page.tsx`

**Features**:
- Stats summary cards:
  - Total attempts
  - Completed count
  - In progress count
  - Average score
- List of all submissions with:
  - Exercise title
  - Status badge (completed, in_progress, abandoned)
  - Started date
  - Completed date (if completed)
  - Attempt number
  - Score/Progress
  - Percentage (if completed)
  - Band score (if available)
  - Time spent
  - View Results/Continue button
- Click card to view result or continue
- Pagination (20 per page)

**API Used**:
- `GET /api/v1/submissions/my?page=1&limit=20` - Get user's submissions

---

## 🔗 API Integration

All API calls are handled through `lib/api/exercises.ts`:

```typescript
import { exercisesApi } from '@/lib/api/exercises'

// Get exercises list
const { data, total, totalPages } = await exercisesApi.getExercises(filters, page, limit)

// Get exercise detail
const { exercise, sections } = await exercisesApi.getExerciseById(id)

// Start exercise
const submission = await exercisesApi.startExercise(exerciseId)

// Submit answers
await exercisesApi.submitAnswers(submissionId, answers)

// Get result
const result = await exercisesApi.getSubmissionResult(submissionId)

// Get my submissions
const { submissions, total } = await exercisesApi.getMySubmissions(page, limit)
```

---

## 📊 Data Flow

### Student Exercise Flow

```
1. Browse Exercises (/exercises/list)
   ↓
2. View Exercise Detail (/exercises/[id])
   ↓ Click "Start Exercise"
3. Create Submission (POST /submissions)
   ↓
4. Take Exercise (/exercises/[id]/take/[submissionId])
   ↓ Answer questions
5. Submit Answers (PUT /submissions/[id]/answers)
   ↓
6. View Result (/exercises/[id]/result/[submissionId])
   ↓
7. Try Again (back to step 2) OR Back to List
```

### View History Flow

```
1. My History (/exercises/history)
   ↓
2. Click submission card
   ↓
3a. If completed → View Result
3b. If in_progress → Continue (Take Exercise)
```

---

## 🎨 UI Components Used

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` - Layout
- `Button` - Actions
- `Badge` - Status, difficulty, skill type
- `Input` - Search, text answers
- `Select` - Filters
- `Progress` - Score percentage, progress bar
- `Loader2` - Loading states
- Icons from `lucide-react`

---

## 🔄 State Management

Each page manages its own state using React hooks:

- `useState` - Local state (data, loading, filters, etc.)
- `useEffect` - Data fetching on mount and dependency changes
- `useRouter` - Navigation
- `useParams` - Get route parameters

---

## ✅ Features Implemented

- [x] Exercise list with filters and pagination
- [x] Exercise detail with sections preview
- [x] Start exercise (create submission)
- [x] Take exercise with timer
- [x] Question navigation
- [x] Multiple choice questions
- [x] Text input questions
- [x] Submit answers
- [x] View detailed results
- [x] Answer review with explanations
- [x] My submissions history
- [x] Continue in-progress exercises
- [x] Responsive design
- [x] Loading states
- [x] Error handling

---

## 🚀 Next Steps

### Potential Enhancements

1. **Audio Support** (for Listening exercises)
   - Audio player component
   - Play/Pause controls
   - Timestamp tracking

2. **Save Progress**
   - Auto-save answers periodically
   - Resume from last question

3. **Review Mode**
   - Review answers before submit
   - Flag questions for review

4. **Analytics**
   - Performance charts
   - Progress over time
   - Weak areas identification

5. **Social Features**
   - Share results
   - Compare with friends
   - Leaderboard

---

## 📝 Notes

- All pages use `AppLayout` wrapper for consistent layout
- API responses follow `{ success: boolean, data: any }` structure
- All field names use `snake_case` to match backend
- TypeScript types defined in `types/index.ts`
- Error handling with try-catch and user-friendly messages
- Responsive design with Tailwind CSS

---

**Last Updated**: 2025-01-21


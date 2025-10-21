# 🐛 Bug Fixes - Exercise Frontend

## Bug #1: Select.Item empty value error

### Error Message
```
Uncaught Error: A <Select.Item /> must have a value prop that is not an empty string. 
This is because the Select value can be set to an empty string to clear the selection 
and show the placeholder.
```

### Location
- **File**: `Frontend-IELTSGo/app/exercises/list/page.tsx`
- **Lines**: 128, 145

### Root Cause
The `SelectItem` component from Shadcn/UI does not allow `value=""` (empty string) because it conflicts with the placeholder mechanism.

### Code Before (Broken)
```tsx
<SelectContent>
  <SelectItem value="">All Skills</SelectItem>  {/* ❌ Error */}
  <SelectItem value="listening">🎧 Listening</SelectItem>
  <SelectItem value="reading">📖 Reading</SelectItem>
</SelectContent>
```

### Code After (Fixed)
```tsx
<SelectContent>
  <SelectItem value="all">All Skills</SelectItem>  {/* ✅ Fixed */}
  <SelectItem value="listening">🎧 Listening</SelectItem>
  <SelectItem value="reading">📖 Reading</SelectItem>
</SelectContent>
```

### Changes Made

#### 1. Updated Select default values
```tsx
// Before
value={filters.skill?.[0] || ""}

// After
value={filters.skill?.[0] || "all"}
```

#### 2. Updated SelectItem values
```tsx
// Before
<SelectItem value="">All Skills</SelectItem>
<SelectItem value="">All Difficulties</SelectItem>

// After
<SelectItem value="all">All Skills</SelectItem>
<SelectItem value="all">All Difficulties</SelectItem>
```

#### 3. Updated filter handler
```tsx
// Before
const handleFilterChange = (key: keyof ExerciseFilters, value: string) => {
  setFilters((prev) => ({
    ...prev,
    [key]: value ? [value] : [],
  }))
  setPage(1)
}

// After
const handleFilterChange = (key: keyof ExerciseFilters, value: string) => {
  setFilters((prev) => ({
    ...prev,
    [key]: value && value !== "all" ? [value] : [],
  }))
  setPage(1)
}
```

### Testing
- [x] Skill filter dropdown opens without error
- [x] Selecting "All Skills" clears the filter
- [x] Selecting specific skill filters correctly
- [x] Difficulty filter dropdown opens without error
- [x] Selecting "All Difficulties" clears the filter
- [x] Selecting specific difficulty filters correctly
- [x] No console errors

### Status
✅ **FIXED**

---

## Bug #2: getExerciseResult is not a function

### Error Message
```
TypeError: exercisesApi.getExerciseResult is not a function
```

### Location
- **File**: `Frontend-IELTSGo/app/exercises/page.tsx`
- **Line**: 26

### Root Cause
The old `page.tsx` was calling a non-existent API method `getExerciseResult()`. The correct method is `getSubmissionResult()`.

### Solution
Converted the page to a redirect page that automatically navigates to `/exercises/list`.

### Code Before (Broken)
```tsx
export default function ExerciseResultsPage() {
  // ... lots of code
  const data = await exercisesApi.getExerciseResult(exerciseId, resultId)  // ❌ Error
  // ... more code
}
```

### Code After (Fixed)
```tsx
export default function ExercisesPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/exercises/list")
  }, [router])

  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </AppLayout>
  )
}
```

### Testing
- [x] Navigating to `/exercises` redirects to `/exercises/list`
- [x] No console errors
- [x] Loading spinner shows briefly during redirect

### Status
✅ **FIXED**

---

---

## Bug #3: NaN in children attribute

### Error Message
```
Received NaN for the `children` attribute. If this is expected, cast the value to a string.
```

### Location
- **File**: `Frontend-IELTSGo/app/exercises/[exerciseId]/page.tsx`
- **Lines**: 124, 262

### Root Cause
`exercise.time_limit_minutes` can be `null` or `undefined`, which causes `{exercise.time_limit_minutes} phút` to render as `NaN phút`.

### Code Before (Broken)
```tsx
<p className="font-medium">{exercise.time_limit_minutes} phút</p>
```

### Code After (Fixed)
```tsx
<p className="font-medium">
  {exercise.time_limit_minutes ? `${exercise.time_limit_minutes} phút` : 'Không giới hạn'}
</p>
```

### Testing
- [x] Shows time limit if available
- [x] Shows "Không giới hạn" if null/undefined
- [x] No NaN displayed
- [x] No console errors

### Status
✅ **FIXED**

---

## Bug #4: Missing key prop in list

### Error Message
```
Each child in a list should have a unique "key" prop.
```

### Location
- **File**: `Frontend-IELTSGo/app/exercises/[exerciseId]/page.tsx`
- **Line**: 177

### Root Cause
Although `key={section.id}` was present, the error occurred because `section.id` might be undefined in some cases.

### Code Before (Broken)
```tsx
{sections.map((section, index) => (
  <div key={section.id}>  {/* section.id might be undefined */}
```

### Code After (Fixed)
```tsx
{sections && sections.length > 0 ? (
  sections.map((section, index) => (
    <div key={section.id || `section-${index}`}>  {/* Fallback to index */}
```

### Additional Fixes
- Added null check for `sections`
- Added empty state message
- Added null check for `question_count`

### Testing
- [x] Sections render correctly
- [x] Each section has unique key
- [x] Empty state shows if no sections
- [x] No console errors

### Status
✅ **FIXED**

---

## Bug #5: Wrong redirect URL

### Error Message
No error, but wrong navigation path.

### Location
- **File**: `Frontend-IELTSGo/app/exercises/[exerciseId]/page.tsx`
- **Line**: 56

### Root Cause
After starting exercise, the page redirected to `/exercises/${exerciseId}/attempt/${submission.id}` but the actual page is at `/exercises/${exerciseId}/take/${submission.id}`.

### Code Before (Broken)
```tsx
router.push(`/exercises/${exerciseId}/attempt/${submission.id}`)
```

### Code After (Fixed)
```tsx
router.push(`/exercises/${exerciseId}/take/${submission.id}`)
```

### Testing
- [x] Clicking "Start Exercise" redirects correctly
- [x] Take exercise page loads
- [x] No 404 error

### Status
✅ **FIXED**

---

---

## Bug #6: Type mismatch - sections structure

### Error Message
```
Property 'section' does not exist on type 'ExerciseSectionWithDetails'.
```

### Location
- **File**: `Frontend-IELTSGo/app/exercises/[exerciseId]/page.tsx`
- **File**: `Frontend-IELTSGo/types/index.ts`

### Root Cause
Frontend expected `sections` to be a flat array of `ExerciseSectionWithDetails`, but backend returns nested structure `{section, questions}[]`.

### Backend Structure (Correct)
```go
type ExerciseDetailResponse struct {
    Exercise *Exercise              `json:"exercise"`
    Sections []SectionWithQuestions `json:"sections"`
}

type SectionWithQuestions struct {
    Section   *ExerciseSection      `json:"section"`
    Questions []QuestionWithOptions `json:"questions"`
}
```

### Frontend Structure (Before - Wrong)
```typescript
interface ExerciseDetailResponse {
  exercise: Exercise
  sections: ExerciseSectionWithDetails[]  // Flat structure
  stats?: ExerciseStats
}
```

### Frontend Structure (After - Fixed)
```typescript
interface ExerciseDetailResponse {
  exercise: Exercise
  sections: ExerciseSection[]  // Nested structure {section, questions}
  stats?: ExerciseStats
}
```

### Code Changes

#### 1. Updated type definition
```typescript
// types/index.ts
export interface ExerciseDetailResponse {
  exercise: Exercise
  sections: ExerciseSection[]  // Changed from ExerciseSectionWithDetails[]
  stats?: ExerciseStats
}
```

#### 2. Updated data access in page
```typescript
// Before
const totalQuestions = sections?.reduce((sum, section) => sum + section.question_count, 0)

// After
const totalQuestions = sections?.reduce((sum, sectionData) => {
  return sum + (sectionData.section?.total_questions || 0)
}, 0) || 0
```

#### 3. Updated section rendering
```typescript
// Before
sections.map((section, index) => (
  <div key={section.id}>
    <h4>{section.title}</h4>
    <span>{section.question_count} câu</span>
  </div>
))

// After
sections.map((sectionData, index) => {
  const section = sectionData.section
  const questionCount = sectionData.questions?.length || section?.total_questions || 0
  return (
    <div key={section?.id || `section-${index}`}>
      <h4>{section?.title}</h4>
      <span>{questionCount} câu</span>
    </div>
  )
})
```

### Testing
- [x] Exercise detail page loads without errors
- [x] Sections display correctly
- [x] Question count shows correctly
- [x] No TypeScript errors

### Status
✅ **FIXED**

---

## Bug #7: Stats not returned from backend

### Issue
Frontend expected `stats` object in `ExerciseDetailResponse`, but backend doesn't return it.

### Root Cause
Backend `ExerciseDetailResponse` only has `exercise` and `sections`, no `stats` field.

### Solution
Use stats directly from `exercise` object which has:
- `total_attempts`
- `average_score`
- `average_completion_time`

### Code Changes
```typescript
// Before
{stats && (
  <div>
    <span>Số lượt làm: {stats.total_attempts}</span>
    <span>Điểm TB: {stats.average_score}</span>
  </div>
)}

// After
{(exercise.total_attempts || exercise.average_score) && (
  <div>
    <span>Số lượt làm: {exercise.total_attempts}</span>
    <span>Điểm TB: {exercise.average_score}</span>
  </div>
)}
```

### Testing
- [x] Stats display correctly if available
- [x] No errors if stats are null/undefined
- [x] No unused variable warnings

### Status
✅ **FIXED**

---

## Bug #8: Incorrect max score display

### Issue
"Điểm tối đa" showed "0 câu" instead of actual points.

### Root Cause
Used `exercise.max_score` which might be null, and didn't add "điểm" suffix.

### Solution
Use `exercise.total_points` first, fallback to `max_score` or `totalQuestions`, and add "điểm" suffix.

### Code Changes
```typescript
// Before
<p className="font-medium">{exercise.max_score || totalQuestions}</p>

// After
<p className="font-medium">
  {exercise.total_points || exercise.max_score || totalQuestions} điểm
</p>
```

### Testing
- [x] Shows correct points value
- [x] Has "điểm" suffix
- [x] Fallback works correctly

### Status
✅ **FIXED**

---

## Summary

| Bug # | Description | Severity | Status | Fixed Date |
|-------|-------------|----------|--------|------------|
| 1 | Select.Item empty value error | High | ✅ Fixed | 2025-01-21 |
| 2 | getExerciseResult is not a function | High | ✅ Fixed | 2025-01-21 |
| 3 | NaN in children attribute | Medium | ✅ Fixed | 2025-01-21 |
| 4 | Missing key prop in list | Medium | ✅ Fixed | 2025-01-21 |
| 5 | Wrong redirect URL | Medium | ✅ Fixed | 2025-01-21 |
| 6 | Type mismatch - sections structure | High | ✅ Fixed | 2025-01-21 |
| 7 | Stats not returned from backend | Low | ✅ Fixed | 2025-01-21 |
| 8 | Incorrect max score display | Low | ✅ Fixed | 2025-01-21 |

**Total Bugs Fixed**: 8

**All Critical Bugs**: ✅ Resolved

---

## Prevention

### For Bug #1 (Select empty value)
**Rule**: Never use `value=""` in Shadcn/UI `SelectItem` components.

**Best Practice**:
```tsx
// ✅ Good
<SelectItem value="all">All Items</SelectItem>
<SelectItem value="none">None</SelectItem>

// ❌ Bad
<SelectItem value="">All Items</SelectItem>
```

### For Bug #2 (Non-existent API method)
**Rule**: Always check API client before calling methods.

**Best Practice**:
1. Review `lib/api/*.ts` files before using
2. Use TypeScript autocomplete
3. Check API documentation
4. Test API calls in isolation first

---

**Last Updated**: 2025-01-21


# 🧪 Exercise Module - Testing Guide

## 🚀 Quick Start

### 1. Start Backend Services
```bash
cd DATN
docker-compose up -d
```

### 2. Start Frontend
```bash
cd Frontend-IELTSGo
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

---

## 📋 Test Scenarios

### Scenario 1: Browse Exercises
**URL**: http://localhost:3000/exercises/list

**Steps**:
1. ✅ Page loads successfully
2. ✅ Exercise cards are displayed
3. ✅ Each card shows:
   - Title
   - Description
   - Skill type badge
   - Difficulty badge
   - Stats (questions, time, sections)
4. ✅ Pagination works (if > 12 exercises)

**Expected API Call**:
```
GET /api/v1/exercises?page=1&limit=12
```

---

### Scenario 2: Filter Exercises
**URL**: http://localhost:3000/exercises/list

**Steps**:
1. ✅ Select skill type filter (e.g., "Listening")
2. ✅ Results update automatically
3. ✅ Select difficulty filter (e.g., "Medium")
4. ✅ Results update again
5. ✅ Type in search box
6. ✅ Results filter by title

**Expected API Calls**:
```
GET /api/v1/exercises?skill_type=listening&page=1&limit=12
GET /api/v1/exercises?skill_type=listening&difficulty=medium&page=1&limit=12
GET /api/v1/exercises?skill_type=listening&difficulty=medium&search=test&page=1&limit=12
```

---

### Scenario 3: View Exercise Detail
**URL**: http://localhost:3000/exercises/[exerciseId]

**Steps**:
1. ✅ Click an exercise card from list
2. ✅ Detail page loads
3. ✅ Shows exercise info:
   - Title, description
   - Badges (skill, difficulty, type)
   - Stats (questions, sections, time, passing score)
4. ✅ Shows sections preview:
   - Section number and title
   - Description
   - Question count
   - Time limit
   - Instructions
5. ✅ "Start Exercise" button is visible

**Expected API Call**:
```
GET /api/v1/exercises/:id
```

---

### Scenario 4: Start Exercise
**URL**: http://localhost:3000/exercises/[exerciseId]

**Steps**:
1. ✅ Click "Start Exercise" button
2. ✅ Loading state shows
3. ✅ Redirects to take page
4. ✅ URL changes to `/exercises/[exerciseId]/take/[submissionId]`

**Expected API Call**:
```
POST /api/v1/submissions
Body: { "exercise_id": "..." }
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": "submission-uuid",
    "started_at": "2025-01-21T10:00:00Z"
  }
}
```

---

### Scenario 5: Take Exercise - Multiple Choice
**URL**: http://localhost:3000/exercises/[exerciseId]/take/[submissionId]

**Steps**:
1. ✅ Page loads with first question
2. ✅ Header shows:
   - Exercise title
   - Question number (e.g., "Question 1 of 40")
   - Timer (counting up)
   - Answered count badge
   - Progress bar
3. ✅ Question displays:
   - Question number
   - Question text
   - Context text (if available)
   - Image (if available)
   - Multiple choice options (radio buttons)
   - Tips (if available)
4. ✅ Select an option
5. ✅ Option is highlighted
6. ✅ Click "Next" button
7. ✅ Moves to next question
8. ✅ Previous answer is saved

**Expected API Call**:
```
GET /api/v1/exercises/:id
```

---

### Scenario 6: Take Exercise - Text Input
**URL**: http://localhost:3000/exercises/[exerciseId]/take/[submissionId]

**Steps**:
1. ✅ Navigate to a fill-in-blank question
2. ✅ Text input field is displayed
3. ✅ Type answer
4. ✅ Answer is saved
5. ✅ Click "Next"
6. ✅ Moves to next question

---

### Scenario 7: Question Navigator
**URL**: http://localhost:3000/exercises/[exerciseId]/take/[submissionId]

**Steps**:
1. ✅ Scroll down to Question Navigator
2. ✅ Grid of question numbers is displayed
3. ✅ Current question is highlighted (primary color)
4. ✅ Answered questions are green
5. ✅ Unanswered questions are gray
6. ✅ Click a question number
7. ✅ Jumps to that question

---

### Scenario 8: Submit Exercise
**URL**: http://localhost:3000/exercises/[exerciseId]/take/[submissionId]

**Steps**:
1. ✅ Answer all questions (or some)
2. ✅ Navigate to last question
3. ✅ "Submit Exercise" button appears
4. ✅ Click "Submit Exercise"
5. ✅ Confirmation dialog appears
6. ✅ Click "OK"
7. ✅ Loading state shows
8. ✅ Redirects to result page

**Expected API Call**:
```
PUT /api/v1/submissions/:id/answers
Body: {
  "answers": [
    {
      "question_id": "...",
      "selected_option_id": "...",
      "time_spent_seconds": 30
    },
    {
      "question_id": "...",
      "text_answer": "answer text",
      "time_spent_seconds": 45
    }
  ]
}
```

---

### Scenario 9: View Result
**URL**: http://localhost:3000/exercises/[exerciseId]/result/[submissionId]

**Steps**:
1. ✅ Result page loads
2. ✅ Header shows:
   - Success/Fail icon (green checkmark or red X)
   - Congratulations message
3. ✅ Score display shows:
   - Score (e.g., "35/40")
   - Progress bar
   - Percentage (e.g., "87.5%")
   - Band score (if available)
4. ✅ Stats grid shows:
   - Correct answers (green)
   - Incorrect answers (red)
   - Skipped answers (gray)
   - Time spent (blue)
5. ✅ Additional stats show:
   - Accuracy percentage
   - Average time per question
6. ✅ Answer review section shows:
   - All questions
   - User's answer
   - Correct/Incorrect badge
   - Correct answer (if wrong)
   - Points earned
   - Explanation (if available)
   - Tips (if available)
7. ✅ "Try Again" button works
8. ✅ "Back to Exercises" button works

**Expected API Call**:
```
GET /api/v1/submissions/:id/result
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "submission": { ... },
    "exercise": { ... },
    "answers": [ ... ],
    "performance": {
      "total_questions": 40,
      "correct_answers": 35,
      "incorrect_answers": 4,
      "skipped_answers": 1,
      "accuracy": 87.5,
      "score": 35,
      "percentage": 87.5,
      "band_score": 7.5,
      "is_passed": true,
      "time_spent_seconds": 1800,
      "average_time_per_question": 45
    }
  }
}
```

---

### Scenario 10: View Submission History
**URL**: http://localhost:3000/exercises/history

**Steps**:
1. ✅ Page loads
2. ✅ Stats summary cards show:
   - Total attempts
   - Completed count
   - In progress count
   - Average score
3. ✅ Submission list shows:
   - Exercise title
   - Status badge
   - Started date
   - Completed date (if completed)
   - Attempt number
   - Score/Progress
   - Percentage (if completed)
   - Band score (if available)
   - Time spent
4. ✅ Click a completed submission
5. ✅ Redirects to result page
6. ✅ Go back to history
7. ✅ Click an in-progress submission
8. ✅ Redirects to take page (continue)

**Expected API Call**:
```
GET /api/v1/submissions/my?page=1&limit=20
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Exercise not found"
**Cause**: Exercise ID doesn't exist in database

**Solution**: 
1. Check if exercises exist in database
2. Create sample exercises using admin panel or API

---

### Issue 2: "Failed to start exercise"
**Cause**: User not authenticated

**Solution**:
1. Make sure user is logged in
2. Check if token is valid
3. Check browser console for errors

---

### Issue 3: "Failed to submit answers"
**Cause**: Invalid submission ID or answers format

**Solution**:
1. Check submission ID in URL
2. Check browser console for error details
3. Verify answers format matches API expectation

---

### Issue 4: Empty exercise list
**Cause**: No exercises in database

**Solution**:
1. Create sample exercises using admin panel
2. Or use API to create exercises
3. Check database connection

---

## 📊 Test Data Requirements

### Minimum Test Data Needed:

1. **Users**:
   - At least 1 student account
   - At least 1 instructor account

2. **Exercises**:
   - At least 5 exercises
   - Different skill types (listening, reading)
   - Different difficulties (easy, medium, hard)
   - Different types (practice, mock_test)

3. **Sections**:
   - Each exercise should have 1-3 sections

4. **Questions**:
   - Each section should have 5-10 questions
   - Mix of multiple choice and text input
   - Some with images
   - Some with context text
   - All with explanations and tips

---

## ✅ Acceptance Criteria

### Functionality
- [ ] All pages load without errors
- [ ] All API calls succeed
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Navigation works (Previous/Next)
- [ ] Question navigator works
- [ ] Answers are saved
- [ ] Submit works
- [ ] Results display correctly
- [ ] History displays correctly

### UI/UX
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] Loading states show
- [ ] Error messages are user-friendly
- [ ] Empty states are handled
- [ ] Colors are consistent
- [ ] Icons are appropriate
- [ ] Typography is readable

### Performance
- [ ] Pages load in < 2 seconds
- [ ] No console errors
- [ ] No console warnings
- [ ] Images load properly
- [ ] Smooth transitions

---

## 🔍 Debugging Tips

### 1. Check Browser Console
```javascript
// Look for errors
console.error()

// Check API calls
// Look for [API Request] and [API Response] logs
```

### 2. Check Network Tab
- Look for failed requests (red)
- Check request/response payloads
- Verify status codes (200, 201, 400, 401, 404, 500)

### 3. Check Backend Logs
```bash
docker-compose logs -f exercise-service
```

### 4. Check Database
```bash
docker exec -it postgres psql -U postgres -d ielts_db
```

```sql
-- Check exercises
SELECT id, title, skill_type, difficulty FROM exercises LIMIT 10;

-- Check submissions
SELECT id, user_id, exercise_id, status, score FROM submissions LIMIT 10;

-- Check answers
SELECT id, attempt_id, question_id, is_correct FROM submission_answers LIMIT 10;
```

---

**Happy Testing! 🎉**


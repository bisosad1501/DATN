# Exercise Service - Business Logic Issues

**Date**: October 13, 2025
**Analyst**: AI Assistant
**Status**: Analysis Complete

## 📋 Executive Summary

Based on comprehensive code review of Exercise Service, the following critical business logic issues have been identified:

## 🔴 CRITICAL ISSUES

### ISSUE #12 (HIGH): Race Condition in SaveSubmissionAnswers
**Location**: `services/exercise-service/internal/repository/exercise_repository.go:352-445`

**Problem**:
Multiple answer submissions for the same question can create duplicate records in `user_answers` table. The current logic has NO unique constraint or conflict handling:

```go
// Save user answer - NO CONFLICT HANDLING!
_, err = tx.Exec(`
    INSERT INTO user_answers (
        id, attempt_id, question_id, user_id, answer_text, selected_option_id,
        is_correct, points_earned, time_spent_seconds, answered_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`, uuid.New(), submissionID, answer.QuestionID, userID, answer.TextAnswer,
    answer.SelectedOptionID, isCorrect, pointsEarned, answer.TimeSpentSeconds,
    time.Now())
```

**Impact**:
- User can submit same question multiple times
- Duplicate answers inflate score calculation
- `CompleteSubmission` will COUNT duplicate answers → incorrect score
- User could cheat by submitting correct answer multiple times

**Example Scenario**:
```
1. User submits answer to Question 1: Answer A (incorrect)
2. User submits answer to Question 1: Answer B (correct)
3. Both records exist in user_answers
4. CompleteSubmission calculates: 2 questions answered, 1 correct
5. But only 1 question exists! Score calculation is wrong
```

**Solution Needed**:
- Add UPSERT with `ON CONFLICT (attempt_id, question_id) DO UPDATE`
- Or add unique constraint and handle error
- Or check existing answer before insert

---

### ISSUE #13 (HIGH): Duplicate Submission Race Condition
**Location**: `services/exercise-service/internal/repository/exercise_repository.go:291-341`

**Problem**:
`CreateSubmission` has a check-then-insert race condition:

```go
// Calculate attempt number
var attemptNumber int
err = r.db.QueryRow(`
    SELECT COALESCE(MAX(attempt_number), 0) + 1
    FROM user_exercise_attempts
    WHERE user_id = $1 AND exercise_id = $2
`, userID, exerciseID).Scan(&attemptNumber)

// Race condition window here!

submission := &models.Submission{
    AttemptNumber: attemptNumber,
    // ...
}

_, err = r.db.Exec(`
    INSERT INTO user_exercise_attempts (...)
    VALUES (...)
`, ...)
```

**Impact**:
- Multiple concurrent "Start Exercise" requests can get same `attempt_number`
- This violates business logic (attempt numbers should be sequential)
- Can confuse users seeing multiple "Attempt 2" in their history

**Example Scenario**:
```
Thread 1: SELECT MAX(attempt_number) → Gets 1, calculates 2
Thread 2: SELECT MAX(attempt_number) → Gets 1, calculates 2
Thread 1: INSERT attempt_number = 2
Thread 2: INSERT attempt_number = 2
Result: Two submissions with attempt_number = 2!
```

**Solution Needed**:
- Use database sequence or serial column
- Or use transaction with SELECT FOR UPDATE
- Or use COALESCE in INSERT query itself

---

### ISSUE #14 (MEDIUM): Exercise Statistics Race Condition
**Location**: `services/exercise-service/internal/repository/exercise_repository.go:543-547`

**Problem**:
Incrementing `total_attempts` without atomic operation:

```go
// Update exercise statistics
_, err = tx.Exec(`
    UPDATE exercises SET
        total_attempts = total_attempts + 1,
        updated_at = $1
    WHERE id = $2
`, time.Now(), exerciseID)
```

**Analysis**:
This is actually CORRECT! It uses `total_attempts = total_attempts + 1` which is atomic.

**Status**: ✅ NOT AN ISSUE - Already using atomic increment

---

### ISSUE #15 (MEDIUM): Service Integration Without Retry
**Location**: `services/exercise-service/internal/service/exercise_service.go:237-300`

**Problem**:
Similar to Course Service, all service-to-service calls have NO retry mechanism:

```go
// 1. Update skill statistics
err = s.userServiceClient.UpdateSkillStatistics(...)
if err != nil {
    log.Printf("[Exercise-Service] ERROR: Failed to update skill stats: %v", err)
    // NO RETRY!
}

// 2. Update user progress
err = s.userServiceClient.UpdateProgress(...)
if err != nil {
    log.Printf("[Exercise-Service] ERROR: Failed to update user progress: %v", err)
    // NO RETRY!
}

// 3. Send notification
err = s.notificationClient.SendExerciseResultNotification(...)
if err != nil {
    log.Printf("[Exercise-Service] ERROR: Failed to send notification: %v", err)
    // NO RETRY!
}
```

**Impact**:
- Network hiccup → User stats not updated
- User completes exercise but progress stays 0
- Notification not sent, user doesn't know result

**Solution Needed**:
- Add retry mechanism with exponential backoff
- Same as Course Service fix

---

### ISSUE #16 (LOW): Time Calculation Logic Gap
**Location**: `services/exercise-service/internal/repository/exercise_repository.go:528-533`

**Problem**:
Time spent calculation has fallback logic that might be confusing:

```go
// Calculate time spent (seconds since started)
timeSpent := int(time.Since(startedAt).Seconds())
if totalTimeSpent > 0 {
    timeSpent = totalTimeSpent  // Use SUM from user_answers
}
```

**Analysis**:
- If user doesn't provide `time_spent_seconds` for any answer → uses time since start
- If user provides time for at least 1 answer → uses SUM of all answer times
- This mixing can cause inconsistent time tracking

**Impact**: LOW - Time tracking might be inaccurate but doesn't affect scores

**Recommendation**: 
- Always use time since start as primary
- Use SUM of answer times only if it makes sense (e.g., timed questions)

---

### ISSUE #17 (LOW): Score Calculation Doesn't Match Passing Score
**Location**: `services/exercise-service/internal/repository/exercise_repository.go:489-503`

**Problem**:
Code retrieves `passing_score` from exercise but **NEVER USES IT**:

```go
// Get total points and passing score from exercise
var totalPoints float64
var passingScore float64  // ← Retrieved but never used!
err = tx.QueryRow(`
    SELECT COALESCE(total_points, 0), COALESCE(passing_score, 0)
    FROM exercises 
    WHERE id = $1
`, exerciseID).Scan(&totalPoints, &passingScore)

// ... later ...

// Calculate score
score := totalPointsEarned  // ← Just uses points earned

// NO CHECK against passing_score!
// NO "passed" or "failed" status set!
```

**Impact**:
- Exercise has `passing_score` field but it's not enforced
- No pass/fail determination
- Users don't know if they passed or failed
- `status` is always set to "completed" regardless of score

**Solution Needed**:
```go
// Determine if passed
isPassed := (score >= passingScore) || (passingScore == 0)  // Allow 0 = no passing requirement

// Set status based on result
status := "completed"
if !isPassed {
    status = "failed"  // Or keep "completed" but add "result" field
}
```

---

### ISSUE #18 (HIGH): Concurrent CompleteSubmission Calls
**Location**: `services/exercise-service/internal/service/exercise_service.go:49-73`

**Problem**:
`SubmitAnswers` calls `CompleteSubmission` immediately after saving answers, but there's no guard against multiple calls:

```go
func (s *ExerciseService) SubmitAnswers(submissionID uuid.UUID, answers []models.SubmitAnswerItem) error {
    // Save and grade answers
    err := s.repo.SaveSubmissionAnswers(submissionID, answers)
    if err != nil {
        return err
    }

    // Complete submission - NO CHECK if already completed!
    err = s.repo.CompleteSubmission(submissionID)
    if err != nil {
        return err
    }
    
    // ...
}
```

**Impact**:
- If user submits answers multiple times (clicking Submit button multiple times)
- `CompleteSubmission` runs multiple times
- Exercise statistics incremented multiple times: `total_attempts = total_attempts + 1`
- User Service gets duplicate progress updates
- User gets duplicate notifications

**Example Scenario**:
```
1. User submits answers, Submit button clicked
2. API call 1 starts: SaveAnswers → CompleteSubmission (exercise.total_attempts = 1)
3. User clicks Submit again (button not disabled)
4. API call 2 starts: SaveAnswers → CompleteSubmission (exercise.total_attempts = 2)
5. Result: Exercise shows 2 attempts but user only did 1!
```

**Solution Needed**:
```go
// Check if already completed
var status string
err = r.db.QueryRow(`
    SELECT status FROM user_exercise_attempts WHERE id = $1
`, submissionID).Scan(&status)

if status == "completed" {
    return nil  // Already completed, skip
}
```

---

## 📊 ISSUE SUMMARY

| Issue # | Severity | Category | Issue |
|---------|----------|----------|-------|
| #12 | 🔴 HIGH | Data Integrity | Race condition in SaveSubmissionAnswers - duplicate answers possible |
| #13 | 🔴 HIGH | Data Integrity | Duplicate submission race condition - attempt numbers can collide |
| #14 | ✅ OK | Data Integrity | Exercise statistics uses atomic increment (correct) |
| #15 | 🟡 MEDIUM | Integration | Service integration without retry mechanism |
| #16 | 🟢 LOW | Accuracy | Time calculation inconsistent logic |
| #17 | 🟢 LOW | Business Logic | Passing score not enforced, no pass/fail determination |
| #18 | 🔴 HIGH | Data Integrity | Concurrent CompleteSubmission calls inflate statistics |

**Total Issues**: 6 (3 HIGH, 1 MEDIUM, 2 LOW)
**Already Correct**: 1 (atomic increment)

---

## 🎯 RECOMMENDED FIX PRIORITY

### Priority 1 (Critical - Fix Immediately)
1. **ISSUE #12**: Add UPSERT for answer submissions
2. **ISSUE #18**: Guard against duplicate completion
3. **ISSUE #13**: Fix attempt number race condition

### Priority 2 (Important - Fix Soon)
4. **ISSUE #15**: Add retry mechanism for service integration

### Priority 3 (Nice to Have - Fix When Possible)
5. **ISSUE #17**: Enforce passing score and set pass/fail status
6. **ISSUE #16**: Standardize time calculation logic

---

## 📝 NEXT STEPS

1. ✅ Document all issues (DONE - this document)
2. ⏳ Implement fixes for Priority 1 issues
3. ⏳ Create comprehensive test suite
4. ⏳ Verify all fixes work correctly
5. ⏳ Update Exercise Service documentation


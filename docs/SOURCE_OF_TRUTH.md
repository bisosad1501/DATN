# 📊 SOURCE OF TRUTH - Data Architecture

## Overview
Tài liệu này định nghĩa **nguồn dữ liệu chính thống (Source of Truth)** cho các metrics quan trọng trong hệ thống.

---

## 🎯 Study Time (Thời gian học)

### 1. Total Study Time (Toàn bộ - Lessons + Exercises)

**SOURCE OF TRUTH:** `study_sessions` table (user_db)

```sql
SELECT SUM(duration_minutes) 
FROM study_sessions 
WHERE user_id = ?
```

**Được dùng bởi:**
- Dashboard (`/dashboard`)
- User Progress API (`/api/v1/user/progress`)
- Leaderboard

**Implementation:**
- Backend: `user-service/internal/repository/user_repository.go::GetLearningProgress()`
- Frontend: `progressApi.getProgressSummary()`

---

### 2. Course Study Time (Chỉ Lessons)

**SOURCE OF TRUTH:** `lesson_progress.last_position_seconds` (course_db)

```sql
SELECT SUM(ROUND(last_position_seconds / 60.0)) as total_minutes
FROM lesson_progress lp
JOIN lessons l ON l.id = lp.lesson_id
JOIN modules m ON m.id = l.module_id
WHERE lp.user_id = ? AND m.course_id = ?
```

**Được dùng bởi:**
- My Courses (`/my-courses`)
- Course Enrollment API (`/api/v1/enrollments/my`)

**Implementation:**
- Backend: `course-service/internal/repository/course_repository.go::GetUserEnrollments()`
- Frontend: `enrollment.total_time_spent_minutes`

**Lý do:** Real-time từ watch position, không phụ thuộc vào session recording threshold

---

## 📈 Course Progress (Tiến độ khóa học)

**SOURCE OF TRUTH:** `lesson_progress` table (course_db)

```sql
-- Progress = AVG of ALL lessons (including not started = 0%)
SELECT ROUND(SUM(COALESCE(progress_percentage, 0)) / total_lessons, 2) as progress
FROM lesson_progress
```

**Calculated from:** `last_position_seconds / video_total_seconds * 100`

**Được dùng bởi:**
- Course List
- Course Detail
- My Courses
- Dashboard (course stats)

---

## ❌ REMOVED FIELDS (Đã xóa)

### 1. `learning_progress.total_study_hours` (user_db)
- **Vấn đề:** Static field, không sync real-time
- **Thay thế:** Calculate từ `study_sessions` (real-time)
- **Status:** ✅ REMOVED (Migration 013)

### 2. `lesson_progress.time_spent_minutes` (course_db)
- **Vấn đề:** Incremental update, không chính xác (do accumulated time reset on page refresh)
- **Thay thế:** Calculate từ `last_position_seconds`
- **Status:** ✅ REMOVED (Migration 013)

### 3. `lesson_progress.video_watch_percentage` (course_db)
- **Vấn đề:** Redundant với `progress_percentage`
- **Status:** ✅ REMOVED (Migration 011)

---

## ✅ BEST PRACTICES

### 1. Luôn dùng Real-time Calculation
```go
// ✅ GOOD: Real-time từ study_sessions
SELECT SUM(duration_minutes) FROM study_sessions WHERE user_id = ?

// ❌ BAD: Static field
SELECT total_study_hours FROM learning_progress WHERE user_id = ?
```

### 2. Không update Static Fields
```go
// ❌ BAD: Incremental update
UPDATE learning_progress SET total_study_hours = total_study_hours + ?

// ✅ GOOD: Calculate on-demand
SELECT ROUND(SUM(duration_minutes) / 60.0, 2) FROM study_sessions
```

### 3. Document Source of Truth
```go
// 📊 SOURCE OF TRUTH: study_sessions table
// This ensures real-time accuracy and consistency
```

---

## 🔍 Testing Consistency

Để verify consistency giữa các sources:

```sql
-- User DB (should match)
SELECT 
  SUM(duration_minutes) as study_sessions_total,
  (SELECT total_study_hours * 60 FROM learning_progress WHERE user_id = ?) as learning_progress_total
FROM study_sessions 
WHERE user_id = ?;

-- Course DB (lessons only)
SELECT 
  SUM(time_spent_minutes) as time_spent_total,
  SUM(ROUND(last_position_seconds / 60.0)) as last_position_total
FROM lesson_progress
WHERE user_id = ?;
```

**Expected:**
- `study_sessions_total` = accurate (all activities)
- `learning_progress_total` = outdated (deprecated)
- `last_position_total` = accurate (lessons only)

---

## 📝 Migration History

### Migration 011 (Completed)
- ✅ Removed `video_watch_percentage` column
- ✅ Migrated to single `progress_percentage`

### Migration 013 (Completed)
- ✅ Removed `learning_progress.total_study_hours` column
- ✅ Removed `lesson_progress.time_spent_minutes` column
- ✅ All queries now use real-time calculations
- ✅ Single source of truth for all study time metrics

---

## 👥 Team Notes

Khi thêm features mới:
1. **KHÔNG** tạo thêm static fields cho metrics
2. **LUÔN** calculate real-time từ source tables
3. **DOCUMENT** rõ ràng source of truth trong code comments
4. **TEST** consistency giữa các endpoints

Khi gặp discrepancy:
1. Check source of truth đầu tiên
2. Verify query logic
3. Đừng tin static fields (deprecated)


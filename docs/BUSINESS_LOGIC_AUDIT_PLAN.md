# Business Logic Audit Plan

**Ngày**: 2025-01-11  
**Mục đích**: Kiểm tra toàn bộ logic nghiệp vụ và mối liên hệ giữa các services

---

## 🎯 MỤC TIÊU KIỂM TRA

### 1. Logic Nghiệp Vụ (Business Logic)
- ✅ Đúng đắn (Correctness)
- ✅ Nhất quán (Consistency)
- ✅ Đầy đủ (Completeness)
- ✅ Xử lý edge cases

### 2. Tích Hợp Services (Service Integration)
- ✅ Data flow giữa services
- ✅ Transaction consistency
- ✅ Error propagation
- ✅ Retry & fallback mechanisms

### 3. Data Integrity
- ✅ Database constraints
- ✅ Foreign key relationships
- ✅ Data validation
- ✅ Orphaned records

---

## 📋 KẾ HOẠCH KIỂM TRA

### PHASE 1: Auth & User Services
**Thời gian**: 30 phút

#### 1.1 Auth Service
- [ ] User Registration Flow
  - Email validation
  - Password hashing
  - Role assignment
  - Token generation
  - Redis session
  
- [ ] Login Flow
  - Credential verification
  - Failed login attempts
  - Account lockout
  - Token refresh
  
- [ ] Password Reset Flow
  - Reset code generation
  - Code expiration
  - Email sending
  
- [ ] Email Verification Flow
  - Verification code
  - Account activation
  
- [ ] Google OAuth Flow
  - OAuth token exchange
  - User creation/matching

#### 1.2 User Service
- [ ] Profile Management
  - Profile creation (from Auth)
  - Profile updates
  - Avatar upload
  
- [ ] Learning Progress
  - Progress initialization
  - Progress updates (from Course/Exercise)
  - Statistics calculation
  
- [ ] Skill Statistics
  - Per-skill tracking
  - Average score calculation
  - Best score tracking
  
- [ ] Goals & Achievements
  - Goal setting
  - Achievement unlock
  - Streak tracking

#### 1.3 Integration: Auth ↔ User
- [ ] Registration triggers profile creation
- [ ] User ID consistency across services
- [ ] Data synchronization
- [ ] Error handling when User Service fails

---

### PHASE 2: Course Service
**Thời gian**: 30 phút

#### 2.1 Course Management
- [ ] Course CRUD operations
- [ ] Module & Lesson creation
- [ ] Video & Material attachment
- [ ] Course publishing
- [ ] Ownership validation

#### 2.2 Enrollment Flow
- [ ] Enrollment creation
- [ ] Duplicate enrollment prevention
- [ ] Enrollment status tracking
- [ ] Progress initialization

#### 2.3 Lesson Progress
- [ ] Lesson completion tracking
- [ ] Video watch progress
- [ ] Material download tracking
- [ ] Progress percentage calculation

#### 2.4 Integration: Course → User/Notification
- [ ] Lesson completion updates user progress
- [ ] Lesson completion sends notification
- [ ] Course enrollment triggers notification
- [ ] Progress percentage accuracy

---

### PHASE 3: Exercise Service
**Thời gian**: 30 phút

#### 3.1 Exercise Management
- [ ] Exercise CRUD operations
- [ ] Section & Question creation
- [ ] Question types (MCQ, Fill-in-blank, etc.)
- [ ] Answer validation
- [ ] Publishing flow

#### 3.2 Submission Flow
- [ ] Exercise start (create submission)
- [ ] Answer submission
- [ ] Auto-grading logic
- [ ] Score calculation
- [ ] Submission status tracking

#### 3.3 Grading Logic
- [ ] Multiple choice grading
- [ ] Fill-in-blank grading (case insensitive)
- [ ] Alternative answers
- [ ] Partial scoring
- [ ] Pass/Fail determination

#### 3.4 Integration: Exercise → User/Notification
- [ ] Exercise completion updates skill stats
- [ ] Exercise completion updates overall progress
- [ ] Exercise result notification
- [ ] Score = 0 edge case (skip stats update)

---

### PHASE 4: Notification Service
**Thời gian**: 20 phút

#### 4.1 Notification Creation
- [ ] Notification types validation
- [ ] Category validation
- [ ] User targeting
- [ ] Bulk notifications

#### 4.2 Notification Delivery
- [ ] Push notification (future)
- [ ] Email notification (future)
- [ ] In-app notification
- [ ] Scheduled notifications

#### 4.3 Notification Management
- [ ] Mark as read
- [ ] Unread count
- [ ] Notification preferences
- [ ] Expiration handling

#### 4.4 Integration: Internal Endpoints
- [ ] Auth → Welcome notification
- [ ] Course → Lesson completion notification
- [ ] Exercise → Result notification
- [ ] Achievement → Achievement notification

---

### PHASE 5: Cross-Service Integration
**Thời gian**: 30 phút

#### 5.1 End-to-End Flows
- [ ] **Flow 1**: Registration → Profile → Welcome Notification
  ```
  Auth Service (register)
    → User Service (create profile)
    → Notification Service (welcome)
  ```

- [ ] **Flow 2**: Enroll → Learn → Complete Lesson → Update Progress
  ```
  Course Service (enroll)
    → Course Service (complete lesson)
    → User Service (update progress)
    → Notification Service (lesson complete)
  ```

- [ ] **Flow 3**: Start Exercise → Submit → Grade → Update Stats
  ```
  Exercise Service (start)
    → Exercise Service (submit & grade)
    → User Service (update skill stats + progress)
    → Notification Service (result)
  ```

#### 5.2 Data Consistency
- [ ] User IDs match across all databases
- [ ] Progress numbers are accurate
- [ ] No orphaned records
- [ ] Timestamps are consistent

#### 5.3 Error Scenarios
- [ ] What if User Service is down during registration?
- [ ] What if Notification Service fails?
- [ ] What if grading takes too long?
- [ ] Retry mechanisms work?

#### 5.4 Performance
- [ ] Response times acceptable (<2s)
- [ ] Database query optimization
- [ ] N+1 query problems
- [ ] Connection pooling effective

---

## 🔍 KIỂM TRA LOGIC NGHIỆP VỤ CỤ THỂ

### 1. Enrollment Logic
```
GIVEN: User A, Course B (published)
WHEN: User A enrolls in Course B
THEN:
  - Enrollment record created with status "active"
  - Progress initialized at 0%
  - Enrollment notification sent
  - Cannot enroll twice in same course
```

### 2. Lesson Completion Logic
```
GIVEN: User A enrolled in Course B, Lesson L
WHEN: User A completes Lesson L
THEN:
  - Lesson progress marked complete
  - User overall progress += 1 lesson
  - Course progress percentage updated
  - Study hours accumulated
  - Lesson completion notification sent
  - If all lessons complete → Course completion notification
```

### 3. Exercise Grading Logic
```
GIVEN: Exercise E with 10 questions, each worth 1 point
WHEN: User submits 7 correct, 3 incorrect
THEN:
  - Score = 7/10 = 70%
  - If passing_score = 60% → Status = "passed"
  - Skill statistics updated (if score > 0)
  - User progress += 1 exercise
  - Result notification sent
```

### 4. Skill Statistics Update
```
GIVEN: User has listening skill stats (avg=5.0, best=6.5)
WHEN: User completes listening exercise with score=7.0
THEN:
  - total_exercises_completed += 1
  - average_score = (5.0 + 7.0) / 2 = 6.0
  - best_score = max(6.5, 7.0) = 7.0
  - last_practice_at = now()
```

### 5. Achievement Unlock Logic
```
GIVEN: User completes 10 exercises (achievement threshold)
WHEN: User completes 10th exercise
THEN:
  - Achievement "First 10 Exercises" unlocked
  - Achievement notification sent
  - User achievement list updated
```

---

## 🧪 TEST SCENARIOS

### Scenario 1: New User Journey
```
1. Register → ✅ Account created, profile initialized
2. Verify email → ✅ Account activated
3. Login → ✅ Token received
4. Enroll in course → ✅ Enrollment created
5. Complete lesson → ✅ Progress updated, notification sent
6. Start exercise → ✅ Submission created
7. Submit answers → ✅ Graded, stats updated, notification sent
```

### Scenario 2: Edge Cases
```
1. Register with duplicate email → ❌ Error
2. Enroll in same course twice → ❌ Error
3. Submit exercise without starting → ❌ Error
4. Complete non-existent lesson → ❌ Error
5. Update progress for non-enrolled course → ❌ Error
```

### Scenario 3: Concurrent Operations
```
1. User completes 2 lessons simultaneously → Both update progress
2. User submits 2 exercises at same time → Both update stats
3. Multiple users enroll in same course → No conflicts
```

---

## 📊 METRICS TO CHECK

### Database Metrics
- [ ] User count matches across auth_db and user_db
- [ ] Enrollment count matches lesson progress records
- [ ] Exercise submission count matches attempt records
- [ ] Notification count matches user actions

### Business Metrics
- [ ] Average lesson completion time
- [ ] Exercise pass rate
- [ ] User engagement (active users)
- [ ] Notification open rate

---

## 🚨 RED FLAGS TO WATCH

1. **Data Inconsistency**
   - User exists in auth_db but not in user_db
   - Progress shows completed but no enrollment
   - Skills stats don't match submission history

2. **Logic Errors**
   - Progress percentage > 100%
   - Negative scores or times
   - Invalid status transitions
   - Duplicate enrollments

3. **Integration Issues**
   - Service calls fail silently
   - Data not synchronized
   - Orphaned records
   - Race conditions

---

## 📝 DELIVERABLES

1. **Business Logic Audit Report**
   - All flows validated
   - Issues found and severity
   - Recommendations

2. **Integration Test Report**
   - Service communication verified
   - Data consistency checked
   - Performance benchmarks

3. **Fix Recommendations**
   - Critical issues to fix
   - Enhancement opportunities
   - Technical debt items

---

**Prepared by**: GitHub Copilot  
**Start Time**: Now  
**Estimated Duration**: 2.5 hours

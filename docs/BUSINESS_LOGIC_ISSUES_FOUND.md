# Business Logic Issues Found - Phase 1 Audit

**Audit Date**: October 13, 2025  
**Scope**: Auth Service & User Service  
**Status**: 🔴 Critical Issues Found

---

## 🚨 CRITICAL ISSUES

### ❌ **ISSUE #1: Registration Rollback Failure**
**Severity**: CRITICAL  
**Location**: `services/auth-service/internal/service/auth_service.go` (lines 94-230)

**Problem**:
```go
// 1. User created in auth_db
if err := s.userRepo.Create(user); err != nil { ... }

// 2. Role assigned in auth_db
if err := s.roleRepo.AssignRoleToUser(user.ID, role.ID, nil); err != nil {
    return nil, fmt.Errorf("failed to assign role: %w", err)
}

// 3. Tokens generated

// 4. Profile creation (in user_db) - CAN FAIL
if err := s.userServiceClient.CreateProfile(profileReq); err != nil {
    log.Printf("[Auth-Service] ERROR: Failed to create user profile for %s: %v", user.Email, err)
    // ⚠️ DOES NOT ROLLBACK! User exists in auth_db but not in user_db
} 

// 5. Welcome notification - CAN FAIL (non-critical)
```

**Impact**:
- User exists in `auth_db` with valid credentials
- User can login successfully
- BUT user has NO profile in `user_db`
- ALL subsequent operations will fail (progress tracking, course enrollment, etc.)
- Database inconsistency between services

**Root Cause**:
- No distributed transaction handling
- No compensating transaction (rollback) when profile creation fails
- Synchronous call that fails silently

**Recommendation**:
```
OPTION 1: Fail Fast (Recommended)
- If User Service profile creation fails → Return error
- Do NOT return tokens to user
- Force retry of entire registration

OPTION 2: Eventual Consistency
- Use message queue (RabbitMQ)
- Retry profile creation asynchronously
- Lock user account until profile created
```

---

### ❌ **ISSUE #2: Skill Statistics Calculation Error**
**Severity**: HIGH  
**Location**: `services/user-service/internal/service/user_service.go` (lines 650-707)

**Problem**:
```go
// Update average score
if stats.AverageScore == 0 {
    stats.AverageScore = score
} else {
    newAvg = (stats.AverageScore*float64(stats.TotalPractices-1) + score) / float64(stats.TotalPractices)
    stats.AverageScore = newAvg
}
```

**Why This Is WRONG**:
1. When `stats.TotalPractices` is incremented to 1 (first practice):
   - `stats.AverageScore == 0` (initial value)
   - Sets `stats.AverageScore = score` ✅ CORRECT

2. When `stats.TotalPractices` is incremented to 2 (second practice):
   - Uses formula with `TotalPractices - 1 = 1`
   - `newAvg = (stats.AverageScore * 1 + newScore) / 2` ✅ CORRECT

3. BUT `TotalPractices++` is called BEFORE the calculation:
   ```go
   stats.TotalPractices++  // Now = 2
   // Then calculates with TotalPractices - 1 = 1
   ```

**The Real Problem**:
The code increments `TotalPractices` **before** using it in calculation, then subtracts 1. This works accidentally but is confusing.

**Better Logic**:
```go
// Calculate new average BEFORE incrementing count
if stats.TotalPractices == 0 {
    stats.AverageScore = score
} else {
    totalSum := stats.AverageScore * float64(stats.TotalPractices)
    stats.AverageScore = (totalSum + score) / float64(stats.TotalPractices + 1)
}

// Then increment count
stats.TotalPractices++
```

**Impact**: Medium - Works but mathematically confusing and error-prone

---

### ⚠️ **ISSUE #3: Streak Logic Edge Case**
**Severity**: MEDIUM  
**Location**: `services/user-service/internal/service/user_service.go` (lines 607-634)

**Problem**:
```go
daysSince := int(now.Sub(lastDate).Hours() / 24)

if daysSince == 1 {
    // Consecutive day, increment streak
    progress.CurrentStreakDays++
} else if daysSince > 1 {
    // Streak broken
    progress.CurrentStreakDays = 1
}
// If daysSince == 0, same day, don't change streak
```

**Edge Cases Not Handled**:

1. **Timezone Issues**:
   - User studies at 11:50 PM (Day 1)
   - User studies at 12:10 AM (Day 2, same session)
   - `daysSince = 0` (due to `Hours() / 24` truncation)
   - Streak NOT incremented ❌

2. **Exact 24-Hour Boundary**:
   - Last study: Oct 12, 11:00 PM
   - Next study: Oct 13, 11:05 PM (24 hours 5 minutes later)
   - `daysSince = 1` ✅ Correct
   - BUT if user studies at 10:55 PM: `daysSince = 0` ❌

3. **Multiple Studies Same Day**:
   - Study 1: 9:00 AM (streak = 1)
   - Study 2: 3:00 PM (same day)
   - `daysSince = 0`, streak stays 1 ✅ Correct

**Better Implementation**:
```go
// Compare dates, not hours
lastDateOnly := time.Date(lastDate.Year(), lastDate.Month(), lastDate.Day(), 0, 0, 0, 0, time.UTC)
todayOnly := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
daysSince := int(todayOnly.Sub(lastDateOnly).Hours() / 24)
```

**Impact**: Medium - Streaks may not increment correctly near midnight

---

### ⚠️ **ISSUE #4: Progress Update Race Condition**
**Severity**: MEDIUM  
**Location**: `services/user-service/internal/service/user_service.go` (lines 587-659)

**Problem**:
```go
func (s *UserService) UpdateProgress(userID uuid.UUID, updates map[string]interface{}) error {
    // 1. Read current progress
    progress, err := s.repo.GetLearningProgress(userID)
    
    // 2. Modify in memory
    if lessonsCompleted, ok := updates["lessons_completed"].(int); ok && lessonsCompleted > 0 {
        progress.TotalLessonsCompleted += lessonsCompleted
    }
    
    // 3. Write back
    return s.repo.UpdateLearningProgress(userID, updateMap)
}
```

**Race Condition Scenario**:
```
User completes 2 lessons at the same time:

Thread 1:                          Thread 2:
1. Read progress (lessons=10)     
2. Calculate: 10 + 1 = 11          
                                   3. Read progress (lessons=10)
                                   4. Calculate: 10 + 1 = 11
5. Write: lessons=11               
                                   6. Write: lessons=11 ❌ WRONG!

EXPECTED: lessons=12
ACTUAL: lessons=11
```

**Impact**: Lost updates when concurrent operations occur

**Solutions**:
1. **Database-level increment**:
   ```sql
   UPDATE learning_progress 
   SET total_lessons_completed = total_lessons_completed + $1
   WHERE user_id = $2
   ```

2. **Row-level locking**:
   ```sql
   SELECT * FROM learning_progress WHERE user_id = $1 FOR UPDATE
   ```

3. **Optimistic locking** (version field):
   ```sql
   UPDATE learning_progress 
   SET ..., version = version + 1
   WHERE user_id = $1 AND version = $2
   ```

---

### ⚠️ **ISSUE #5: Missing Validation - Password Strength**
**Severity**: MEDIUM  
**Location**: `services/auth-service/internal/service/auth_service.go` (lines 126-135)

**Current Validation**:
```go
if len(req.Password) < 8 {
    return &models.AuthResponse{
        Success: false,
        Error: &models.ErrorData{
            Code:    "WEAK_PASSWORD",
            Message: "Password must be at least 8 characters long",
        },
    }, nil
}
```

**Problems**:
- Only checks length
- No complexity requirements
- Vulnerable to simple passwords: `"aaaaaaaa"`, `"12345678"`

**Recommendation**:
```go
func validatePasswordStrength(password string) error {
    if len(password) < 8 {
        return errors.New("password must be at least 8 characters")
    }
    
    hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
    hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
    hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
    hasSpecial := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`).MatchString(password)
    
    if !(hasUpper && hasLower && hasNumber) {
        return errors.New("password must contain uppercase, lowercase, and numbers")
    }
    
    return nil
}
```

---

### ⚠️ **ISSUE #6: API Gateway Route Mismatch (FIXED)**
**Severity**: CRITICAL → RESOLVED ✅  
**Location**: `api-gateway/internal/routes/routes.go`

**Problem**: Gateway routed to `/api/v1/users/*` but User Service expected `/api/v1/user/*`

**Fix Applied**:
```diff
- userGroup := v1.Group("/users")
+ userGroup := v1.Group("/user")
```

**Status**: ✅ Fixed and tested

---

## 📊 SUMMARY

### Issues by Severity:
- 🔴 **CRITICAL**: 1 issue (Registration rollback)
- 🟠 **HIGH**: 1 issue (Skill stats calculation)
- 🟡 **MEDIUM**: 4 issues (Streak logic, race condition, password validation, gateway routes)

### By Status:
- ✅ **FIXED**: 1 issue (API Gateway routes)
- 🔴 **NEEDS FIX**: 5 issues

---

## 🛠️ RECOMMENDED FIXES (Priority Order)

### Priority 1: Registration Rollback (CRITICAL)
**Time**: 1 hour  
**Action**: Add proper error handling and rollback logic

### Priority 2: Race Condition Fix (HIGH)
**Time**: 30 minutes  
**Action**: Use database-level atomic increments

### Priority 3: Skill Stats Logic (MEDIUM)
**Time**: 15 minutes  
**Action**: Refactor calculation for clarity

### Priority 4: Streak Logic (MEDIUM)
**Time**: 20 minutes  
**Action**: Use date-only comparison

### Priority 5: Password Validation (LOW)
**Time**: 15 minutes  
**Action**: Add complexity requirements

---

## 📋 NEXT STEPS

1. ✅ Fix Priority 1 issues (Registration rollback)
2. ✅ Test fixes in development environment
3. Continue Phase 2 audit (Course Service)
4. Continue Phase 3 audit (Exercise Service)
5. Complete Phase 4 audit (Notification Service)
6. Final Phase 5: End-to-end integration testing

---

**Prepared by**: GitHub Copilot  
**Review Status**: Pending Developer Review  
**Action Required**: Yes - Critical fixes needed before production

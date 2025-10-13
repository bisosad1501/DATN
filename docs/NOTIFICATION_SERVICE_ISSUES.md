# Notification Service - Business Logic Issues

**Ngày phân tích**: 13/10/2025  
**Service**: Notification Service (Port 8085)  
**Database**: notification_db

---

## 📊 TỔNG QUAN

| Metric | Value |
|--------|-------|
| **Tổng số vấn đề phát hiện** | 7 issues |
| **Mức độ nghiêm trọng cao (HIGH)** | 3 issues |
| **Mức độ trung bình (MEDIUM)** | 3 issues |
| **Mức độ thấp (LOW)** | 1 issue |

---

## 🔴 ISSUE #19: Mark All As Read - Race Condition (HIGH PRIORITY)

### Mô tả
Method `MarkAllAsRead` không có duplicate prevention khi user click nhiều lần liên tiếp.

### Vị trí
- **File**: `services/notification-service/internal/repository/notification_repository.go`
- **Method**: `MarkAllAsRead`
- **Lines**: ~175-185

### Code hiện tại
```go
func (r *NotificationRepository) MarkAllAsRead(userID uuid.UUID) error {
    query := `
        UPDATE notifications
        SET is_read = true, read_at = NOW(), updated_at = NOW()
        WHERE user_id = $1 AND is_read = false
    `

    _, err := r.db.Exec(query, userID)
    if err != nil {
        return fmt.Errorf("failed to mark all notifications as read: %w", err)
    }

    return nil
}
```

### Vấn đề
- Nếu user click "Mark all as read" nhiều lần → multiple concurrent UPDATE queries
- Không có check xem có notification nào cần update không
- Có thể trigger unnecessary UPDATE operations

### Tác động
- **Performance**: Waste database resources với empty updates
- **Log pollution**: Tạo nhiều log entries không cần thiết
- **Severity**: HIGH (affects all users)

### Giải pháp đề xuất
Thêm idempotency check và return early nếu không có unread notifications:

```go
func (r *NotificationRepository) MarkAllAsRead(userID uuid.UUID) (int, error) {
    // Check if there are any unread notifications first
    var unreadCount int
    checkQuery := `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`
    err := r.db.QueryRow(checkQuery, userID).Scan(&unreadCount)
    if err != nil {
        return 0, fmt.Errorf("failed to check unread count: %w", err)
    }
    
    if unreadCount == 0 {
        return 0, nil // Already all marked as read - idempotent
    }

    query := `
        UPDATE notifications
        SET is_read = true, read_at = NOW(), updated_at = NOW()
        WHERE user_id = $1 AND is_read = false
    `

    result, err := r.db.Exec(query, userID)
    if err != nil {
        return 0, fmt.Errorf("failed to mark all notifications as read: %w", err)
    }
    
    rowsAffected, _ := result.RowsAffected()
    return int(rowsAffected), nil
}
```

**Database Changes**: None (logic-only fix)

---

## 🔴 ISSUE #20: Device Token Registration - Race Condition (HIGH PRIORITY)

### Mô tả
Method `RegisterDeviceToken` có 2 SQL statements riêng biệt (deactivate old + insert new) → không atomic.

### Vị trí
- **File**: `services/notification-service/internal/repository/notification_repository.go`
- **Method**: `RegisterDeviceToken`
- **Lines**: ~238-270

### Code hiện tại
```go
func (r *NotificationRepository) RegisterDeviceToken(token *models.DeviceToken) error {
    // First deactivate existing tokens for this device_token
    deactivateQuery := `
        UPDATE device_tokens 
        SET is_active = false, updated_at = NOW()
        WHERE device_token = $1
    `
    _, err := r.db.Exec(deactivateQuery, token.DeviceToken)
    if err != nil {
        return fmt.Errorf("failed to deactivate old tokens: %w", err)
    }

    // Insert new token
    query := `
        INSERT INTO device_tokens (
            id, user_id, device_token, device_type, device_id,
            device_name, app_version, os_version, is_active,
            last_used_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `

    _, err = r.db.Exec(query, ...)
    
    return nil
}
```

### Vấn đề
- **Scenario**: User logs in trên 2 thiết bị cùng lúc với cùng device_token (unlikely nhưng có thể xảy ra)
- Request 1: Deactivate → INSERT
- Request 2: Deactivate (giữa 2 bước của Request 1) → INSERT
- **Kết quả**: Cả 2 tokens đều active → multiple active tokens cho cùng device

### Tác động
- **Data integrity**: Multiple active tokens for same device
- **Push notification**: Duplicate notifications sent to same device
- **Severity**: HIGH (affects push notification system)

### Giải pháp đề xuất
Sử dụng UPSERT pattern với unique constraint:

```sql
-- Migration file needed:
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_tokens_device_token_active 
ON device_tokens(device_token) WHERE is_active = true;
```

```go
func (r *NotificationRepository) RegisterDeviceToken(token *models.DeviceToken) error {
    query := `
        INSERT INTO device_tokens (
            id, user_id, device_token, device_type, device_id,
            device_name, app_version, os_version, is_active,
            last_used_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (device_token) WHERE is_active = true
        DO UPDATE SET
            user_id = EXCLUDED.user_id,
            device_type = EXCLUDED.device_type,
            device_id = EXCLUDED.device_id,
            device_name = EXCLUDED.device_name,
            app_version = EXCLUDED.app_version,
            os_version = EXCLUDED.os_version,
            last_used_at = EXCLUDED.last_used_at,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
    `

    err := r.db.QueryRow(query,
        token.ID,
        token.UserID,
        token.DeviceToken,
        token.DeviceType,
        token.DeviceID,
        token.DeviceName,
        token.AppVersion,
        token.OSVersion,
        token.IsActive,
        token.LastUsedAt,
        token.CreatedAt,
        token.UpdatedAt,
    ).Scan(&token.ID)

    if err != nil {
        return fmt.Errorf("failed to register device token: %w", err)
    }

    return nil
}
```

**Database Changes**: ✅ MIGRATION REQUIRED (unique constraint)

---

## 🔴 ISSUE #21: Bulk Notification - No Atomic Operation (HIGH PRIORITY)

### Mô tả
Method `SendBulkNotifications` gọi `CreateNotification` trong loop → không atomic, có thể partial success.

### Vị trí
- **File**: `services/notification-service/internal/service/notification_service.go`
- **Method**: `SendBulkNotifications`
- **Lines**: ~317-347

### Code hiện tại
```go
func (s *NotificationService) SendBulkNotifications(req *models.SendBulkNotificationRequest) (int, int, error) {
    successCount := 0
    failedCount := 0

    for _, userID := range req.UserIDs {
        // Create notification request for each user
        notifReq := &models.CreateNotificationRequest{
            UserID:     userID,
            Type:       req.Type,
            Category:   req.Category,
            Title:      req.Title,
            Message:    req.Message,
            ActionType: req.ActionType,
            ActionData: req.ActionData,
            IconURL:    req.IconURL,
            ImageURL:   req.ImageURL,
        }

        _, err := s.CreateNotification(notifReq)
        if err != nil {
            failedCount++
            // Log error but continue with other users
            errMsg := err.Error()
            s.logNotificationEvent(nil, userID, "bulk_send", "failed", &req.Type, &errMsg)
        } else {
            successCount++
        }
    }

    return successCount, failedCount, nil
}
```

### Vấn đề
- Mỗi notification được tạo trong transaction riêng biệt
- Nếu 1 notification fail → các notification khác vẫn được tạo → partial success
- Không có rollback mechanism
- Mỗi lần gọi `CreateNotification` check preferences riêng biệt → N+1 query problem

### Tác động
- **Performance**: N+1 queries (1 per user + preferences check per user)
- **Data consistency**: Partial success → confusing for admins
- **Severity**: HIGH (affects admin bulk operations)

### Giải pháp đề xuất
**Option 1**: Batch insert với single transaction (recommended cho < 1000 users):

```go
func (s *NotificationService) SendBulkNotifications(req *models.SendBulkNotificationRequest) (int, int, error) {
    if len(req.UserIDs) == 0 {
        return 0, 0, nil
    }

    // Pre-fetch all users' preferences in single query (optimization)
    prefsMap, err := s.repo.GetBulkNotificationPreferences(req.UserIDs, req.Type, req.Category)
    if err != nil {
        return 0, 0, fmt.Errorf("failed to get bulk preferences: %w", err)
    }

    // Filter users who can receive this notification
    var notifications []*models.Notification
    successCount := 0
    failedCount := 0

    for _, userID := range req.UserIDs {
        canSend, exists := prefsMap[userID]
        if !exists || !canSend {
            failedCount++
            continue
        }

        notification := &models.Notification{
            ID:         uuid.New(),
            UserID:     userID,
            Type:       req.Type,
            Category:   req.Category,
            Title:      req.Title,
            Message:    req.Message,
            ActionType: req.ActionType,
            // ... other fields
            IsRead:     false,
            IsSent:     true,
            CreatedAt:  time.Now(),
            UpdatedAt:  time.Now(),
        }

        notifications = append(notifications, notification)
        successCount++
    }

    // Batch insert all notifications in single transaction
    err = s.repo.CreateBulkNotifications(notifications)
    if err != nil {
        return 0, len(req.UserIDs), fmt.Errorf("failed to create bulk notifications: %w", err)
    }

    return successCount, failedCount, nil
}
```

Repository method:
```go
func (r *NotificationRepository) CreateBulkNotifications(notifications []*models.Notification) error {
    if len(notifications) == 0 {
        return nil
    }

    // Use transaction for atomicity
    tx, err := r.db.Begin()
    if err != nil {
        return fmt.Errorf("failed to begin transaction: %w", err)
    }
    defer tx.Rollback()

    // Prepare statement for better performance
    stmt, err := tx.Prepare(`
        INSERT INTO notifications (
            id, user_id, type, category, title, message,
            action_type, action_data, icon_url, image_url,
            is_read, is_sent, sent_at, scheduled_for, expires_at,
            created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `)
    if err != nil {
        return fmt.Errorf("failed to prepare statement: %w", err)
    }
    defer stmt.Close()

    now := time.Now()
    for _, notif := range notifications {
        _, err = stmt.Exec(
            notif.ID, notif.UserID, notif.Type, notif.Category,
            notif.Title, notif.Message, notif.ActionType, notif.ActionData,
            notif.IconURL, notif.ImageURL, notif.IsRead, notif.IsSent,
            &now, notif.ScheduledFor, notif.ExpiresAt,
            notif.CreatedAt, notif.UpdatedAt,
        )
        if err != nil {
            return fmt.Errorf("failed to insert notification: %w", err)
        }
    }

    // Commit transaction
    if err = tx.Commit(); err != nil {
        return fmt.Errorf("failed to commit transaction: %w", err)
    }

    return nil
}

func (r *NotificationRepository) GetBulkNotificationPreferences(userIDs []uuid.UUID, notifType, category string) (map[uuid.UUID]bool, error) {
    query := `
        SELECT user_id,
               CASE
                   WHEN NOT in_app_enabled THEN false
                   WHEN $2 = 'achievement' AND NOT push_achievements THEN false
                   WHEN $2 = 'reminder' AND NOT push_reminders THEN false
                   WHEN $2 = 'course_update' AND NOT push_course_updates THEN false
                   WHEN $2 = 'exercise_graded' AND NOT push_exercise_graded THEN false
                   ELSE true
               END as can_send
        FROM notification_preferences
        WHERE user_id = ANY($1)
    `

    rows, err := r.db.Query(query, pq.Array(userIDs), notifType)
    if err != nil {
        return nil, fmt.Errorf("failed to query bulk preferences: %w", err)
    }
    defer rows.Close()

    result := make(map[uuid.UUID]bool)
    for rows.Next() {
        var userID uuid.UUID
        var canSend bool
        if err := rows.Scan(&userID, &canSend); err != nil {
            return nil, fmt.Errorf("failed to scan preference: %w", err)
        }
        result[userID] = canSend
    }

    // For users without preferences, create defaults and allow
    for _, userID := range userIDs {
        if _, exists := result[userID]; !exists {
            result[userID] = true // Default: allow
        }
    }

    return result, nil
}
```

**Database Changes**: None (logic-only fix)

---

## 🟡 ISSUE #22: Scheduled Notification - No Duplicate Prevention (MEDIUM PRIORITY)

### Mô tả
User có thể tạo nhiều scheduled notifications giống hệt nhau (same title, time, type).

### Vị trí
- **File**: `services/notification-service/internal/repository/notification_repository.go`
- **Method**: `CreateScheduledNotification`
- **Lines**: ~541-572

### Code hiện tại
```go
func (r *NotificationRepository) CreateScheduledNotification(schedule *models.ScheduledNotification) error {
    query := `
        INSERT INTO scheduled_notifications (
            id, user_id, title, message, schedule_type, scheduled_time,
            days_of_week, timezone, is_active, next_send_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `

    _, err := r.db.Exec(query, ...)
    
    return nil
}
```

### Vấn đề
- Không có check duplicate trước khi insert
- User có thể tạo 10 lần "Daily reminder at 9:00" → 10 notifications giống nhau mỗi ngày
- Waste storage và processing

### Tác động
- **UX**: Confusing for users (multiple identical reminders)
- **Performance**: Waste processing power sending duplicate scheduled notifications
- **Severity**: MEDIUM (affects user experience)

### Giải pháp đề xuất
**Option 1**: Add unique constraint (recommended):

```sql
-- Migration:
CREATE UNIQUE INDEX IF NOT EXISTS idx_scheduled_notifications_unique
ON scheduled_notifications(user_id, schedule_type, scheduled_time, title)
WHERE is_active = true;
```

```go
func (r *NotificationRepository) CreateScheduledNotification(schedule *models.ScheduledNotification) error {
    query := `
        INSERT INTO scheduled_notifications (
            id, user_id, title, message, schedule_type, scheduled_time,
            days_of_week, timezone, is_active, next_send_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (user_id, schedule_type, scheduled_time, title) WHERE is_active = true
        DO UPDATE SET
            message = EXCLUDED.message,
            days_of_week = EXCLUDED.days_of_week,
            timezone = EXCLUDED.timezone,
            next_send_at = EXCLUDED.next_send_at,
            updated_at = CURRENT_TIMESTAMP
        RETURNING id
    `

    err := r.db.QueryRow(query,
        schedule.ID,
        schedule.UserID,
        schedule.Title,
        schedule.Message,
        schedule.ScheduleType,
        schedule.ScheduledTime,
        pq.Array(schedule.DaysOfWeek),
        schedule.Timezone,
        schedule.IsActive,
        schedule.NextSendAt,
        schedule.CreatedAt,
        schedule.UpdatedAt,
    ).Scan(&schedule.ID)

    if err != nil {
        return fmt.Errorf("failed to create scheduled notification: %w", err)
    }

    return nil
}
```

**Option 2**: Check before insert (application-level):
```go
func (r *NotificationRepository) CreateScheduledNotification(schedule *models.ScheduledNotification) error {
    // Check if similar schedule exists
    checkQuery := `
        SELECT id FROM scheduled_notifications
        WHERE user_id = $1 
          AND schedule_type = $2 
          AND scheduled_time = $3 
          AND title = $4
          AND is_active = true
    `
    
    var existingID uuid.UUID
    err := r.db.QueryRow(checkQuery, schedule.UserID, schedule.ScheduleType, 
                         schedule.ScheduledTime, schedule.Title).Scan(&existingID)
    
    if err == nil {
        // Exists - update instead
        return r.UpdateScheduledNotification(existingID, schedule)
    }
    
    if err != sql.ErrNoRows {
        return fmt.Errorf("failed to check existing schedule: %w", err)
    }
    
    // Does not exist - insert
    query := `INSERT INTO scheduled_notifications (...) VALUES (...)`
    // ... rest of insert logic
}
```

**Database Changes**: ✅ MIGRATION REQUIRED (Option 1 - unique constraint)

---

## 🟡 ISSUE #23: Notification Preferences - No Retry on Service Integration (MEDIUM PRIORITY)

### Mô tả
Service `CreateNotification` check preferences mỗi lần, nhưng nếu preferences service fail → notification bị block hoàn toàn.

### Vị trí
- **File**: `services/notification-service/internal/service/notification_service.go`
- **Method**: `CreateNotification`
- **Lines**: ~24-48

### Code hiện tại
```go
func (s *NotificationService) CreateNotification(req *models.CreateNotificationRequest) (*models.Notification, error) {
    // Check if notification can be sent
    canSend, err := s.repo.CanSendNotification(req.UserID, req.Type, req.Category)
    if err != nil {
        return nil, fmt.Errorf("failed to check notification permissions: %w", err)
    }

    if !canSend {
        return nil, fmt.Errorf("notification blocked by user preferences")
    }
    
    // ... create notification
}
```

### Vấn đề
- Nếu database connection timeout khi check preferences → notification fail
- Không có retry mechanism
- Single point of failure

### Tác động
- **Reliability**: Temporary database issues = no notifications sent
- **UX**: Users miss important notifications during outages
- **Severity**: MEDIUM (affects notification delivery)

### Giải pháp đề xuất
Add retry mechanism với fallback to default preferences:

```go
func (s *NotificationService) CreateNotification(req *models.CreateNotificationRequest) (*models.Notification, error) {
    // Check if notification can be sent with retry
    canSend, err := s.checkNotificationPermissionsWithRetry(req.UserID, req.Type, req.Category)
    if err != nil {
        // Log error but continue with default behavior (allow)
        log.Printf("[Notification-Service] WARNING: Failed to check preferences after retry: %v. Allowing notification by default.", err)
        canSend = true // Fail open - better to send than miss important notification
    }

    if !canSend {
        return nil, fmt.Errorf("notification blocked by user preferences")
    }
    
    // ... rest of create logic
}

func (s *NotificationService) checkNotificationPermissionsWithRetry(userID uuid.UUID, notifType, category string) (bool, error) {
    maxRetries := 3
    baseDelay := 100 * time.Millisecond

    for attempt := 1; attempt <= maxRetries; attempt++ {
        canSend, err := s.repo.CanSendNotification(userID, notifType, category)
        
        if err == nil {
            if attempt > 1 {
                log.Printf("[Notification-Service] SUCCESS: Preferences check succeeded on attempt %d", attempt)
            }
            return canSend, nil
        }

        log.Printf("[Notification-Service] WARNING: Preferences check failed (attempt %d/%d): %v", attempt, maxRetries, err)

        if attempt < maxRetries {
            delay := baseDelay * time.Duration(attempt)
            time.Sleep(delay)
        }
    }

    return false, fmt.Errorf("failed after %d attempts", maxRetries)
}
```

**Database Changes**: None (logic-only fix)

---

## 🟡 ISSUE #24: Quiet Hours Check - Timezone Bug (MEDIUM PRIORITY)

### Mô tả
Method `CanSendNotification` check quiet hours sử dụng server's timezone thay vì user's timezone.

### Vị trí
- **File**: `services/notification-service/internal/repository/notification_repository.go`
- **Method**: `CanSendNotification`
- **Lines**: ~452-459

### Code hiện tại
```go
// Check quiet hours
if prefs.QuietHoursEnabled && prefs.QuietHoursStart != nil && prefs.QuietHoursEnd != nil {
    now := time.Now().Format("15:04:05")
    if now >= *prefs.QuietHoursStart || now <= *prefs.QuietHoursEnd {
        return false, nil
    }
}
```

### Vấn đề
- `time.Now()` sử dụng server timezone (có thể là UTC hoặc Asia/Ho_Chi_Minh)
- User có thể ở timezone khác (e.g., user ở US muốn quiet hours 22:00-08:00 US time)
- Logic comparison sai: `>=` start **OR** `<=` end → should be **between**

### Tác động
- **UX**: Notifications sent during user's sleep time
- **Compliance**: Violates user's quiet hours preference
- **Severity**: MEDIUM (affects user sleep/do-not-disturb)

### Giải pháp đề xuất
Thêm timezone field vào preferences và sử dụng proper timezone conversion:

```go
// Check quiet hours with user's timezone
if prefs.QuietHoursEnabled && prefs.QuietHoursStart != nil && prefs.QuietHoursEnd != nil {
    // Load user's timezone (default to Asia/Ho_Chi_Minh if not set)
    loc, err := time.LoadLocation(prefs.Timezone) // Need to add Timezone field to preferences
    if err != nil {
        loc, _ = time.LoadLocation("Asia/Ho_Chi_Minh") // Fallback
    }
    
    // Get current time in user's timezone
    nowInUserTZ := time.Now().In(loc)
    currentTime := nowInUserTZ.Format("15:04:05")
    
    start := *prefs.QuietHoursStart
    end := *prefs.QuietHoursEnd
    
    // Handle case where quiet hours span midnight
    if start <= end {
        // Normal case: e.g., 22:00 - 08:00 next day
        // Should block if current time is >= 22:00 OR <= 08:00
        if currentTime >= start || currentTime <= end {
            return false, nil
        }
    } else {
        // Edge case: e.g., 08:00 - 22:00 (inverted - quiet during day)
        if currentTime >= start && currentTime <= end {
            return false, nil
        }
    }
}
```

Hoặc fix đơn giản hơn (giả sử quiet hours luôn span midnight):
```go
if prefs.QuietHoursEnabled && prefs.QuietHoursStart != nil && prefs.QuietHoursEnd != nil {
    loc, _ := time.LoadLocation("Asia/Ho_Chi_Minh") // Or get from user preferences
    nowInUserTZ := time.Now().In(loc)
    currentTime := nowInUserTZ.Format("15:04:05")
    
    // Quiet hours: from start (e.g., 22:00) until end (e.g., 08:00 next day)
    // Block if: currentTime >= start (after 22:00) OR currentTime <= end (before 08:00)
    if currentTime >= *prefs.QuietHoursStart || currentTime <= *prefs.QuietHoursEnd {
        return false, nil
    }
}
```

**Note**: Cần thêm `timezone` field vào `notification_preferences` table nếu chưa có.

**Database Changes**: ❓ MAY NEED MIGRATION (nếu thêm timezone field)

---

## ⚪ ISSUE #25: Daily Notification Limit - No Reset Mechanism (LOW PRIORITY)

### Mô tả
Method `CanSendNotification` check daily limit dựa trên `created_at >= CURRENT_DATE` nhưng không handle timezone.

### Vị trí
- **File**: `services/notification-service/internal/repository/notification_repository.go`
- **Method**: `CanSendNotification`
- **Lines**: ~462-476

### Code hiện tại
```go
// Check daily limit
if prefs.MaxNotificationsPerDay > 0 {
    countQuery := `
        SELECT COUNT(*) 
        FROM notifications 
        WHERE user_id = $1 
          AND created_at >= CURRENT_DATE
    `
    var todayCount int
    err := r.db.QueryRow(countQuery, userID).Scan(&todayCount)
    if err != nil {
        return false, fmt.Errorf("failed to check daily count: %w", err)
    }

    if todayCount >= prefs.MaxNotificationsPerDay {
        return false, nil
    }
}
```

### Vấn đề
- `CURRENT_DATE` sử dụng database timezone (có thể là UTC)
- Nếu user ở Asia timezone, "today" có thể khác với database's "today"
- Ví dụ: User ở Vietnam (UTC+7) lúc 01:00 AM, database UTC là 18:00 previous day

### Tác động
- **Minor**: User có thể nhận thêm hoặc ít hơn notifications trong "ngày" của họ
- **Severity**: LOW (edge case, không critical)

### Giải pháp đề xuất
Sử dụng user's timezone để determine "today":

```go
// Check daily limit with user's timezone
if prefs.MaxNotificationsPerDay > 0 {
    // Get user's timezone (default to Asia/Ho_Chi_Minh)
    loc, err := time.LoadLocation(prefs.Timezone)
    if err != nil {
        loc, _ = time.LoadLocation("Asia/Ho_Chi_Minh")
    }
    
    // Calculate start of today in user's timezone
    nowInUserTZ := time.Now().In(loc)
    startOfToday := time.Date(nowInUserTZ.Year(), nowInUserTZ.Month(), nowInUserTZ.Day(), 0, 0, 0, 0, loc)
    
    countQuery := `
        SELECT COUNT(*) 
        FROM notifications 
        WHERE user_id = $1 
          AND created_at >= $2
    `
    var todayCount int
    err = r.db.QueryRow(countQuery, userID, startOfToday).Scan(&todayCount)
    if err != nil {
        return false, fmt.Errorf("failed to check daily count: %w", err)
    }

    if todayCount >= prefs.MaxNotificationsPerDay {
        return false, nil
    }
}
```

**Database Changes**: None (logic-only fix, nhưng cần timezone field trong preferences)

---

## 📋 ĐỀ XUẤT PRIORITY FIX

### Phase 1: Critical Fixes (HIGH Priority)
1. **ISSUE #20**: Device Token Registration - UPSERT với unique constraint
2. **ISSUE #21**: Bulk Notification - Batch insert với transaction
3. **ISSUE #19**: Mark All As Read - Idempotency check

### Phase 2: Important Fixes (MEDIUM Priority)
4. **ISSUE #23**: Preferences Check - Retry mechanism
5. **ISSUE #24**: Quiet Hours - Timezone handling
6. **ISSUE #22**: Scheduled Notification - Duplicate prevention

### Phase 3: Nice-to-Have (LOW Priority)
7. **ISSUE #25**: Daily Limit - Timezone-aware counting

---

## 🗄️ DATABASE MIGRATIONS REQUIRED

### Migration 007: Notification Service Constraints

```sql
-- File: database/migrations/007_add_notification_constraints.sql

-- ISSUE #20: Unique constraint for active device tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_device_tokens_device_token_active 
ON device_tokens(device_token) WHERE is_active = true;

COMMENT ON INDEX idx_device_tokens_device_token_active IS 
'Prevents duplicate active device tokens (ISSUE #20 - Device Token Race Condition Prevention)';

-- ISSUE #22: Unique constraint for scheduled notifications
CREATE UNIQUE INDEX IF NOT EXISTS idx_scheduled_notifications_unique
ON scheduled_notifications(user_id, schedule_type, scheduled_time, title)
WHERE is_active = true;

COMMENT ON INDEX idx_scheduled_notifications_unique IS
'Prevents duplicate scheduled notifications (ISSUE #22 - Duplicate Schedule Prevention)';

-- Optional: Add timezone to notification_preferences if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh';
        
        COMMENT ON COLUMN notification_preferences.timezone IS
        'User timezone for quiet hours and daily limit calculations (ISSUE #24, #25)';
    END IF;
END $$;
```

---

## 📊 TÓM TẮT

| Issue | Severity | Migration Required | Pattern Used |
|-------|----------|-------------------|--------------|
| #19 | HIGH | ❌ No | Idempotency check |
| #20 | HIGH | ✅ Yes | UPSERT + Unique constraint |
| #21 | HIGH | ❌ No | Batch insert + Transaction |
| #22 | MEDIUM | ✅ Yes | UPSERT + Unique constraint |
| #23 | MEDIUM | ❌ No | Retry with fallback |
| #24 | MEDIUM | ❓ Maybe | Timezone handling |
| #25 | LOW | ❌ No | Timezone-aware query |

**Total Issues**: 7  
**Migrations Required**: 2 confirmed (ISSUE #20, #22), 1 optional (timezone field)  
**Common Patterns**: UPSERT, Retry, Idempotency, Transaction, Timezone handling

---

## ✅ TIẾP THEO

1. Review issues với team
2. Tạo migration file `007_add_notification_constraints.sql`
3. Implement fixes theo priority order
4. Tạo test script để verify fixes
5. Update documentation


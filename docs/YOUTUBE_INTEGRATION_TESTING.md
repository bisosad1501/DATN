# 🎬 HƯỚNG DẪN TEST YOUTUBE INTEGRATION

## 📋 CHUẨN BỊ

### 1. Dữ liệu cần có sẵn:
```bash
# Cần có:
- 1 Course đã tạo (ví dụ: FREE IELTS Listening course)
- 1 Module trong course
- 1 Lesson trong module
- 1 video YouTube bất kỳ (public hoặc unlisted)
```

### 2. Lấy YouTube Video ID:

**Ví dụ:** 
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Video ID: dQw4w9WgXcQ

URL: https://youtu.be/dQw4w9WgXcQ
Video ID: dQw4w9WgXcQ
```

**Test Video gợi ý (IELTS free):**
- IELTS Listening Practice: `jNQXAC9IVRw` (từ BBC Learning English)
- IELTS Speaking Sample: `PXPvwGhLtLE`
- Grammar Lesson: `xxADdT0vK6Q`

---

## 🔧 BƯỚC 1: KHỞI TẠO DỮ LIỆU TEST

### 1.1. Đăng nhập để lấy token (Admin/Instructor):

```bash
# Login as admin
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }' | jq .

# Save token
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 1.2. Tạo FREE Course:

```bash
curl -X POST http://localhost:8083/api/v1/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "IELTS Listening Mastery - FREE",
    "slug": "ielts-listening-free",
    "description": "Complete IELTS Listening course with YouTube videos",
    "short_description": "Master IELTS Listening with free video lessons",
    "skill_type": "listening",
    "level": "intermediate",
    "target_band_score": 7.0,
    "enrollment_type": "free",
    "price": 0,
    "currency": "USD"
  }' | jq .

# Save course_id
export COURSE_ID="uuid-here"
```

### 1.3. Tạo Module:

```bash
curl -X POST http://localhost:8083/api/v1/admin/modules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "'$COURSE_ID'",
    "title": "Introduction to IELTS Listening",
    "description": "Learn the basics of IELTS Listening test",
    "display_order": 1
  }' | jq .

# Save module_id
export MODULE_ID="uuid-here"
```

### 1.4. Tạo Lesson:

```bash
curl -X POST http://localhost:8083/api/v1/admin/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": "'$MODULE_ID'",
    "title": "Part 1: Form Completion",
    "description": "Practice listening for specific information",
    "content_type": "video",
    "duration_minutes": 15,
    "display_order": 1,
    "is_free": true
  }' | jq .

# Save lesson_id
export LESSON_ID="uuid-here"
```

---

## 🎥 BƯỚC 2: THÊM YOUTUBE VIDEO VÀO LESSON

### 2.1. Thêm video bằng YouTube video ID:

```bash
curl -X POST "http://localhost:8083/api/v1/admin/lessons/$LESSON_ID/videos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "IELTS Listening Practice Test - Part 1",
    "video_provider": "youtube",
    "video_id": "jNQXAC9IVRw",
    "video_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "duration_seconds": 900,
    "thumbnail_url": "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
    "quality": "720p",
    "display_order": 1
  }' | jq .
```

**Response mong đợi:**
```json
{
  "success": true,
  "message": "Video added successfully",
  "data": {
    "id": "video-uuid",
    "lesson_id": "lesson-uuid",
    "title": "IELTS Listening Practice Test - Part 1",
    "video_provider": "youtube",
    "video_id": "jNQXAC9IVRw",
    "video_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "thumbnail_url": "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
    "duration_seconds": 900,
    "quality": "720p",
    "display_order": 1,
    "created_at": "2025-10-10T10:00:00Z"
  }
}
```

### 2.2. Thử các YouTube URL khác nhau:

```bash
# Test 1: URL dạng watch?v=
curl -X POST "http://localhost:8083/api/v1/admin/lessons/$LESSON_ID/videos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Grammar Lesson",
    "video_provider": "youtube",
    "video_id": "xxADdT0vK6Q",
    "video_url": "https://www.youtube.com/watch?v=xxADdT0vK6Q",
    "thumbnail_url": "https://img.youtube.com/vi/xxADdT0vK6Q/hqdefault.jpg"
  }'

# Test 2: URL dạng youtu.be
curl -X POST "http://localhost:8083/api/v1/admin/lessons/$LESSON_ID/videos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Speaking Practice",
    "video_provider": "youtube",
    "video_id": "PXPvwGhLtLE",
    "video_url": "https://youtu.be/PXPvwGhLtLE",
    "thumbnail_url": "https://img.youtube.com/vi/PXPvwGhLtLE/maxresdefault.jpg"
  }'
```

---

## 📱 BƯỚC 3: XEM VIDEO TỪ MOBILE APP / WEB

### 3.1. Get lesson details (có video):

```bash
curl -X GET "http://localhost:8083/api/v1/lessons/$LESSON_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lesson": {
      "id": "lesson-uuid",
      "title": "Part 1: Form Completion"
    },
    "videos": [
      {
        "id": "video-uuid",
        "title": "IELTS Listening Practice Test - Part 1",
        "video_provider": "youtube",
        "video_id": "jNQXAC9IVRw",
        "video_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "thumbnail_url": "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
        "duration_seconds": 900,
        "quality": "720p"
      }
    ]
  }
}
```

### 3.2. Mobile App (Flutter) sẽ render YouTube Player:

```dart
// App tự động detect provider='youtube' và dùng YoutubePlayer widget
if (video.provider == 'youtube') {
  YoutubePlayer(
    controller: YoutubePlayerController(
      initialVideoId: 'jNQXAC9IVRw', // from video.video_id
      flags: YoutubePlayerFlags(autoPlay: false),
    ),
  )
}
```

### 3.3. Web sẽ dùng iframe:

```html
<!-- Embed YouTube video -->
<iframe 
  width="100%" 
  height="480"
  src="https://www.youtube.com/embed/jNQXAC9IVRw"
  frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>
```

---

## 🧪 BƯỚC 4: TEST TRACKING (Xem video đã bao lâu)

### 4.1. Student đăng nhập và enroll course:

```bash
# Login as student
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "student123"
  }' | jq .

export STUDENT_TOKEN="student-token-here"

# Enroll course
curl -X POST http://localhost:8083/api/v1/enrollments \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "'$COURSE_ID'",
    "enrollment_type": "free"
  }'
```

### 4.2. Track video progress:

```bash
# Student xem video được 5 phút (300 giây / 900 giây)
curl -X POST http://localhost:8083/api/v1/videos/track \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "video_id": "'$VIDEO_ID'",
    "lesson_id": "'$LESSON_ID'",
    "watched_seconds": 300,
    "total_seconds": 900,
    "device_type": "android"
  }' | jq .

# Response: {"success":true,"message":"Progress tracked"}
```

### 4.3. Xem watch history:

```bash
curl -X GET "http://localhost:8083/api/v1/videos/history?limit=10" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq .
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "history-uuid",
      "video_id": "video-uuid",
      "lesson_id": "lesson-uuid",
      "watched_seconds": 300,
      "total_seconds": 900,
      "watch_percentage": 33.33,
      "device_type": "android",
      "watched_at": "2025-10-10T10:30:00Z"
    }
  ]
}
```

---

## 🎯 BƯỚC 5: TEST YOUTUBE THUMBNAIL URLs

YouTube cung cấp nhiều chất lượng thumbnail:

```bash
# Default (120x90)
https://img.youtube.com/vi/jNQXAC9IVRw/default.jpg

# Medium (320x180)
https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg

# High (480x360)
https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg

# Standard (640x480)
https://img.youtube.com/vi/jNQXAC9IVRw/sddefault.jpg

# Max resolution (1280x720 hoặc 1920x1080)
https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg
```

**Test trong browser:**
```
Mở: https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg
Kết quả: Hiện ảnh thumbnail video
```

---

## ✅ CHECKLIST TEST

### Backend API:
- [ ] POST `/admin/lessons/{id}/videos` - Thêm YouTube video thành công
- [ ] GET `/lessons/{id}` - Trả về video với đầy đủ thông tin
- [ ] POST `/videos/track` - Track được video progress
- [ ] GET `/videos/history` - Xem được watch history
- [ ] Authorization: Chỉ instructor/admin mới add được video
- [ ] Validation: Reject nếu thiếu required fields

### YouTube Integration:
- [ ] Video ID parse đúng từ nhiều URL format (watch?v=, youtu.be, embed)
- [ ] Thumbnail URL hiển thị đúng
- [ ] Duration_seconds lưu chính xác
- [ ] Provider='youtube' được set đúng

### Mobile App (Flutter):
- [ ] YoutubePlayer widget render video
- [ ] Video play/pause hoạt động
- [ ] Fullscreen mode hoạt động
- [ ] Progress tracking gửi đúng API

### Security:
- [ ] Free course: Public access (không cần login)
- [ ] Premium course: Chỉ enrolled users
- [ ] Video tracking: Require authentication
- [ ] Add video: Require instructor/admin role

---

## 🔧 TROUBLESHOOTING

### Lỗi: "Video ID not found"
```bash
# Check video có tồn tại không:
curl "https://www.youtube.com/watch?v=VIDEO_ID"

# Hoặc check qua API:
curl "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json"
```

### Lỗi: "Thumbnail not loading"
```bash
# Thử các chất lượng khác:
https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg
https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg
https://img.youtube.com/vi/VIDEO_ID/default.jpg
```

### Lỗi: "Unauthorized to add video"
```bash
# Check token:
echo $TOKEN

# Check role:
curl http://localhost:8081/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .role
```

### Lỗi: "Lesson not found"
```bash
# Verify lesson exists:
curl "http://localhost:8083/api/v1/lessons/$LESSON_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 KẾT QUẢ MONG ĐỢI

Sau khi test xong, bạn sẽ có:

1. ✅ **Backend**: Course với lessons chứa YouTube videos
2. ✅ **Database**: Videos được lưu với provider='youtube'
3. ✅ **API Response**: Trả về video_url, thumbnail_url, video_id
4. ✅ **Tracking**: Watch history được ghi lại
5. ✅ **Mobile App**: Có thể play YouTube videos
6. ✅ **Cost**: $0 (hoàn toàn miễn phí)

---

## 🚀 NEXT STEPS

1. **Test với nhiều videos**: Thêm 5-10 YouTube videos vào course
2. **Test playlists**: Tạo nhiều lessons với videos khác nhau
3. **Test tracking**: Xem video, pause, resume → Check history
4. **Setup Bunny.net**: Cho premium courses (optional)
5. **Create admin panel**: UI để instructor thêm videos dễ dàng

---

## 📞 VIDEO IDs ĐỀ XUẤT ĐỂ TEST

### IELTS Content (Free on YouTube):
```bash
# Listening Practice
VIDEO_ID="jNQXAC9IVRw"  # BBC Learning English - IELTS Listening
URL="https://www.youtube.com/watch?v=jNQXAC9IVRw"

# Speaking Practice  
VIDEO_ID="PXPvwGhLtLE"  # IELTS Speaking Band 9
URL="https://www.youtube.com/watch?v=PXPvwGhLtLE"

# Grammar Lessons
VIDEO_ID="xxADdT0vK6Q"  # English Grammar
URL="https://www.youtube.com/watch?v=xxADdT0vK6Q"

# Reading Tips
VIDEO_ID="L7yxmO0dTwI"  # IELTS Reading Strategies
URL="https://www.youtube.com/watch?v=L7yxmO0dTwI"
```

Chúc bạn test thành công! 🎉

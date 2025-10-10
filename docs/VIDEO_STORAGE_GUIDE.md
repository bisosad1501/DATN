# 🎥 HƯỚNG DẪN SỬ DỤNG YOUTUBE CHO FREE COURSES

## 🎯 CHIẾN LƯỢC HYBRID

### Phân Chia Video:
- **FREE Courses → YouTube** (100% miễn phí)
- **PREMIUM Courses → Bunny.net** (có phí nhưng kiểm soát tốt)
- **Preview Lessons → YouTube** (marketing)

---

## 📝 WORKFLOW ĐƠN GIẢN (KHÔNG CẦN API)

### 1. Upload Video Lên YouTube

```bash
1. Truy cập: https://studio.youtube.com
2. Click "Create" → "Upload videos"
3. Chọn video file
4. Điền thông tin:
   - Title: "IELTS Listening Practice - Part 1 | Free Course"
   - Description: Course description + link website
   - Privacy: 
     * "Public" cho FREE courses (tốt cho SEO)
     * "Unlisted" cho Preview lessons (chỉ người có link)
   - Category: Education
   - Tags: IELTS, listening, practice, etc.
5. Click "Publish"
6. Copy video ID từ URL
```

### 2. Lưu Vào Database

#### A. **Qua Postman (Đơn giản)**

```bash
# Endpoint: POST /api/v1/admin/videos
# Headers: Authorization: Bearer {instructor_token}

# Body:
{
  "lesson_id": "uuid-of-lesson",
  "title": "IELTS Listening Practice - Part 1",
  "video_provider": "youtube",
  "video_id": "dQw4w9WgXcQ",  // Copy từ YouTube URL
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "duration_seconds": 600,
  "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
}
```

#### B. **Qua Admin Panel (Web - Recommended)**

Tôi sẽ tạo API endpoint đơn giản cho bạn sau.

---

## 🔧 IMPLEMENTATION - SIMPLE APPROACH

### 1. Environment Variables (Không cần YouTube API)

```bash
# .env - KHÔNG CẦN API KEY cho manual upload
# Chỉ cần khi muốn dùng YouTube API automation

# YOUTUBE_API_KEY=your-api-key-here  # Optional
```

### 2. API Endpoint - Add Video to Lesson

Tôi sẽ tạo endpoint đơn giản:

```go
// POST /api/v1/admin/lessons/{lesson_id}/videos
// Add video (YouTube or Bunny) to a lesson
```

---

## 📱 MOBILE APP INTEGRATION

### Flutter Package (Đã tích hợp sẵn)

```yaml
dependencies:
  youtube_player_flutter: ^8.1.2  # YouTube
  better_player: ^0.0.83           # Bunny.net / HLS
```

### Code Example

```dart
Widget buildVideoPlayer(LessonVideo video) {
  if (video.provider == 'youtube') {
    return YoutubePlayer(
      controller: YoutubePlayerController(
        initialVideoId: video.videoId,
        flags: YoutubePlayerFlags(
          autoPlay: false,
          mute: false,
          enableCaption: true,
        ),
      ),
    );
  } else {
    // Bunny.net hoặc self-hosted
    return BetterPlayer.network(video.videoUrl);
  }
}
```

---

## 🎨 YOUTUBE URL FORMATS

### Các định dạng YouTube URL:

```bash
1. Watch URL:     https://www.youtube.com/watch?v=VIDEO_ID
2. Short URL:     https://youtu.be/VIDEO_ID
3. Embed URL:     https://www.youtube.com/embed/VIDEO_ID
4. Thumbnail:     https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg
```

### Extract Video ID:

```go
// From: https://www.youtube.com/watch?v=dQw4w9WgXcQ
// Extract: dQw4w9WgXcQ

func extractYouTubeID(url string) string {
    // Simple regex or string parsing
    if strings.Contains(url, "watch?v=") {
        parts := strings.Split(url, "watch?v=")
        return strings.Split(parts[1], "&")[0]
    }
    if strings.Contains(url, "youtu.be/") {
        parts := strings.Split(url, "youtu.be/")
        return strings.Split(parts[1], "?")[0]
    }
    return url // Assume it's already just the ID
}
```

---

## 📊 BEST PRACTICES

### YouTube Settings Recommendations:

1. **Title Format:**
   ```
   IELTS [Skill] - [Topic] | [Level] | IELTSGo Free Course
   Example: IELTS Listening - Part 1 Practice | Intermediate | IELTSGo
   ```

2. **Description Template:**
   ```
   🎯 Free IELTS [Skill] Course
   
   In this lesson, you will learn...
   
   📚 Full course: https://ieltsgo.com/courses/[course-slug]
   📱 Download app: [app-links]
   
   ⏱️ Timestamps:
   0:00 - Introduction
   2:30 - Topic 1
   ...
   
   #IELTS #IELTSPreparation #EnglishLearning
   ```

3. **Privacy Settings:**
   - `Public`: FREE courses (good for SEO and discovery)
   - `Unlisted`: Preview lessons (only people with link)
   - `Private`: Testing only

4. **Playlist Organization:**
   - Create playlists per course
   - Order videos by lesson sequence
   - Add to "IELTS Free Courses" main playlist

---

## 💰 COST COMPARISON

| Storage | FREE Courses | PREMIUM Courses | Total/Month |
|---------|--------------|-----------------|-------------|
| **Option 1: All YouTube** | $0 | $0 (but no protection) | **$0** |
| **Option 2: Hybrid** | $0 (YouTube) | $1-5 (Bunny.net) | **$1-5** |
| **Option 3: All Bunny** | $1 | $3-10 | **$5-15** |

**Recommendation**: Option 2 (Hybrid) - Best balance of cost and control

---

## 🚀 QUICK START

### Bước 1: Upload Free Course to YouTube
```bash
1. Login to https://studio.youtube.com
2. Upload video
3. Copy video ID: dQw4w9WgXcQ
```

### Bước 2: Add to Course Service
```bash
# Sử dụng API hoặc direct DB insert
INSERT INTO lesson_videos (
    lesson_id, 
    title, 
    video_provider, 
    video_id, 
    video_url,
    thumbnail_url
) VALUES (
    'lesson-uuid',
    'IELTS Listening Practice',
    'youtube',
    'dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
);
```

### Bước 3: Mobile App Tự Động Detect
```dart
// App sẽ tự động render YouTube player cho provider='youtube'
// Không cần code gì thêm!
```

---

## 📞 SUPPORT

- YouTube Studio: https://studio.youtube.com
- YouTube Help: https://support.google.com/youtube
- Bunny.net (for premium): https://bunny.net

---

## ✅ CHECKLIST

- [ ] Upload video to YouTube
- [ ] Copy video ID
- [ ] Create lesson in Course Service
- [ ] Add video to lesson via API/DB
- [ ] Test on mobile app
- [ ] Create playlist for organization
- [ ] Add course description with links
- [ ] Optimize title and tags for SEO

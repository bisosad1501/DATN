# ✅ Exercise Data Validation Checklist

## Mục đích
Kiểm tra xem tất cả các trường dữ liệu cần thiết đã được hiển thị đúng cho user chưa.

---

## 1. Exercise List Page (`/exercises/list`)

### Dữ liệu hiển thị trên mỗi card:

| Field | Backend Field | Status | Notes |
|-------|---------------|--------|-------|
| Title | `title` | ✅ | Hiển thị đầy đủ |
| Description | `description` | ✅ | Hiển thị đầy đủ |
| Skill Type Badge | `skill_type` | ✅ | listening, reading, writing, speaking |
| Difficulty Badge | `difficulty` | ✅ | easy, medium, hard |
| Exercise Type | `exercise_type` | ⚠️ | Chưa hiển thị (practice, mock_test, full_test) |
| Number of Questions | `total_questions` | ✅ | Hiển thị |
| Time Limit | `time_limit_minutes` | ✅ | Hiển thị |
| Number of Sections | `total_sections` | ✅ | Hiển thị |
| Thumbnail | `thumbnail_url` | ⚠️ | Chưa hiển thị |
| Is Free | `is_free` | ⚠️ | Chưa hiển thị badge |
| Is Official | `is_official` | ⚠️ | Chưa hiển thị badge |

### Filters:
| Filter | Backend Param | Status |
|--------|---------------|--------|
| Search | `search` | ✅ |
| Skill Type | `skill_type` | ✅ |
| Difficulty | `difficulty` | ✅ |
| Exercise Type | `exercise_type` | ❌ Chưa có |
| Is Free | `is_free` | ❌ Chưa có |

---

## 2. Exercise Detail Page (`/exercises/[exerciseId]`)

### Header Section:

| Field | Backend Field | Status | Notes |
|-------|---------------|--------|-------|
| Title | `exercise.title` | ✅ | |
| Description | `exercise.description` | ✅ | |
| Skill Type Badge | `exercise.skill_type` | ✅ | |
| Difficulty Badge | `exercise.difficulty_level` | ✅ | |
| Official Badge | `exercise.is_official` | ✅ | |
| Exercise Type | `exercise.exercise_type` | ⚠️ | Chưa hiển thị |
| Thumbnail | `exercise.thumbnail_url` | ❌ | Chưa hiển thị |

### Thông tin bài tập:

| Field | Backend Field | Status | Display |
|-------|---------------|--------|---------|
| Thời gian | `exercise.time_limit_minutes` | ✅ | "30 phút" hoặc "Không giới hạn" |
| Số câu hỏi | Calculated from sections | ✅ | "40 câu" |
| Điểm tối đa | `exercise.total_points` | ✅ | "40 điểm" |
| Số phần | `sections.length` | ✅ | "4 phần" |
| Hướng dẫn | `exercise.instructions` | ✅ | HTML content |
| Passing Score | `exercise.passing_score` | ❌ | Chưa hiển thị |
| IELTS Level | `exercise.ielts_level` | ❌ | Chưa hiển thị |
| Target Band Score | `exercise.target_band_score` | ✅ | Hiển thị ở sidebar |

### Cấu trúc bài tập (Sections):

| Field | Backend Field | Status | Notes |
|-------|---------------|--------|-------|
| Section Number | `section.section_number` | ✅ | Hiển thị as index |
| Section Title | `section.title` | ✅ | |
| Section Description | `section.description` | ✅ | |
| Question Count | `section.total_questions` hoặc `questions.length` | ✅ | |
| Max Score | `section.max_score` | ❌ | Đã xóa (không có trong DB) |
| Audio URL | `section.audio_url` | ❌ | Chưa hiển thị |
| Passage Title | `section.passage_title` | ❌ | Chưa hiển thị |
| Instructions | `section.instructions` | ❌ | Chưa hiển thị |
| Time Limit | `section.time_limit_minutes` | ❌ | Chưa hiển thị |

### Thống kê:

| Field | Backend Field | Status | Notes |
|-------|---------------|--------|-------|
| Số lượt làm | `exercise.total_attempts` | ✅ | |
| Điểm trung bình | `exercise.average_score` | ✅ | |
| Điểm cao nhất | N/A | ❌ | Backend không có field này |
| Thời gian TB | `exercise.average_completion_time` | ❌ | Chưa hiển thị |

### Thông tin chi tiết (Sidebar):

| Field | Backend Field | Status |
|-------|---------------|--------|
| Loại kỹ năng | `exercise.skill_type` | ✅ |
| Độ khó | `exercise.difficulty_level` | ✅ |
| Band điểm | `exercise.target_band_score` | ✅ |
| Trạng thái | `exercise.is_published` | ✅ |
| Exercise Type | `exercise.exercise_type` | ❌ |
| IELTS Level | `exercise.ielts_level` | ❌ |
| Is Free | `exercise.is_free` | ❌ |

---

## 3. Take Exercise Page (`/exercises/[exerciseId]/take/[submissionId]`)

### Header:

| Field | Backend Field | Status |
|-------|---------------|--------|
| Exercise Title | `exercise.title` | ✅ |
| Current Question | Calculated | ✅ |
| Timer | Client-side | ✅ |
| Progress | Calculated | ✅ |
| Answered Count | Calculated | ✅ |

### Question Display:

| Field | Backend Field | Status | Notes |
|-------|---------------|--------|-------|
| Question Number | `question.question_number` | ✅ | |
| Question Text | `question.question_text` | ✅ | |
| Question Type | `question.question_type` | ✅ | Used for rendering |
| Context Text | `question.context_text` | ⚠️ | Cần kiểm tra |
| Image | `question.image_url` | ⚠️ | Cần kiểm tra |
| Audio | `question.audio_url` | ❌ | Chưa implement |
| Tips | `question.tips` | ⚠️ | Chỉ hiển thị khi review |
| Points | `question.points` | ❌ | Chưa hiển thị |

### Options (Multiple Choice):

| Field | Backend Field | Status |
|-------|---------------|--------|
| Option Label | `option.option_label` | ✅ |
| Option Text | `option.option_text` | ✅ |
| Option Image | `option.option_image_url` | ❌ |

### Section Info:

| Field | Backend Field | Status |
|-------|---------------|--------|
| Section Title | `section.title` | ⚠️ | Cần kiểm tra |
| Section Instructions | `section.instructions` | ❌ | Chưa hiển thị |
| Passage Content | `section.passage_content` | ❌ | Chưa hiển thị (quan trọng cho Reading!) |
| Audio Player | `section.audio_url` | ❌ | Chưa implement (quan trọng cho Listening!) |
| Transcript | `section.transcript` | ❌ | Chưa hiển thị |

---

## 4. Result Page (`/exercises/[exerciseId]/result/[submissionId]`)

### Performance Stats:

| Field | Backend Field | Status |
|-------|---------------|--------|
| Score | `performance.score` | ✅ |
| Total Questions | `performance.total_questions` | ✅ |
| Percentage | `performance.percentage` | ✅ |
| Band Score | `performance.band_score` | ✅ |
| Correct Answers | `performance.correct_answers` | ✅ |
| Incorrect Answers | `performance.incorrect_answers` | ✅ |
| Skipped Answers | `performance.skipped_answers` | ✅ |
| Time Spent | `performance.time_spent_seconds` | ✅ |
| Accuracy | `performance.accuracy` | ✅ |
| Avg Time/Question | `performance.average_time_per_question` | ✅ |
| Is Passed | `performance.is_passed` | ✅ |

### Answer Review:

| Field | Backend Field | Status |
|-------|---------------|--------|
| Question Text | `question.question_text` | ✅ |
| User Answer | `answer.answer_text` hoặc `answer.selected_option_id` | ✅ |
| Correct Answer | `correct_answer` | ✅ |
| Is Correct | `answer.is_correct` | ✅ |
| Points Earned | `answer.points_earned` | ✅ |
| Time Spent | `answer.time_spent_seconds` | ✅ |
| Explanation | `question.explanation` | ✅ |
| Tips | `question.tips` | ✅ |

---

## 5. History Page (`/exercises/history`)

### Submission List:

| Field | Backend Field | Status |
|-------|---------------|--------|
| Exercise Title | From exercise object | ✅ |
| Status | `submission.status` | ✅ |
| Attempt Number | `submission.attempt_number` | ✅ |
| Started At | `submission.started_at` | ✅ |
| Completed At | `submission.completed_at` | ✅ |
| Score | `submission.score` | ✅ |
| Band Score | `submission.band_score` | ✅ |
| Time Spent | `submission.time_spent_seconds` | ✅ |
| Progress | Calculated | ✅ |
| Percentage | Calculated | ✅ |

---

## 📊 Tổng kết

### ✅ Đã đầy đủ (Core Features):
- Exercise list với filter cơ bản
- Exercise detail với thông tin chính
- Take exercise với multiple choice và text input
- Result page với performance stats đầy đủ
- History page với submission list

### ⚠️ Cần bổ sung (Important):
1. **Reading Exercises**: Hiển thị `passage_content` khi làm bài
2. **Listening Exercises**: Audio player cho `section.audio_url`
3. **Section Instructions**: Hiển thị hướng dẫn từng phần
4. **Question Context**: Hiển thị `context_text` nếu có
5. **Question Images**: Hiển thị `image_url` và `option_image_url`
6. **Exercise Type Filter**: Thêm filter theo loại bài tập
7. **Free/Premium Badge**: Hiển thị badge cho bài free/premium

### ❌ Thiếu (Nice to Have):
1. Thumbnail images
2. Audio for individual questions
3. Transcript display
4. IELTS level display
5. Passing score display
6. Average completion time in stats

---

## 🎯 Ưu tiên sửa

### Priority 1 (Critical - Ảnh hưởng UX):
1. ✅ **Passage Content cho Reading** - Không có passage thì không làm được bài Reading!
2. ✅ **Audio Player cho Listening** - Không có audio thì không làm được bài Listening!
3. ✅ **Section Instructions** - Hướng dẫn quan trọng cho từng phần

### Priority 2 (High - Improve UX):
4. Question context text
5. Question images
6. Exercise type display và filter
7. Free/Premium badges

### Priority 3 (Medium - Enhancement):
8. Thumbnails
9. IELTS level display
10. Passing score display

---

**Last Updated**: 2025-01-21


┌─────────────────────────────────────────────────────────────────────────────┐
│                  IELTS PLATFORM - DATA MODEL RELATIONSHIPS                  │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
1. COURSE (Khóa học) - Course Service
═══════════════════════════════════════════════════════════════════════════════

📚 COURSE
├── Là một khóa học hoàn chỉnh về IELTS
├── Được tạo bởi instructor/admin
├── Database: course_db.courses
└── Ví dụ: 
    ├── "IELTS Listening for Beginners"
    ├── "IELTS Reading Advanced"
    └── "Complete IELTS Writing Course"

Properties:
  - id, title, slug, description
  - skill_type: listening/reading/writing/speaking
  - level: beginner/intermediate/advanced
  - price, enrollment_type (free/paid)
  - instructor_id, instructor_name
  - total_lessons, duration_hours
  - is_featured, is_recommended

═══════════════════════════════════════════════════════════════════════════════
2. MODULE (Chương/Module) - Course Service
═══════════════════════════════════════════════════════════════════════════════

📑 MODULE
├── Là một phần/chương của COURSE
├── Nhóm các lessons liên quan
├── Database: course_db.modules
└── Ví dụ:
    Course: "IELTS Listening for Beginners"
    ├── Module 1: "Basic Listening Skills"
    ├── Module 2: "Understanding Different Accents"
    └── Module 3: "Practice Tests"

Properties:
  - id, course_id (FK)
  - title, description
  - display_order
  - total_lessons, duration_hours

Relationship:
  Course (1) ──< Modules (Many)
  1 course có nhiều modules

═══════════════════════════════════════════════════════════════════════════════
3. LESSON (Bài học) - Course Service
═══════════════════════════════════════════════════════════════════════════════

📖 LESSON
├── Là một bài học cụ thể trong MODULE
├── Có thể chứa video, article, hoặc liên kết tới exercise
├── Database: course_db.lessons
└── Ví dụ:
    Module: "Basic Listening Skills"
    ├── Lesson 1: "Introduction to IELTS Listening" (video)
    ├── Lesson 2: "Key Vocabulary" (article)
    ├── Lesson 3: "Practice Exercise" (link to exercise)
    └── Lesson 4: "Tips and Strategies" (video)

Properties:
  - id, module_id (FK), course_id (FK)
  - title, description
  - content_type: video/article/quiz/exercise
  - duration_minutes
  - display_order
  - is_free, is_published

Relationship:
  Module (1) ──< Lessons (Many)
  1 module có nhiều lessons

═══════════════════════════════════════════════════════════════════════════════
4. LESSON VIDEO - Course Service
═══════════════════════════════════════════════════════════════════════════════

🎥 LESSON_VIDEO
├── Video content của một LESSON
├── Support YouTube, Vimeo, hoặc self-hosted
├── Database: course_db.lesson_videos
└── Ví dụ:
    Lesson: "Introduction to IELTS Listening"
    └── Video: YouTube video với duration auto-fetched

Properties:
  - id, lesson_id (FK)
  - title, video_url, video_provider
  - video_id (YouTube ID)
  - duration_seconds (auto-synced from YouTube API)
  - quality, thumbnail_url

Relationship:
  Lesson (1) ──< Videos (Many)
  1 lesson có thể có nhiều videos (ví dụ: intro + main content)

═══════════════════════════════════════════════════════════════════════════════
5. EXERCISE (Bài tập/Đề thi) - Exercise Service
═══════════════════════════════════════════════════════════════════════════════

✍️ EXERCISE
├── Là bài tập/đề thi độc lập hoặc liên kết với lesson
├── Managed by Exercise Service (microservice riêng)
├── Database: exercise_db.exercises
└── Ví dụ:
    ├── "IELTS Listening Practice Test 1" (standalone)
    ├── "Reading Comprehension Exercise" (linked to lesson)
    └── "Full Mock Test" (standalone)

Properties:
  - id, title, slug, description
  - exercise_type: practice/mock_test/question_bank
  - skill_type: listening/reading/writing/speaking
  - difficulty: easy/medium/hard
  - total_questions, total_sections
  - time_limit_minutes, passing_score
  - is_free, is_published

Types of Exercises:
  1. STANDALONE Exercise:
     - Browse tại /exercises
     - Không liên kết với course/lesson cụ thể
     - User có thể làm bất cứ lúc nào
     
  2. LINKED Exercise:
     - Được reference trong lesson
     - Lesson có content_type = "exercise"
     - Có thể yêu cầu hoàn thành course trước

═══════════════════════════════════════════════════════════════════════════════
6. EXERCISE SECTION & QUESTION - Exercise Service
═══════════════════════════════════════════════════════════════════════════════

📝 EXERCISE SECTION
├── Là một phần của EXERCISE (như Part 1, Part 2 trong IELTS)
├── Database: exercise_db.exercise_sections
└── Ví dụ:
    Exercise: "IELTS Listening Practice Test 1"
    ├── Section 1: "Conversation - Social Context"
    ├── Section 2: "Monologue - General Information"
    ├── Section 3: "Discussion - Academic Context"
    └── Section 4: "Lecture - Academic"

❓ QUESTION
├── Câu hỏi trong SECTION
├── Database: exercise_db.questions
└── Types:
    ├── multiple_choice
    ├── fill_in_blank
    ├── matching
    ├── true_false
    └── essay

Relationship:
  Exercise (1) ──< Sections (Many) ──< Questions (Many)

═══════════════════════════════════════════════════════════════════════════════
7. SUBMISSION (Bài làm của user) - Exercise Service
═══════════════════════════════════════════════════════════════════════════════

📊 SUBMISSION
├── Lưu trữ bài làm của user khi làm exercise
├── Database: exercise_db.submissions
└── Properties:
    - id, exercise_id, user_id
    - started_at, submitted_at
    - score, time_spent
    - status: in_progress/completed/abandoned

Relationship:
  Exercise (1) ──< Submissions (Many)
  User (1) ──< Submissions (Many)

═══════════════════════════════════════════════════════════════════════════════
TỔNG QUAN QUAN HỆ
═══════════════════════════════════════════════════════════════════════════════

Course Service (Port 8083):
┌─────────────────────────────────────┐
│  COURSE                             │
│  ├── Module 1                       │
│  │   ├── Lesson 1 (video)          │
│  │   │   └── Videos (YouTube)      │
│  │   ├── Lesson 2 (article)        │
│  │   └── Lesson 3 (exercise link)  │◄─┐
│  └── Module 2                       │  │
│      └── ...                        │  │
└─────────────────────────────────────┘  │
                                         │
Exercise Service (Port 8084):            │
┌─────────────────────────────────────┐  │
│  EXERCISE (standalone or linked)    │◄─┘
│  ├── Section 1                      │
│  │   ├── Question 1                │
│  │   ├── Question 2                │
│  │   └── ...                        │
│  └── Section 2                      │
│      └── ...                        │
│                                     │
│  SUBMISSIONS (user answers)         │
│  └── User's answers & scores        │
└─────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
USER JOURNEY
═══════════════════════════════════════════════════════════════════════════════

1. Browse Courses:
   GET /api/v1/courses
   → User xem danh sách courses

2. View Course Detail:
   GET /api/v1/courses/{id}
   → Xem modules & lessons trong course

3. Enroll in Course:
   POST /api/v1/enrollments
   → User đăng ký course

4. Watch Lesson:
   GET /api/v1/lessons/{id}
   → Xem video hoặc đọc article
   → Video duration tự động sync từ YouTube API

5. Do Exercise (2 cách):

   A. Standalone Exercise (tại /exercises):
      GET /api/v1/exercises
      → Browse exercises
      POST /api/v1/exercises/{id}/start
      → Bắt đầu làm bài
      PUT /api/v1/submissions/{id}/answers
      → Submit answers
      GET /api/v1/submissions/{id}/result
      → Xem kết quả

   B. Linked Exercise (trong lesson):
      Lesson có content_type = "exercise"
      → Link đến exercise cụ thể
      → Same flow như standalone

═══════════════════════════════════════════════════════════════════════════════
KEY DIFFERENCES
═══════════════════════════════════════════════════════════════════════════════

COURSE vs EXERCISE:
┌──────────────────────────┬────────────────────────────────┐
│ COURSE                   │ EXERCISE                       │
├──────────────────────────┼────────────────────────────────┤
│ Structured learning path │ Practice/Test only             │
│ Multiple modules/lessons │ Single test/exercise           │
│ Video + Article content  │ Questions + Answers            │
│ Progress tracking        │ Score tracking                 │
│ Must enroll              │ Can do anytime (if free)       │
│ Sequential learning      │ Independent practice           │
└──────────────────────────┴────────────────────────────────┘

LESSON vs EXERCISE:
┌──────────────────────────┬────────────────────────────────┐
│ LESSON                   │ EXERCISE                       │
├──────────────────────────┼────────────────────────────────┤
│ Part of course structure │ Independent entity             │
│ Teaching content         │ Testing/Practice               │
│ Video/Article/Theory     │ Questions only                 │
│ Watch & learn            │ Answer & get scored            │
│ No scoring               │ Automatic grading              │
└──────────────────────────┴────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════
DATABASE TABLES SUMMARY
═══════════════════════════════════════════════════════════════════════════════

Course Service (course_db):
  - courses              (khóa học)
  - modules              (chương)
  - lessons              (bài học)
  - lesson_videos        (video của bài học)
  - lesson_materials     (tài liệu download)
  - course_enrollments   (đăng ký khóa học)
  - lesson_progress      (tiến độ học)

Exercise Service (exercise_db):
  - exercises            (bài tập/đề thi)
  - exercise_sections    (phần của bài tập)
  - questions            (câu hỏi)
  - question_options     (đáp án choices)
  - question_answers     (đáp án đúng)
  - submissions          (bài làm của user)
  - submission_answers   (câu trả lời của user)
  - tags                 (tags cho exercises)

═══════════════════════════════════════════════════════════════════════════════
API ENDPOINTS CHEAT SHEET
═══════════════════════════════════════════════════════════════════════════════

COURSE SERVICE (http://localhost:8080/api/v1):
  GET    /courses                    # List courses
  GET    /courses/:id                # Course detail (with modules & lessons)
  GET    /lessons/:id                # Lesson detail (with videos)
  POST   /enrollments                # Enroll in course
  GET    /enrollments/my             # My enrollments
  PUT    /progress/lessons/:id       # Update lesson progress

EXERCISE SERVICE (http://localhost:8080/api/v1):
  GET    /exercises                  # List exercises (with filters)
  GET    /exercises/:id              # Exercise detail
  POST   /exercises/:id/start        # Start exercise
  POST   /submissions                # Submit new submission
  PUT    /submissions/:id/answers    # Submit answers
  GET    /submissions/:id/result     # Get result
  GET    /submissions/my             # My submissions

ADMIN ENDPOINTS:
  POST   /admin/courses              # Create course
  POST   /admin/modules              # Create module
  POST   /admin/lessons              # Create lesson
  POST   /admin/lessons/:id/videos   # Add video to lesson
  POST   /admin/exercises            # Create exercise
  POST   /admin/questions            # Create question

═══════════════════════════════════════════════════════════════════════════════
EXAMPLE SCENARIO
═══════════════════════════════════════════════════════════════════════════════

User: "bisosad" muốn học IELTS Listening

1. Browse Courses:
   → Thấy "IELTS Listening for Beginners" (course_id: a1234...)
   
2. Enroll:
   → POST /enrollments { course_id: "a1234..." }
   
3. View Course:
   → GET /courses/a1234...
   → Response:
     {
       course: {...},
       modules: [
         {
           module: { id: "mod1", title: "Basic Skills" },
           lessons: [
             { 
               id: "les1", 
               title: "Introduction", 
               content_type: "video",
               videos: [{ duration_seconds: 379, video_id: "OPBd86A1Rfo" }]
             },
             { 
               id: "les2", 
               title: "Practice Exercise",
               content_type: "exercise",
               // Link to exercise
             }
           ]
         }
       ]
     }
   
4. Watch Video Lesson:
   → Navigate to /courses/a1234.../lessons/les1
   → YouTube video plays with duration "6m 19s" (auto-fetched)
   → Update progress: PUT /progress/lessons/les1
   
5. Do Practice Exercise:
   → From lesson, click "Practice Exercise"
   → Or go to /exercises and browse
   → Start exercise: POST /exercises/{exercise_id}/start
   → Submit answers: PUT /submissions/{sub_id}/answers
   → Get score: GET /submissions/{sub_id}/result

═══════════════════════════════════════════════════════════════════════════════
TÓM TẮT
═══════════════════════════════════════════════════════════════════════════════

🎓 COURSE = Khóa học có cấu trúc (structured learning)
   └── MODULE = Chương/phần
       └── LESSON = Bài học (video/article/quiz)
           └── VIDEO = Nội dung video (YouTube)

✍️ EXERCISE = Bài tập/đề thi độc lập (practice/testing)
   └── SECTION = Phần (Part 1, Part 2...)
       └── QUESTION = Câu hỏi
           └── ANSWER = Câu trả lời

📊 SUBMISSION = Bài làm của user khi làm exercise

Relationship:
  - Course CÓ THỂ có lesson link đến exercise
  - Exercise CÓ THỂ standalone hoặc linked to lesson
  - User có thể làm exercise mà KHÔNG CẦN enroll course
  - Nhưng nếu exercise linked trong course → có thể yêu cầu enrollment

═══════════════════════════════════════════════════════════════════════════════

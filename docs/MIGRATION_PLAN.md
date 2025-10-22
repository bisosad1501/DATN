# Migration Plan: Separate Lessons and Exercises

## 📋 Overview

**Goal:** Tách riêng Lesson (nội dung học) và Exercise (bài tập) để tối ưu trải nghiệm người dùng.

**Current State:**
- ❌ Exercise là một loại Lesson (`lessons.content_type = 'exercise'`)
- ❌ Exercise có `lesson_id` foreign key
- ❌ Lesson có `completion_criteria` JSONB chứa `exercise_id`
- ❌ UI hiển thị rối, user không phân biệt được lesson vs exercise

**Target State:**
- ✅ Lesson chỉ có `content_type`: `video`, `article`
- ✅ Exercise có `module_id` foreign key (thay vì `lesson_id`)
- ✅ Module có `total_lessons` và `total_exercises` riêng biệt
- ✅ UI hiển thị rõ ràng: Lessons (học) vs Exercises (luyện tập)

---

## 🗂️ Files Changed

### ✅ COMPLETED

#### Database Migrations
- [x] `database/migrations/008_separate_lessons_and_exercises.sql` - Main migration
- [x] `database/migrations/009_update_seed_data_exercises.sql` - Documentation
- [x] `database/migrations/010_reseed_with_new_structure.sql` - Reseed script

#### Seed Data
- [x] `database/seed_free_courses_complete.sql` - Updated Listening & Reading courses
- [ ] `database/seed_free_exercises.sql` - Need to update (use migration 010 instead)

#### Backend - Course Service
- [x] `services/course-service/internal/models/models.go` - Added `TotalExercises` to Module
- [x] `services/course-service/internal/models/dto.go` - Added `ExerciseSummary` and updated `ModuleWithLessons`
- [x] `services/course-service/internal/config/config.go` - Added `ExerciseServiceURL`
- [x] `services/course-service/internal/service/course_service.go` - Added `exerciseClient`, updated `GetCourseDetail`
- [x] `services/course-service/internal/repository/course_repository.go` - Updated `GetModulesByCourseID` to fetch `total_exercises`
- [x] `services/course-service/cmd/main.go` - Injected `ExerciseServiceClient`

#### Shared Client
- [x] `shared/pkg/client/exercise_service_client.go` - Created client for Exercise Service

#### Scripts
- [x] `scripts/run-migration-008.sh` - Script to run migration 008
- [x] `scripts/run-migration-010.sh` - Script to reseed database
- [x] `scripts/update-seed-exercises.sh` - Script to update seed files (not needed if using migration 010)

### ⏳ IN PROGRESS

#### Backend - Exercise Service
- [ ] `services/exercise-service/internal/models/models.go` - Add `ModuleID` field
- [ ] `services/exercise-service/internal/models/dto.go` - Add `ModuleID` to `ExerciseListQuery`
- [ ] `services/exercise-service/internal/repository/exercise_repository.go` - Support `module_id` filter
- [ ] `services/exercise-service/internal/handlers/exercise_handler.go` - Parse `module_id` query param

### 📝 TODO

#### Frontend
- [ ] `Frontend-IELTSGo/lib/api/courses.ts` - Update type definitions for new API response
- [ ] `Frontend-IELTSGo/app/courses/[courseId]/page.tsx` - Display exercises separately from lessons
- [ ] `Frontend-IELTSGo/app/courses/[courseId]/lessons/[lessonId]/page.tsx` - Update sidebar to show exercises
- [ ] `Frontend-IELTSGo/types/course.ts` - Update Course, Module types

#### Testing
- [ ] Test migration 008 on local database
- [ ] Test migration 010 (reseed)
- [ ] Test Course Service API `/api/v1/courses/:id`
- [ ] Test Exercise Service API `/api/v1/exercises?module_id=xxx`
- [ ] Test Frontend UI - Course Detail page
- [ ] Test Frontend UI - Lesson Detail page (sidebar)

---

## 🚀 Deployment Steps

### Step 1: Prepare Migration (DONE)
```bash
# All migration files created
✅ database/migrations/008_separate_lessons_and_exercises.sql
✅ database/migrations/010_reseed_with_new_structure.sql
✅ scripts/run-migration-008.sh
✅ scripts/run-migration-010.sh
```

### Step 2: Update Backend Code (IN PROGRESS)
```bash
# Course Service - DONE
✅ Updated models, DTOs, service, repository
✅ Added ExerciseServiceClient
✅ Updated main.go to inject client

# Exercise Service - TODO
⏳ Add ModuleID field
⏳ Support module_id filter
```

### Step 3: Run Migration
```bash
# Backup database first!
pg_dump -h localhost -U ielts_admin course_db > backup_course_db_$(date +%Y%m%d).sql
pg_dump -h localhost -U ielts_admin exercise_db > backup_exercise_db_$(date +%Y%m%d).sql

# Run migration 008 (if data exists)
./scripts/run-migration-008.sh

# OR run migration 010 (clean reseed)
./scripts/run-migration-010.sh
```

### Step 4: Update Frontend
```bash
# Update type definitions
# Update API calls
# Update UI components
```

### Step 5: Test
```bash
# Start all services
docker-compose up -d

# Test APIs
curl http://localhost:8080/api/v1/courses/f1111111-1111-1111-1111-111111111111

# Test Frontend
open http://localhost:3000/courses/f1111111-1111-1111-1111-111111111111
```

---

## 📊 API Response Changes

### Before (Old Structure)
```json
{
  "course": {...},
  "modules": [
    {
      "module": {
        "id": "...",
        "title": "Module 1",
        "total_lessons": 5
      },
      "lessons": [
        {"id": "...", "title": "Video Lesson", "content_type": "video"},
        {"id": "...", "title": "Exercise 1", "content_type": "exercise"}
      ]
    }
  ]
}
```

### After (New Structure)
```json
{
  "course": {...},
  "modules": [
    {
      "module": {
        "id": "...",
        "title": "Module 1: Getting Started",
        "total_lessons": 5,
        "total_exercises": 0
      },
      "lessons": [
        {"id": "...", "title": "Video Lesson", "content_type": "video"},
        {"id": "...", "title": "Article Lesson", "content_type": "article"}
      ],
      "exercises": []
    },
    {
      "module": {
        "id": "...",
        "title": "Module 2: Practice Exercises",
        "total_lessons": 1,
        "total_exercises": 4
      },
      "lessons": [
        {"id": "...", "title": "Review & Tips", "content_type": "article"}
      ],
      "exercises": [
        {
          "id": "...",
          "title": "Exercise 1: Form Completion",
          "skill_type": "listening",
          "difficulty": "easy",
          "total_questions": 5,
          "time_limit_minutes": 10,
          "display_order": 1
        },
        {
          "id": "...",
          "title": "Exercise 2: Multiple Choice",
          "skill_type": "listening",
          "difficulty": "easy",
          "total_questions": 5,
          "time_limit_minutes": 10,
          "display_order": 2
        }
      ]
    }
  ]
}
```

---

## ⚠️ Risks & Mitigation

### Risk 1: Data Loss
**Mitigation:**
- ✅ Created backup tables in migration 008
- ✅ Created rollback script
- ✅ Test on local database first

### Risk 2: Breaking Frontend
**Mitigation:**
- ⏳ Update frontend types before deployment
- ⏳ Test all pages that use course data
- ⏳ Add error handling for missing data

### Risk 3: Service Communication Failure
**Mitigation:**
- ✅ Added retry logic in ServiceClient
- ✅ Added error logging
- ⏳ Add fallback: if Exercise Service fails, return empty exercises array

---

## 📝 Next Immediate Steps

1. **Update Exercise Service** (15 mins)
   - Add `ModuleID` field to Exercise model
   - Add `module_id` filter support
   - Test API: `GET /api/v1/exercises?module_id=xxx`

2. **Test Backend Integration** (10 mins)
   - Start Course Service + Exercise Service
   - Test: `GET /api/v1/courses/:id`
   - Verify exercises are returned in response

3. **Run Migration** (5 mins)
   - Run migration 010 to reseed database
   - Verify data structure

4. **Update Frontend** (30 mins)
   - Update types
   - Update Course Detail page
   - Update Lesson Detail sidebar

5. **End-to-End Testing** (20 mins)
   - Test full user flow
   - Test instructor/admin CRUD

**Total Estimated Time:** ~1.5 hours

---

## ✅ Success Criteria

- [ ] Migration runs successfully without errors
- [ ] Course API returns exercises in separate array
- [ ] Exercise API supports `module_id` filter
- [ ] Frontend displays lessons and exercises separately
- [ ] User can distinguish between learning content and practice exercises
- [ ] All existing functionality still works (enrollment, progress tracking, etc.)
- [ ] No data loss
- [ ] Rollback script works if needed


# ============================================
# Database Schema Documentation
# ============================================

## Tổng quan

Hệ thống IELTS Learning Platform sử dụng kiến trúc microservices với **Database per Service pattern**. Mỗi service có database riêng biệt để đảm bảo tính độc lập và khả năng mở rộng.

## Các Database

### 1. **auth_db** - Authentication Service
**Mục đích**: Quản lý xác thực, phân quyền, JWT tokens

**Tables**:
- `users` - Thông tin đăng nhập cơ bản (email, password)
- `roles` - Vai trò: student, instructor, admin
- `permissions` - Quyền hạn chi tiết
- `user_roles` - Mapping users ↔ roles (many-to-many)
- `role_permissions` - Mapping roles ↔ permissions
- `refresh_tokens` - JWT refresh tokens
- `password_reset_tokens` - Tokens reset mật khẩu
- `email_verification_tokens` - Tokens xác thực email
- `audit_logs` - Log các sự kiện authentication

**Key Features**:
- JWT-based authentication
- Role-based access control (RBAC)
- Refresh token rotation
- Account security (failed login attempts, account locking)
- Audit logging

---

### 2. **user_db** - User Service
**Mục đích**: Quản lý profile, tiến trình học tập, thống kê

**Tables**:
- `user_profiles` - Thông tin chi tiết người dùng
- `learning_progress` - Tiến trình học tổng thể
- `skill_statistics` - Thống kê từng kỹ năng (Listening, Reading, Writing, Speaking)
- `study_sessions` - Lịch sử các session học
- `study_goals` - Mục tiêu học tập người dùng
- `achievements` - Danh sách thành tựu
- `user_achievements` - Thành tựu đã đạt được
- `user_preferences` - Cài đặt ứng dụng
- `study_reminders` - Nhắc nhở học tập

**Key Features**:
- Comprehensive user profiles
- Learning analytics & statistics
- Streak tracking
- Goal setting & tracking
- Achievement system
- Personalized recommendations

---

### 3. **course_db** - Course Service
**Mục đích**: Quản lý khóa học, bài giảng, video, tài liệu

**Tables**:
- `courses` - Khóa học chính
- `modules` - Các module trong khóa học
- `lessons` - Bài học cụ thể
- `lesson_videos` - Video bài giảng
- `video_subtitles` - Phụ đề video
- `lesson_materials` - Tài liệu bài học (PDF, docs)
- `course_enrollments` - Đăng ký khóa học
- `lesson_progress` - Tiến trình từng bài học
- `video_watch_history` - Lịch sử xem video
- `course_reviews` - Đánh giá khóa học
- `course_categories` - Danh mục khóa học
- `course_category_mapping` - Mapping courses ↔ categories

**Key Features**:
- Hierarchical course structure (Course → Module → Lesson)
- Video management with subtitles
- Progress tracking per lesson
- Course reviews & ratings
- Free vs premium content
- Instructor management

---

### 4. **exercise_db** - Exercise Service
**Mục đích**: Bài tập Listening & Reading, câu hỏi, chấm điểm tự động

**Tables**:
- `exercises` - Bài tập/đề thi chính
- `exercise_sections` - Các phần (Part 1, 2, 3, 4)
- `questions` - Câu hỏi cụ thể
- `question_options` - Lựa chọn cho multiple choice
- `question_answers` - Đáp án đúng
- `user_exercise_attempts` - Lịch sử làm bài
- `user_answers` - Câu trả lời của học viên
- `question_bank` - Ngân hàng câu hỏi tái sử dụng
- `exercise_tags` - Tags phân loại bài tập
- `exercise_tag_mapping` - Mapping exercises ↔ tags
- `exercise_analytics` - Thống kê bài tập

**Supported Question Types**:
- Multiple choice
- True/False/Not Given
- Matching
- Fill in the blank
- Sentence completion
- Diagram labeling

**Key Features**:
- Auto-grading for Listening & Reading
- Band score calculation
- Question bank for reusability
- Detailed analytics per question
- Time tracking
- Section-based exercises

---

### 5. **ai_db** - AI Service
**Mục đích**: AI chấm điểm Writing & Speaking

**Tables**:
- `writing_submissions` - Bài Writing được nộp
- `writing_evaluations` - Kết quả đánh giá Writing
- `speaking_submissions` - Bài Speaking (audio)
- `speaking_evaluations` - Kết quả đánh giá Speaking
- `writing_prompts` - Ngân hàng đề Writing
- `speaking_prompts` - Ngân hàng đề Speaking
- `grading_criteria` - Tiêu chí chấm điểm IELTS
- `ai_model_versions` - Tracking AI model versions
- `evaluation_feedback_ratings` - User feedback về AI
- `ai_processing_queue` - Hàng đợi xử lý AI

**Writing Evaluation Criteria** (IELTS):
- Task Achievement
- Coherence and Cohesion
- Lexical Resource
- Grammatical Range and Accuracy

**Speaking Evaluation Criteria** (IELTS):
- Fluency and Coherence
- Lexical Resource
- Grammatical Range and Accuracy
- Pronunciation

**Key Features**:
- Speech-to-Text for Speaking
- NLP-based evaluation
- Detailed feedback & suggestions
- Grammar & vocabulary analysis
- Pronunciation analysis
- Processing queue with retry mechanism
- Model versioning

---

### 6. **notification_db** - Notification Service
**Mục đích**: Quản lý thông báo, push notifications, emails

**Tables**:
- `notifications` - Tất cả thông báo
- `push_notifications` - Push notifications (Android/iOS)
- `email_notifications` - Email notifications
- `device_tokens` - Device tokens cho push
- `notification_preferences` - Tùy chọn nhận thông báo
- `notification_templates` - Mẫu thông báo
- `notification_logs` - Log chi tiết
- `scheduled_notifications` - Thông báo định kỳ

**Notification Types**:
- Achievement unlocked
- Study reminders
- Course updates
- Exercise graded
- System announcements

**Key Features**:
- Multi-channel delivery (push, email, in-app)
- Template-based notifications
- User preferences & quiet hours
- Scheduled & recurring notifications
- Delivery tracking
- Rate limiting

---

## Inter-Service Communication

### Synchronous Communication
- REST API calls between services
- API Gateway routes requests to appropriate services

### Asynchronous Communication (RabbitMQ)
- Event-driven architecture
- Example events:
  - `user.registered` → Trigger welcome email
  - `exercise.completed` → Update progress, check achievements
  - `course.enrolled` → Send confirmation email
  - `ai.evaluation.completed` → Notify user

---

## Data Consistency Patterns

### 1. **Eventual Consistency**
- Services communicate via events
- Example: User completes exercise → Event published → User service updates statistics

### 2. **Shared Data (Minimal)**
- `user_id` is shared across all services (from auth_db)
- Services query auth service for user validation

### 3. **API Composition**
- API Gateway aggregates data from multiple services
- Example: User Dashboard = User Service + Course Service + Exercise Service data

---

## Scaling Considerations

### Vertical Scaling
- Each database can be scaled independently
- Use PostgreSQL replication for read-heavy services

### Horizontal Scaling
- Services are stateless and can be replicated
- Use Redis for distributed caching
- Use RabbitMQ for load distribution

### Database Optimization
- Proper indexing on frequently queried columns
- Materialized views for complex analytics
- Partitioning for large tables (e.g., audit_logs, notification_logs)

---

## Backup & Recovery

### Backup Strategy
```bash
# Backup all databases
docker exec ielts_postgres pg_dumpall -U ielts_admin > backup_all.sql

# Backup specific database
docker exec ielts_postgres pg_dump -U ielts_admin auth_db > backup_auth.sql
```

### Restore Strategy
```bash
# Restore all databases
docker exec -i ielts_postgres psql -U ielts_admin < backup_all.sql

# Restore specific database
docker exec -i ielts_postgres psql -U ielts_admin -d auth_db < backup_auth.sql
```

---

## Migration Strategy

### Automatic (Recommended)
```bash
./setup.sh      # Initial setup - runs ALL migrations
./update.sh     # Update code - runs NEW migrations only
```

### Manual
```bash
# Run all migrations
./scripts/run-all-migrations.sh

# Via Docker
docker-compose up migrations

# Check applied migrations
docker exec -i ielts_postgres psql -U ielts_admin -d course_db -c \
  "SELECT * FROM schema_migrations ORDER BY applied_at DESC LIMIT 5;"
```

### Migration Files
- Location: `database/migrations/*.sql`
- Naming: `XXX_descriptive_name.sql` (001, 002, 003, ...)
- Tracking: `schema_migrations` table in each database
- Docs: `database/migrations/README_MIGRATION_*.md`

### Current Migrations
- **011**: Remove `video_watch_percentage` field
- **012**: Enable dblink extension (cross-DB queries for reviews)

### Creating New Migrations
1. Find next number: `ls database/migrations/*.sql | tail -1`
2. Create file: `013_your_feature.sql`
3. Write SQL changes
4. Create rollback: `013_your_feature.rollback.sql` (optional)
5. Create README: `README_MIGRATION_013.md` (if complex)
6. Test locally, commit, push
7. Team runs `./update.sh` → auto-apply

---

## Security Best Practices

1. **Encrypted Connections**: Use SSL/TLS for database connections in production
2. **Least Privilege**: Each service has separate DB user with minimal permissions
3. **Password Security**: Use strong passwords, rotate regularly
4. **SQL Injection Prevention**: Use parameterized queries
5. **Audit Logging**: Track all sensitive operations
6. **Data Encryption**: Encrypt sensitive data at rest (PII, passwords)
7. **Backup Encryption**: Encrypt backup files

---

## Monitoring & Observability

### Metrics to Track
- Query performance (slow queries)
- Connection pool usage
- Database size growth
- Replication lag (if using replication)
- Error rates

### Tools
- **Prometheus** + **Grafana** for metrics visualization
- **pg_stat_statements** for query analysis
- **PgHero** for database health monitoring

---

## FAQ

### Q: Tại sao dùng nhiều database thay vì một database?
**A**: Kiến trúc microservices yêu cầu mỗi service độc lập. Nếu dùng chung DB:
- Khó scale từng service riêng
- Thay đổi schema ảnh hưởng nhiều services
- Services phụ thuộc lẫn nhau
- Khó deploy độc lập

### Q: Làm sao query data từ nhiều services?
**A**: 
- **API Composition**: API Gateway gọi nhiều services và merge kết quả
- **CQRS**: Tạo read-only replica aggregate data
- **Event Sourcing**: Rebuild state từ events

### Q: Performance có bị ảnh hưởng không?
**A**: 
- Có overhead nhỏ do network calls
- Giải pháp: Caching (Redis), Connection pooling, Load balancing
- Trade-off: Hy sinh một chút performance để đổi lấy scalability & maintainability

---

## Next Steps

1. ✅ Database schemas đã hoàn thiện
2. 🔄 Tiếp theo: Implement Go services
3. 🔄 Tạo API endpoints
4. 🔄 Implement business logic
5. 🔄 Write tests
6. 🔄 Deploy & monitor

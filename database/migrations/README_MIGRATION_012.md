# Migration 012: Enable dblink Extension

**Purpose:** Enable cross-database JOIN để hiển thị user info trong reviews  
**Database:** `course_db`  
**Date:** 2025-10-30

---

## Tại Sao Cần?

Reviews cần hiển thị tên user, nhưng data nằm ở 3 databases khác nhau:
- `auth_db.users` → email
- `user_db.user_profiles` → full_name, avatar
- `course_db.course_reviews` → review data

→ Cần `dblink` extension để JOIN giữa databases.

---

## Cách Chạy

### Tự động (Recommended)
```bash
./setup.sh      # hoặc
./update.sh     # hoặc
./scripts/run-all-migrations.sh
```

### Manual
```bash
./scripts/run-migration-012.sh

# hoặc
docker exec -i ielts_postgres psql -U ielts_admin -d course_db < \
  database/migrations/012_enable_dblink_for_cross_database_queries.sql
```

---

## Verify

```bash
# Check extension installed
docker exec -i ielts_postgres psql -U ielts_admin -d course_db -c \
  "SELECT * FROM pg_extension WHERE extname = 'dblink';"

# Test cross-database query
docker exec -i ielts_postgres psql -U ielts_admin -d course_db -c \
  "SELECT * FROM dblink('dbname=user_db user=ielts_admin', 'SELECT 1') AS t(x INTEGER);"
```

Expected: Extension exists, query returns 1 row.

---

## Impact

### Before:
```json
{
  "user_id": "uuid-here",
  "user_name": null,     // ❌ Missing
  "user_email": null     // ❌ Missing
}
```
→ Frontend shows "04" (UUID initials) as avatar

### After:
```json
{
  "user_id": "uuid-here",
  "user_name": "John Doe",      // ✅ From user_db
  "user_email": "john@test.com" // ✅ From auth_db
}
```
→ Frontend shows "JD" (real initials) + user name

---

## Rollback

```bash
docker exec -i ielts_postgres psql -U ielts_admin -d course_db < \
  database/migrations/012_enable_dblink_for_cross_database_queries.rollback.sql
```

⚠️ WARNING: Review API sẽ lỗi sau khi rollback.

---

## Files

- `012_enable_dblink_for_cross_database_queries.sql` - Migration
- `012_enable_dblink_for_cross_database_queries.rollback.sql` - Rollback
- `scripts/run-migration-012.sh` - Standalone script
- `README_MIGRATION_012.md` - This file

---

**Status:** ✅ Production Ready  
**Auto-Applied:** YES (via setup.sh / update.sh)

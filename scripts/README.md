# Scripts Directory

Scripts hữu ích cho development và operations.

---

## 🚀 Setup & Migrations

```bash
run-all-migrations.sh          # Chạy TẤT CẢ migrations (dùng bởi setup.sh/update.sh)
run-migration-012.sh           # Migration 012 standalone (dblink extension)
```

---

## 🗄️ Database Operations

```bash
check-and-init-db.sh           # Check & initialize databases
check-db-records.sh            # Check database records count
wait-for-postgres.sh           # Wait for PostgreSQL to be ready
```

---

## 🌱 Seed Data

```bash
seed-free-courses.sh           # Seed free courses
seed-more-courses.sh           # Seed additional courses
seed-exercise-data.sh          # Seed exercise data
seed-complete-relationships.sh # Seed relationships (enrollments, progress)
```

---

## 🔄 Sync Operations

```bash
sync_youtube_durations.sh      # Sync video durations from YouTube API
sync_module_exercise_counts.sh # Sync exercise counts per module
```

---

## 🧪 Testing

### Comprehensive Tests (Recommended)
```bash
test-all.sh                         # Run ALL tests
test-complete-system.sh             # Full system integration test
test-integration-complete.sh        # Complete integration tests
test-gateway-complete.sh            # API Gateway tests
```

### Service-Specific Tests
```bash
test-auth-comprehensive.sh          # Auth Service
test-user-service-comprehensive.sh  # User Service
test-course-comprehensive.sh        # Course Service
test-exercise-comprehensive.sh      # Exercise Service
test-notification-comprehensive.sh  # Notification Service
```

### Quick Tests
```bash
test-auth-api.sh                    # Quick auth API test
test-user-manual.sh                 # Manual user test
test-exercises-api.sh               # Exercise API test
test-notification-quick.sh          # Quick notification test
test-youtube-integration.sh         # YouTube integration test
test-exercise-new-features.sh       # New exercise features
```

### Utilities
```bash
health-check.sh                     # Check all services health
test-internal-endpoints.sh          # Test internal APIs
quick-test-reference.sh             # Quick reference test
```

---

## 🔧 Development

```bash
start-services-dev.sh              # Start services in dev mode
create-admin-for-test.sh           # Create admin user for testing
```

---

## 📋 Usage Examples

### Initial Setup
```bash
# From project root
./setup.sh                         # Uses run-all-migrations.sh internally
```

### Daily Development
```bash
# Pull new code
./update.sh                        # Uses run-all-migrations.sh internally

# Run tests
./scripts/test-all.sh

# Check health
./scripts/health-check.sh
```

### Seed Test Data
```bash
./scripts/seed-free-courses.sh
./scripts/seed-exercise-data.sh
```

### Manual Migration
```bash
./scripts/run-all-migrations.sh
```

---

## ⚠️ Notes

- **Most scripts require Docker services to be running**
- **Test scripts may modify database** - use with caution in production
- **Seed scripts are idempotent** - safe to run multiple times

---

**Last Updated:** 2025-10-30


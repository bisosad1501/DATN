# 📚 Documentation Structure

## Main Docs (Root Level)

```
├── README.md                    ⭐ BẮT ĐẦU TẠI ĐÂY
├── QUICK_START.md               Alternative setup guide
├── TEAM_SETUP.md                Setup guide cho team
├── setup.sh                     Script setup tự động
└── update.sh                    Script update code + migrations
```

## Database Docs

```
database/
├── README.md                           Database overview + Migration guide
└── migrations/
    ├── 001-010_*.sql                   Migration files
    ├── 011_remove_video_watch_percentage.sql
    ├── 012_enable_dblink_for_cross_database_queries.sql
    └── README_MIGRATION_012.md         Migration-specific docs
```

## Technical Docs

```
docs/
├── MIGRATION_PLAN.md                   System architecture
├── DATA_MODEL_RELATIONSHIPS.md         Database relationships
├── GOOGLE_OAUTH_SETUP.md               OAuth setup
└── YOUTUBE_API_SETUP.md                YouTube integration
```

## Frontend Docs

```
Frontend-IELTSGo/
├── README.md                           Frontend overview
├── SETUP_GUIDE.md                      Detailed setup
├── ARCHITECTURE.md                     Frontend architecture
└── BRAND_TEXT_GUIDE.md                 UI/UX guidelines
```

---

## Quick Reference

**Cần setup lần đầu?**  
→ `README.md` → `./setup.sh`

**Pull code mới?**  
→ `./update.sh`

**Làm việc với database?**  
→ `database/README.md`

**Tạo migration mới?**  
→ `database/README.md` (section "Creating New Migrations")

**Hiểu system architecture?**  
→ `docs/MIGRATION_PLAN.md`

---

**Last Updated:** 2025-10-30


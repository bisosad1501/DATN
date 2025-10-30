#!/bin/bash

# ============================================
# Migration 012: Enable dblink Extension
# ============================================
# Purpose: Enable cross-database queries for course reviews
# Date: 2025-10-30
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "======================================"
echo "🚀 Running Migration 012: Enable dblink"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if migration file exists
MIGRATION_FILE="$PROJECT_ROOT/database/migrations/012_enable_dblink_for_cross_database_queries.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

# Check if container is running
if ! docker ps | grep -q "ielts_postgres"; then
    echo -e "${RED}❌ PostgreSQL container 'ielts_postgres' is not running${NC}"
    echo "Please start it with: docker-compose up -d postgres"
    exit 1
fi

echo -e "${YELLOW}📋 Migration Details:${NC}"
echo "   Database: course_db"
echo "   Action: Install dblink extension"
echo "   Purpose: Enable cross-database JOIN for user info in reviews"
echo ""

# Check if extension already exists
EXISTING=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc \
    "SELECT COUNT(*) FROM pg_extension WHERE extname = 'dblink';")

if [ "$EXISTING" -eq "1" ]; then
    echo -e "${YELLOW}⚠️  dblink extension already exists${NC}"
    read -p "Do you want to re-run the migration? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Migration skipped."
        exit 0
    fi
fi

echo -e "${YELLOW}🔧 Running migration...${NC}"
cat "$MIGRATION_FILE" | docker exec -i ielts_postgres psql -U ielts_admin -d course_db

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migration 012 completed successfully!${NC}"
    echo ""
    
    # Verify installation
    echo -e "${YELLOW}🔍 Verifying installation...${NC}"
    VERIFY=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc \
        "SELECT extname, extversion FROM pg_extension WHERE extname = 'dblink';")
    
    if [ -n "$VERIFY" ]; then
        echo -e "${GREEN}✅ dblink extension installed: $VERIFY${NC}"
    else
        echo -e "${RED}❌ Verification failed${NC}"
        exit 1
    fi
    
    # Test cross-database query
    echo ""
    echo -e "${YELLOW}🧪 Testing cross-database query...${NC}"
    TEST_RESULT=$(docker exec ielts_postgres psql -U ielts_admin -d course_db -tAc \
        "SELECT COUNT(*) FROM dblink('dbname=user_db user=ielts_admin', 'SELECT 1') AS t(x INTEGER);" 2>&1)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Cross-database query test passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Cross-database query test: $TEST_RESULT${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}======================================"
    echo "✅ Migration 012 Setup Complete!"
    echo "======================================${NC}"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Restart Course Service: docker-compose restart course-service"
    echo "   2. Test reviews API: curl http://localhost:8080/api/v1/courses/{id}/reviews"
    echo "   3. Check frontend: Reviews should now show user names"
    echo ""
    echo "📚 Documentation: database/migrations/README_MIGRATION_012.md"
    echo ""
else
    echo -e "${RED}❌ Migration failed!${NC}"
    echo "Check the error messages above for details."
    exit 1
fi


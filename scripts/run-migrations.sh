#!/bin/bash

# Database Migration Script
# This script applies all pending migrations to the exercise_db database

set -e  # Exit on error

echo "========================================="
echo "DATABASE MIGRATION - EXERCISE SERVICE"
echo "========================================="

# Database connection details
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_NAME="exercise_db"
DB_USER=${DB_USER:-ielts_admin}
PGPASSWORD=${PGPASSWORD:-ielts_password_2025}
DB_CONTAINER="ielts_postgres"

MIGRATION_DIR="/migrations"

export PGPASSWORD

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Checking database connection...${NC}"

# Check if we're inside Docker container or running locally
if [ -f /.dockerenv ]; then
    echo -e "${GREEN}✅ Running inside Docker container${NC}"
    PSQL_CMD="psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}"
elif docker ps | grep -q $DB_CONTAINER; then
    echo -e "${GREEN}✅ Using Docker container: ${DB_CONTAINER}${NC}"
    PSQL_CMD="docker exec -i ${DB_CONTAINER} psql -U ${DB_USER} -d ${DB_NAME}"
else
    echo -e "${YELLOW}Using local PostgreSQL${NC}"
    PSQL_CMD="PGPASSWORD=${PGPASSWORD} psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}"
fi

# Create migrations tracking table if not exists
echo -e "${YELLOW}Creating migrations tracking table...${NC}"
$PSQL_CMD << EOF
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_file VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

echo -e "${GREEN}✅ Migrations tracking table ready${NC}"

# Find and apply migrations
echo -e "\n${YELLOW}Looking for pending migrations...${NC}"

APPLIED_COUNT=0
SKIPPED_COUNT=0

for migration_file in $(ls ${MIGRATION_DIR}/*.sql | sort); do
    filename=$(basename "$migration_file")
    
    # Check if migration already applied
    already_applied=$($PSQL_CMD -t -c "SELECT COUNT(*) FROM schema_migrations WHERE migration_file = '${filename}';" | tr -d ' ')
    
    if [ "$already_applied" -gt 0 ]; then
        echo -e "${YELLOW}⏭️  SKIP: ${filename} (already applied)${NC}"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    else
        echo -e "${GREEN}📝 APPLYING: ${filename}${NC}"
        
        # Apply migration
        if $PSQL_CMD < "$migration_file"; then
            # Record successful migration
            $PSQL_CMD -c "INSERT INTO schema_migrations (migration_file) VALUES ('${filename}');"
            echo -e "${GREEN}✅ SUCCESS: ${filename}${NC}"
            APPLIED_COUNT=$((APPLIED_COUNT + 1))
        else
            echo -e "${RED}❌ FAILED: ${filename}${NC}"
            echo -e "${RED}Migration failed! Please fix the error and try again.${NC}"
            exit 1
        fi
    fi
done

echo ""
echo "========================================="
echo "MIGRATION SUMMARY"
echo "========================================="
echo -e "Applied: ${GREEN}${APPLIED_COUNT}${NC}"
echo -e "Skipped: ${YELLOW}${SKIPPED_COUNT}${NC}"
echo -e "${GREEN}✅ All migrations completed successfully!${NC}"

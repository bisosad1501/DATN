#!/bin/bash
# check-and-init-db.sh
# Script này kiểm tra và tạo database nếu chưa tồn tại

set -e

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-ielts_admin}"
DB_PASSWORD="${DB_PASSWORD:-ielts_password_2025}"
DB_NAME="${DB_NAME:-auth_db}"

echo "🔍 Checking if database '$DB_NAME' exists..."

# Wait for PostgreSQL to be ready
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c '\q' 2>/dev/null; do
  echo "⏳ Waiting for PostgreSQL to be ready..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Check if database exists
DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo "✅ Database '$DB_NAME' already exists"
else
    echo "📦 Creating database '$DB_NAME'..."
    PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE $DB_NAME;"
    echo "✅ Database '$DB_NAME' created successfully!"
    
    # If schema file exists, run it
    SCHEMA_FILE="/schemas/01_auth_service.sql"
    if [ -f "$SCHEMA_FILE" ]; then
        echo "📋 Running schema initialization..."
        PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"
        echo "✅ Schema initialized successfully!"
    fi
fi

echo "🚀 Ready to start service!"

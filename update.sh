#!/bin/bash

# =============================================================================
# QUICK UPDATE SCRIPT
# =============================================================================
# For developers who already have the project running
# This script will update services and run new migrations
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}   IELTS PLATFORM - QUICK UPDATE${NC}"
echo -e "${BLUE}=========================================${NC}"

echo ""
echo -e "${YELLOW}🔄 Step 1: Pulling latest code changes...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Not a git repository or pull failed${NC}"

echo ""
echo -e "${YELLOW}🔄 Step 2: Rebuilding changed services...${NC}"
docker-compose build

echo ""
echo -e "${YELLOW}🔄 Step 3: Running database migrations...${NC}"
docker-compose up migrations

echo ""
echo -e "${YELLOW}🔄 Step 4: Restarting services...${NC}"
docker-compose up -d

echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   ✅ UPDATE COMPLETED!${NC}"
echo -e "${GREEN}=========================================${NC}"

echo ""
echo -e "${CYAN}Service Status:${NC}"
docker-compose ps

echo ""
echo -e "${CYAN}Quick Commands:${NC}"
echo -e "  • View logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "  • Run tests: ${GREEN}./scripts/test-all.sh${NC}"
echo -e "  • Check health: ${GREEN}curl http://localhost:8080/health${NC}"

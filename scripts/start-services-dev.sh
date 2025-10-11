#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Starting Services for Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running${NC}"
    echo "Please start PostgreSQL first:"
    echo "  brew services start postgresql@14"
    echo "  OR"
    echo "  docker-compose up -d postgres"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=ielts_admin
export DB_PASSWORD=ielts_password_2025
export JWT_SECRET=your_jwt_secret_key_change_in_production
export INTERNAL_API_KEY=internal_secret_key_ielts_2025_change_in_production

# User Service
export USER_SERVICE_URL=http://localhost:8082
export NOTIFICATION_SERVICE_URL=http://localhost:8085

echo -e "${BLUE}Starting services...${NC}"
echo ""

# Start User Service
echo -e "${YELLOW}1. Starting User Service on port 8082${NC}"
cd services/user-service
DB_NAME=user_db go run cmd/main.go &
USER_SERVICE_PID=$!
echo -e "   PID: ${USER_SERVICE_PID}"
cd ../..
sleep 2

# Start Notification Service
echo -e "${YELLOW}2. Starting Notification Service on port 8085${NC}"
cd services/notification-service
DB_NAME=notification_db SERVER_PORT=8085 go run cmd/main.go &
NOTIFICATION_SERVICE_PID=$!
echo -e "   PID: ${NOTIFICATION_SERVICE_PID}"
cd ../..
sleep 2

# Start Auth Service
echo -e "${YELLOW}3. Starting Auth Service on port 8081${NC}"
cd services/auth-service
DB_NAME=auth_db PORT=8081 go run cmd/main.go &
AUTH_SERVICE_PID=$!
echo -e "   PID: ${AUTH_SERVICE_PID}"
cd ../..
sleep 3

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   All Services Started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Service URLs:"
echo -e "  ${BLUE}Auth Service:${NC}         http://localhost:8081"
echo -e "  ${BLUE}User Service:${NC}         http://localhost:8082"
echo -e "  ${BLUE}Notification Service:${NC} http://localhost:8085"
echo ""
echo -e "PIDs:"
echo -e "  User Service:         ${USER_SERVICE_PID}"
echo -e "  Notification Service: ${NOTIFICATION_SERVICE_PID}"
echo -e "  Auth Service:         ${AUTH_SERVICE_PID}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for interrupt
trap "echo ''; echo 'Stopping services...'; kill ${USER_SERVICE_PID} ${NOTIFICATION_SERVICE_PID} ${AUTH_SERVICE_PID} 2>/dev/null; echo 'Services stopped'; exit 0" INT

# Wait for all background processes
wait

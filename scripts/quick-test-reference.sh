#!/bin/bash

# Quick Test Commands - Copy & Paste

echo "======================================"
echo "   QUICK TEST REFERENCE"
echo "======================================"
echo ""
echo "1. START SERVICES:"
echo "   ./scripts/start-services-dev.sh"
echo ""
echo "2. RUN TESTS (in new terminal):"
echo "   ./scripts/test-internal-endpoints.sh"
echo ""
echo "3. CHECK DATABASE:"
echo "   ./scripts/check-db-records.sh"
echo ""
echo "4. CHECK SPECIFIC USER:"
echo "   ./scripts/check-db-records.sh testuser@example.com"
echo ""
echo "5. QUICK MANUAL TEST - Create Profile:"
echo '   curl -X POST http://localhost:8082/api/v1/user/internal/profile/create \'
echo '     -H "X-Internal-API-Key: internal_secret_key_ielts_2025_change_in_production" \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '"'"'{"user_id":"550e8400-e29b-41d4-a716-446655440000","email":"test@example.com","role":"student","full_name":"Test User"}'"'"''
echo ""
echo "6. QUICK MANUAL TEST - Send Notification:"
echo '   curl -X POST http://localhost:8085/api/v1/notifications/internal/send \'
echo '     -H "X-Internal-API-Key: internal_secret_key_ielts_2025_change_in_production" \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '"'"'{"user_id":"550e8400-e29b-41d4-a716-446655440000","title":"Test","message":"Test message","type":"system","category":"info"}'"'"''
echo ""
echo "7. QUICK MANUAL TEST - Register User (End-to-End):"
echo '   curl -X POST http://localhost:8081/api/v1/auth/register \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '"'"'{"email":"testuser123@example.com","password":"Test123456","role":"student"}'"'"''
echo ""
echo "8. CHECK LOGS:"
echo "   # In service terminals, look for:"
echo "   # [Auth-Service] Successfully created profile..."
echo "   # [Auth-Service] Successfully sent welcome notification..."
echo "   # [Internal] Successfully created profile..."
echo "   # [Internal] Successfully created notification..."
echo ""
echo "9. STOP SERVICES:"
echo "   # Press Ctrl+C in terminal running start-services-dev.sh"
echo ""
echo "10. TROUBLESHOOT:"
echo "   # Check ports:"
echo "   lsof -i :8081 :8082 :8085"
echo ""
echo "   # Check PostgreSQL:"
echo "   pg_isready -h localhost -p 5432"
echo ""
echo "   # Check databases exist:"
echo "   psql -U ielts_admin -h localhost -l | grep -E 'auth_db|user_db|notification_db'"
echo ""
echo "======================================"
echo "For detailed docs: TESTING_INTERNAL_INTEGRATION.md"
echo "======================================"

#!/bin/bash

# Script kiểm tra health của hệ thống

echo "🔍 Đang kiểm tra health của các services..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    
    echo -n "Checking $service_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "200" ] || [ "$response" == "204" ]; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL (HTTP $response)${NC}"
        return 1
    fi
}

# Function to check container status
check_container() {
    local container_name=$1
    
    echo -n "Checking container $container_name... "
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        echo -e "${GREEN}✓ RUNNING${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        return 1
    fi
}

# Counter
success_count=0
total_count=0

echo "📦 Kiểm tra Docker containers:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check infrastructure containers
containers=(
    "ielts_postgres"
    "ielts_redis"
    "ielts_rabbitmq"
    "ielts_pgadmin"
)

for container in "${containers[@]}"; do
    ((total_count++))
    if check_container "$container"; then
        ((success_count++))
    fi
done

echo ""
echo "🌐 Kiểm tra HTTP endpoints:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check HTTP endpoints
services=(
    "PgAdmin:http://localhost:5050"
    "RabbitMQ Management:http://localhost:15672"
)

# Add auth service if container exists
if docker ps --format '{{.Names}}' | grep -q "^ielts_auth_service$"; then
    services+=("Auth Service Health:http://localhost:8001/health")
fi

for service_info in "${services[@]}"; do
    IFS=':' read -r name url <<< "$service_info"
    ((total_count++))
    if check_service "$name" "$url"; then
        ((success_count++))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
echo "📊 Kết quả: $success_count/$total_count services đang hoạt động"
echo ""

if [ $success_count -eq $total_count ]; then
    echo -e "${GREEN}✅ Tất cả services đang hoạt động tốt!${NC}"
    echo ""
    echo "🔗 Truy cập:"
    echo "  • PgAdmin: http://localhost:5050"
    echo "  • RabbitMQ: http://localhost:15672"
    if docker ps --format '{{.Names}}' | grep -q "^ielts_auth_service$"; then
        echo "  • Auth API: http://localhost:8001/health"
    fi
    exit 0
else
    echo -e "${YELLOW}⚠️  Một số services chưa sẵn sàng${NC}"
    echo ""
    echo "💡 Thử các lệnh sau:"
    echo "  • docker-compose ps          - Xem trạng thái containers"
    echo "  • docker-compose logs        - Xem logs"
    echo "  • make restart               - Khởi động lại"
    exit 1
fi

#!/bin/bash

# 🚀 IELTSGo Frontend - Automatic Setup Script
# Script tự động setup Frontend cho team members

set -e  # Exit on error

echo "=================================="
echo "🚀 IELTSGo Frontend Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running from Frontend-IELTSGo directory
if [ ! -f "package.json" ]; then
    print_error "Phải chạy script này từ folder Frontend-IELTSGo!"
    echo "  cd Frontend-IELTSGo"
    echo "  ./setup-team.sh"
    exit 1
fi

echo "Bước 1: Kiểm tra prerequisites..."
echo "-----------------------------------"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js chưa được cài đặt!"
    echo "  Cài đặt từ: https://nodejs.org/"
    exit 1
else
    NODE_VERSION=$(node -v)
    print_success "Node.js: $NODE_VERSION"
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm chưa được cài đặt. Đang cài..."
    npm install -g pnpm
    if [ $? -eq 0 ]; then
        print_success "pnpm đã được cài đặt"
    else
        print_error "Không thể cài pnpm. Vui lòng cài thủ công: npm install -g pnpm"
        exit 1
    fi
else
    PNPM_VERSION=$(pnpm -v)
    print_success "pnpm: $PNPM_VERSION"
fi

echo ""
echo "Bước 2: Setup environment variables..."
echo "---------------------------------------"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    print_warning ".env.local đã tồn tại"
    read -p "Bạn có muốn ghi đè không? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env.local
        print_success "Đã ghi đè .env.local"
    else
        print_info "Giữ nguyên .env.local hiện tại"
    fi
else
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success "Đã tạo .env.local từ .env.example"
    else
        print_error ".env.example không tồn tại!"
        exit 1
    fi
fi

echo ""
echo "Bước 3: Cài đặt dependencies..."
echo "--------------------------------"

print_info "Đang chạy pnpm install..."
if pnpm install; then
    print_success "Dependencies đã được cài đặt thành công"
else
    print_error "Lỗi khi cài đặt dependencies"
    exit 1
fi

echo ""
echo "Bước 4: Kiểm tra backend services..."
echo "--------------------------------------"

# Check if backend is running
print_info "Kiểm tra backend API Gateway (http://localhost:8080)..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    print_success "Backend đang chạy"
else
    print_warning "Backend chưa chạy!"
    echo "  Để start backend:"
    echo "    cd ../  # Quay về root project"
    echo "    make dev  # hoặc docker-compose up -d"
fi

echo ""
echo "=================================="
print_success "Setup hoàn tất!"
echo "=================================="
echo ""
echo "📝 Các bước tiếp theo:"
echo ""
echo "1. Kiểm tra file .env.local:"
echo "   cat .env.local"
echo ""
echo "2. Start development server:"
echo "   ${GREEN}pnpm dev${NC}"
echo ""
echo "3. Mở browser:"
echo "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "4. Đọc documentation:"
echo "   - SETUP_GUIDE.md (hướng dẫn chi tiết)"
echo "   - ARCHITECTURE.md (kiến trúc project)"
echo "   - README.md (features & tech stack)"
echo ""

# Ask if user wants to start dev server now
read -p "Bạn có muốn chạy 'pnpm dev' ngay bây giờ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Đang start development server..."
    echo "  Press Ctrl+C để dừng server"
    echo ""
    pnpm dev
else
    echo ""
    print_info "Setup xong! Chạy 'pnpm dev' khi sẵn sàng."
fi

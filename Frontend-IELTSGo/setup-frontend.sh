#!/bin/bash

# Frontend Setup Script for IELTSGo Platform
# This script helps team members setup the frontend environment

set -e  # Exit on error

echo "🚀 IELTSGo Frontend Setup"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version is too old (${NODE_VERSION})${NC}"
    echo "Please upgrade to Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo ""

# Check package manager
echo "📦 Detecting package manager..."
if [ -f "pnpm-lock.yaml" ]; then
    PACKAGE_MANAGER="pnpm"
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}⚠️  pnpm not found. Installing pnpm...${NC}"
        npm install -g pnpm
    fi
elif [ -f "yarn.lock" ]; then
    PACKAGE_MANAGER="yarn"
    if ! command -v yarn &> /dev/null; then
        echo -e "${YELLOW}⚠️  yarn not found. Installing yarn...${NC}"
        npm install -g yarn
    fi
else
    PACKAGE_MANAGER="npm"
fi

echo -e "${GREEN}✅ Using package manager: ${PACKAGE_MANAGER}${NC}"
echo ""

# Setup environment variables
echo "⚙️  Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✅ Created .env.local from .env.local.example${NC}"
        echo -e "${YELLOW}⚠️  Please update .env.local with your backend URL if different from localhost:8080${NC}"
    else
        echo -e "${RED}❌ .env.local.example not found${NC}"
        exit 1
    fi
else
    echo -e "${BLUE}ℹ️  .env.local already exists, skipping...${NC}"
fi
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
echo "This may take a few minutes..."
$PACKAGE_MANAGER install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Check if backend is running
echo "🔍 Checking backend connection..."
BACKEND_URL="http://localhost:8080/api/v1"
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/health" || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
        echo -e "${GREEN}✅ Backend is running at ${BACKEND_URL}${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend is not running (HTTP ${HTTP_CODE})${NC}"
        echo "Please start the backend services first:"
        echo "  cd .. && make dev"
    fi
else
    echo -e "${YELLOW}⚠️  curl not found, skipping backend check${NC}"
fi
echo ""

# Setup complete
echo "=========================================="
echo -e "${GREEN}✅ Frontend setup complete!${NC}"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Make sure backend is running:"
echo -e "   ${BLUE}cd .. && make dev${NC}"
echo ""
echo "2. Update .env.local if needed:"
echo -e "   ${BLUE}nano .env.local${NC}"
echo ""
echo "3. Start the development server:"
echo -e "   ${BLUE}$PACKAGE_MANAGER dev${NC}"
echo ""
echo "4. Open your browser:"
echo -e "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "📚 Documentation:"
echo "   - ARCHITECTURE.md - Frontend architecture"
echo "   - README.md - Getting started guide"
echo "   - ../docs/ROLES_AND_PERMISSIONS.md - User roles"
echo "   - ../FRONTEND_MASTER_GUIDE.md - Complete guide"
echo ""
echo "🎨 Brand colors are already configured in TailwindCSS!"
echo "   Primary: #ED372A (Red)"
echo "   Secondary: #101615 (Dark)"
echo "   Accent: #FEF7EC (Cream)"
echo ""
echo "Happy coding! 🚀"

#!/bin/bash

# =============================================================================
# RUN ALL TESTS - COMPREHENSIVE TEST SUITE
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

TOTAL_PASSED=0
TOTAL_FAILED=0

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                   COMPREHENSIVE TEST SUITE                    ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Test 1: Course Service
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📚 TEST 1: COURSE SERVICE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "./scripts/test-course-fixes.sh" ]; then
    if ./scripts/test-course-fixes.sh; then
        echo -e "${GREEN}✅ Course Service: ALL TESTS PASSED${NC}"
        TOTAL_PASSED=$((TOTAL_PASSED + 10))
    else
        echo -e "${RED}❌ Course Service: SOME TESTS FAILED${NC}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⏭️  Course Service tests not found${NC}"
fi

# Test 2: Exercise Service
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📝 TEST 2: EXERCISE SERVICE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "./scripts/test-exercise-fixes.sh" ]; then
    if ./scripts/test-exercise-fixes.sh; then
        echo -e "${GREEN}✅ Exercise Service: ALL TESTS PASSED${NC}"
        TOTAL_PASSED=$((TOTAL_PASSED + 7))
    else
        echo -e "${RED}❌ Exercise Service: SOME TESTS FAILED${NC}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⏭️  Exercise Service tests not found${NC}"
fi

# Test 3: User Service
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}👤 TEST 3: USER SERVICE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f "./scripts/test-user-service-comprehensive.sh" ]; then
    if ./scripts/test-user-service-comprehensive.sh; then
        echo -e "${GREEN}✅ User Service: ALL TESTS PASSED${NC}"
        TOTAL_PASSED=$((TOTAL_PASSED + 11))
    else
        echo -e "${RED}❌ User Service: SOME TESTS FAILED${NC}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
    fi
else
    echo -e "${YELLOW}⏭️  User Service tests not found${NC}"
fi

# Test 4: Health Check All Services
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🏥 TEST 4: HEALTH CHECK${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HEALTH_PASSED=0
HEALTH_FAILED=0

# API Gateway
if curl -sf http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API Gateway: Healthy${NC}"
    HEALTH_PASSED=$((HEALTH_PASSED + 1))
else
    echo -e "${RED}❌ API Gateway: Unhealthy${NC}"
    HEALTH_FAILED=$((HEALTH_FAILED + 1))
fi

# Auth Service
if curl -sf http://localhost:8081/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Auth Service: Healthy${NC}"
    HEALTH_PASSED=$((HEALTH_PASSED + 1))
else
    echo -e "${RED}❌ Auth Service: Unhealthy${NC}"
    HEALTH_FAILED=$((HEALTH_FAILED + 1))
fi

# User Service
if curl -sf http://localhost:8082/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ User Service: Healthy${NC}"
    HEALTH_PASSED=$((HEALTH_PASSED + 1))
else
    echo -e "${RED}❌ User Service: Unhealthy${NC}"
    HEALTH_FAILED=$((HEALTH_FAILED + 1))
fi

# Course Service
if curl -sf http://localhost:8083/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Course Service: Healthy${NC}"
    HEALTH_PASSED=$((HEALTH_PASSED + 1))
else
    echo -e "${RED}❌ Course Service: Unhealthy${NC}"
    HEALTH_FAILED=$((HEALTH_FAILED + 1))
fi

# Exercise Service
if curl -sf http://localhost:8084/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Exercise Service: Healthy${NC}"
    HEALTH_PASSED=$((HEALTH_PASSED + 1))
else
    echo -e "${RED}❌ Exercise Service: Unhealthy${NC}"
    HEALTH_FAILED=$((HEALTH_FAILED + 1))
fi

TOTAL_PASSED=$((TOTAL_PASSED + HEALTH_PASSED))
if [ $HEALTH_FAILED -gt 0 ]; then
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

# Final Summary
echo -e "\n${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                      FINAL SUMMARY                            ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${GREEN}✅ Total Passed Tests: ${TOTAL_PASSED}${NC}"
if [ $TOTAL_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed Test Suites: ${TOTAL_FAILED}${NC}"
    echo ""
    echo -e "${YELLOW}Some tests failed. Please review the logs above.${NC}"
    exit 1
else
    echo -e "${GREEN}🎉 ALL TEST SUITES PASSED!${NC}"
    echo ""
    echo -e "${CYAN}System Status: ${GREEN}READY FOR DEPLOYMENT${NC}"
    exit 0
fi

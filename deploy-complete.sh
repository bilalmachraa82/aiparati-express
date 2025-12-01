#!/bin/bash

# AutoFund AI - Complete Deployment Script
# Deploys both frontend (Vercel) and backend (Railway) with monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
SKIP_TESTS=${2:-false}
SKIP_BUILD=${3:-false}

echo -e "${GREEN}🚀 AutoFund AI - Complete Deployment Script${NC}"
echo "======================================="
echo -e "${BLUE}Environment:${NC} $ENVIRONMENT"
echo -e "${BLUE}Skip Tests:${NC} $SKIP_TESTS"
echo -e "${BLUE}Skip Build:${NC} $SKIP_BUILD"
echo ""

# Function to print section headers
print_section() {
    echo -e "\n${GREEN}📦 $1${NC}"
    echo "---------------------------------------"
}

# Function to run command with status
run_command() {
    local cmd=$1
    local desc=$2

    echo -e "${YELLOW}Running:${NC} $desc"
    if eval "$cmd"; then
        echo -e "${GREEN}✅ Success${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
        exit 1
    fi
}

# Check prerequisites
print_section "Checking Prerequisites"

echo "Checking for required tools..."
command -v node &> /dev/null || { echo -e "${RED}Node.js is required but not installed.${NC}"; exit 1; }
command -v npm &> /dev/null || { echo -e "${RED}npm is required but not installed.${NC}"; exit 1; }
command -v python3 &> /dev/null || { echo -e "${RED}Python 3 is required but not installed.${NC}"; exit 1; }
command -v docker &> /dev/null || { echo -e "${RED}Docker is required but not installed.${NC}"; exit 1; }

# Install CLI tools if needed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Installing Railway CLI...${NC}"
    npm install -g @railway/cli
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Run tests if not skipped
if [ "$SKIP_TESTS" = "false" ]; then
    print_section "Running Tests"

    # Frontend tests
    run_command "npm run test:ci" "Frontend unit tests"

    # Backend tests
    run_command "python -m pytest tests/ -v" "Backend tests"

    # E2E tests
    run_command "npm run test:e2e" "E2E tests"

    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${YELLOW}⏭️ Skipping tests${NC}"
fi

# Build if not skipped
if [ "$SKIP_BUILD" = "false" ]; then
    print_section "Building Applications"

    # Build frontend
    run_command "npm run build" "Frontend build"

    # Build backend Docker image
    if [ "$ENVIRONMENT" = "production" ]; then
        run_command "docker build -f Dockerfile.production -t autofund-ai:latest ." "Backend Docker build"
    fi

    echo -e "${GREEN}✅ Build complete${NC}"
else
    echo -e "${YELLOW}⏭️ Skipping build${NC}"
fi

# Deploy backend to Railway
print_section "Deploying Backend to Railway"

# Check if Railway is logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Railway:${NC}"
    railway login
fi

# Deploy backend
echo -e "${YELLOW}Deploying backend to Railway...${NC}"
if ./deploy/railway-deploy.sh production; then
    echo -e "${GREEN}✅ Backend deployed successfully${NC}"
else
    echo -e "${RED}❌ Backend deployment failed${NC}"
    exit 1
fi

# Get backend URL
BACKEND_URL=$(railway domain 2>/dev/null || echo "https://api.autofund.ai")
echo -e "${BLUE}Backend URL: ${BACKEND_URL}${NC}"

# Deploy frontend to Vercel
print_section "Deploying Frontend to Vercel"

# Check if Vercel is logged in
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Vercel:${NC}"
    vercel login
fi

# Deploy frontend
echo -e "${YELLOW}Deploying frontend to Vercel...${NC}"
if ./deploy/vercel-deploy.sh production $BACKEND_URL; then
    echo -e "${GREEN}✅ Frontend deployed successfully${NC}"
else
    echo -e "${RED}❌ Frontend deployment failed${NC}"
    exit 1
fi

# Get frontend URL
FRONTEND_URL=$(vercel ls 2>/dev/null | grep "production" | head -1 | awk '{print $3}' || echo "https://autofund.ai")
echo -e "${BLUE}Frontend URL: ${FRONTEND_URL}${NC}"

# Run smoke tests
print_section "Running Smoke Tests"

echo -e "${YELLOW}Testing backend health...${NC}"
sleep 10  # Give services time to start

BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/system/health")
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
fi

echo -e "${YELLOW}Testing frontend...${NC}"
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Frontend health check passed${NC}"
else
    echo -e "${RED}❌ Frontend health check failed (HTTP $FRONTEND_HEALTH)${NC}"
fi

# Test API connectivity
echo -e "${YELLOW}Testing API connectivity...${NC}"
API_TEST=$(curl -s -X POST "${BACKEND_URL}/api/validate-nif" \
    -H "Content-Type: application/json" \
    -d '{"nif": "508698357"}' \
    -o /dev/null -w "%{http_code}")

if [ "$API_TEST" = "200" ]; then
    echo -e "${GREEN}✅ API connectivity test passed${NC}"
else
    echo -e "${RED}❌ API connectivity test failed (HTTP $API_TEST)${NC}"
fi

# Setup monitoring
print_section "Setting up Monitoring"

echo -e "${YELLOW}Configuring monitoring dashboards...${NC}"

# Create monitoring alerts
cat > monitoring/alerts.yml << EOF
groups:
  - name: autofund_ai
    rules:
      - alert: HighErrorRate
        expr: rate(autofund_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: Error rate is {{ $value }} errors per second

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(autofund_request_duration_seconds_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High response time detected
          description: 95th percentile response time is {{ $value }} seconds

      - alert: DatabaseConnectionFailed
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database connection failed
          description: PostgreSQL database is down

      - alert: RedisConnectionFailed
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Redis connection failed
          description: Redis cache is down

      - alert: DiskSpaceLow
        expr: (autofund_disk_free_bytes / autofund_disk_usage_bytes) * 100 < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: Low disk space
          description: Disk space is below 10%

      - alert: MemoryUsageHigh
        expr: autofund_memory_usage_percent > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage
          description: Memory usage is above 90%
EOF

echo -e "${GREEN}✅ Monitoring alerts configured${NC}"

# Final summary
print_section "Deployment Summary"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}Services deployed:${NC}"
echo -e "  • Frontend: ${FRONTEND_URL}"
echo -e "  • Backend:  ${BACKEND_URL}"
echo -e "  • API Docs: ${BACKEND_URL}/docs"
echo ""
echo -e "${BLUE}Monitoring:${NC}"
echo -e "  • Grafana: ${BACKEND_URL}:3001"
echo -e "  • Prometheus: ${BACKEND_URL}:9091"
echo -e "  • Health: ${BACKEND_URL}/api/system/health"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. Update DNS records to point to Vercel"
echo -e "  2. Configure SSL certificates"
echo -e "  3. Set up custom domains in Vercel dashboard"
echo -e "  4. Configure email delivery (SMTP)"
echo -e "  5. Set up payment processing (Stripe)"
echo -e "  6. Enable monitoring alerts"
echo -e "  7. Review security headers"
echo ""
echo -e "${GREEN}Thank you for using AutoFund AI! 🚀${NC}"
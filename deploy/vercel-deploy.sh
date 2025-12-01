#!/bin/bash

# AutoFund AI - Vercel Deployment Script
# This script handles deployment to Vercel (frontend)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 AutoFund AI - Vercel Deployment Script${NC}"
echo "======================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Get environment
ENVIRONMENT=${1:-production}
echo -e "${GREEN}Deploying to: $ENVIRONMENT${NC}"

# Set backend URL
if [ "$ENVIRONMENT" = "production" ]; then
    BACKEND_URL=${2:-"https://api.autofund.ai"}
else
    BACKEND_URL=${2:-"https://autofund-ai-api.railway.app"}
fi

echo "Backend URL: $BACKEND_URL"

# Create production build
echo -e "${YELLOW}Building Next.js application...${NC}"
npm run build

# Deploy to Vercel
echo -e "${GREEN}Deploying to Vercel...${NC}"

# Set environment variable for API URL
vercel env add NEXT_PUBLIC_API_URL $ENVIRONMENT << EOF
$BACKEND_URL
EOF

# Deploy
if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod
else
    vercel
fi

# Get the deployed URL
DEPLOYED_URL=$(vercel ls | grep "$ENVIRONMENT" | head -1 | awk '{print $3}')
echo -e "${GREEN}Deployment complete!${NC}"
echo "Frontend URL: https://$DEPLOYED_URL"

# Run health check
echo -e "${YELLOW}Running health check...${NC}"
sleep 10

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYED_URL")
if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $HEALTH_CHECK)${NC}"
fi

# Show next steps
echo -e "${GREEN}Next steps:${NC}"
echo "1. Visit your app at: https://$DEPLOYED_URL"
echo "2. Set up custom domain in Vercel dashboard"
echo "3. Configure analytics and monitoring"

echo -e "${GREEN}Deployment complete! 🎉${NC}"
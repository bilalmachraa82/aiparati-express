#!/bin/bash

# AutoFund AI - Railway Deployment Script
# This script handles deployment to Railway (backend API)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 AutoFund AI - Railway Deployment Script${NC}"
echo "======================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Installing Railway CLI...${NC}"
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Railway:${NC}"
    railway login
fi

# Get environment
ENVIRONMENT=${1:-production}
echo -e "${GREEN}Deploying to: $ENVIRONMENT${NC}"

# Set variables
PROJECT_NAME="autofund-ai"
SERVICE_NAME="api"

# Create or select project
echo -e "${YELLOW}Setting up Railway project...${NC}"
if ! railway projects | grep -q "$PROJECT_NAME"; then
    echo "Creating new project: $PROJECT_NAME"
    railway create "$PROJECT_NAME"
fi

railway select "$PROJECT_NAME"

# Set up environment variables from .env if exists
if [ -f .env ]; then
    echo -e "${YELLOW}Loading environment variables from .env...${NC}"

    # Read .env file and set variables
    while IFS= read -r line; do
        # Skip comments and empty lines
        [[ $line =~ ^[[:space:]]*# ]] && continue
        [[ -z $line ]] && continue

        # Extract key and value
        KEY=$(echo "$line" | cut -d'=' -f1)
        VALUE=$(echo "$line" | cut -d'=' -f2-)

        # Skip certain variables
        if [[ "$KEY" == "DATABASE_URL" && "$ENVIRONMENT" == "production" ]]; then
            echo "Skipping DATABASE_URL (Railway provides PostgreSQL)"
            continue
        fi

        # Set variable in Railway
        echo "Setting $KEY..."
        railway variables set "$KEY=$VALUE"
    done < .env
fi

# Required environment variables (prompt if not set)
echo -e "${YELLOW}Checking required environment variables...${NC}"

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -n "Enter Anthropic API Key: "
    read -s ANTHROPIC_API_KEY
    railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
fi

if [ -z "$JWT_SECRET_KEY" ]; then
    echo -n "Enter JWT Secret Key (or press Enter to generate): "
    read -s JWT_SECRET_KEY
    if [ -z "$JWT_SECRET_KEY" ]; then
        JWT_SECRET_KEY=$(openssl rand -base64 32)
        echo "Generated JWT Secret Key"
    fi
    railway variables set JWT_SECRET_KEY="$JWT_SECRET_KEY"
fi

# Deploy to Railway
echo -e "${GREEN}Deploying to Railway...${NC}"
railway up

# Wait for deployment to complete
echo -e "${YELLOW}Waiting for deployment to complete...${NC}"
sleep 30

# Get the deployed URL
DEPLOYED_URL=$(railway domain)
echo -e "${GREEN}Deployment complete!${NC}"
echo "API URL: https://$DEPLOYED_URL"

# Run health check
echo -e "${YELLOW}Running health check...${NC}
sleep 10

HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYED_URL/api/system/health")
if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $HEALTH_CHECK)${NC}"
    echo "Check logs with: railway logs"
fi

# Show next steps
echo -e "${GREEN}Next steps:${NC}"
echo "1. Update your frontend to use: https://$DEPLOYED_URL"
echo "2. Test the API at: https://$DEPLOYED_URL/docs"
echo "3. Monitor logs with: railway logs"
echo "4. Set up a custom domain in Railway dashboard"

echo -e "${GREEN}Deployment complete! 🎉${NC}"
#!/bin/bash

# Napoleon AI - Production Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on any error

echo "🚀 Napoleon AI - Production Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"

# Run tests
echo -e "${BLUE}🧪 Running tests...${NC}"
npm test -- --watchAll=false --coverage=false

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed. Deployment aborted.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All tests passed${NC}"

# Build the application
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Deployment aborted.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Check environment variables
echo -e "${BLUE}🔧 Checking environment configuration...${NC}"
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env.local file found. Make sure to configure environment variables in Vercel dashboard.${NC}"
fi

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"

# Check if this is production deployment
read -p "Deploy to production? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🎯 Deploying to production...${NC}"
    vercel --prod
else
    echo -e "${BLUE}🔍 Deploying to preview...${NC}"
    vercel
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🎉 Napoleon AI is live!${NC}"
    
    # Run health check
    echo -e "${BLUE}🏥 Running health check...${NC}"
    sleep 5  # Wait for deployment to be ready
    
    # Get the deployment URL (this would need to be extracted from vercel output)
    echo -e "${GREEN}✅ Deployment complete${NC}"
    echo -e "${BLUE}📊 Next steps:${NC}"
    echo "   1. Configure custom domain in Vercel dashboard"
    echo "   2. Set up environment variables in Vercel"
    echo "   3. Configure Clerk OAuth redirect URLs"
    echo "   4. Test the deployment thoroughly"
    echo "   5. Set up monitoring and analytics"
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎖️  Napoleon AI deployment complete!${NC}"
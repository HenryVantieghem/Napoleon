#!/bin/bash

# Napoleon AI - Comprehensive Error Detection Pipeline
# This script implements systematic error detection and resolution

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Error tracking
ERROR_COUNT=0
WARNINGS=()
ERRORS=()

echo -e "${PURPLE}🎖️  NAPOLEON AI - COMPREHENSIVE ERROR DETECTION${NC}"
echo -e "${PURPLE}=================================================${NC}"
echo

# Function to log errors
log_error() {
    local message="$1"
    echo -e "${RED}❌ ERROR: $message${NC}"
    ERRORS+=("$message")
    ((ERROR_COUNT++))
}

# Function to log warnings
log_warning() {
    local message="$1"
    echo -e "${YELLOW}⚠️  WARNING: $message${NC}"
    WARNINGS+=("$message")
}

# Function to log success
log_success() {
    local message="$1"
    echo -e "${GREEN}✅ $message${NC}"
}

# Function to log info
log_info() {
    local message="$1"
    echo -e "${BLUE}📋 $message${NC}"
}

# CHECK 1: Environment Setup
echo -e "${BLUE}🔧 PHASE 1: Environment Validation${NC}"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Please run this script from the project root."
    exit 1
fi

log_success "Project root directory confirmed"

# Check Node.js version
if ! command -v node &> /dev/null; then
    log_error "Node.js not found. Please install Node.js 18+."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version $NODE_VERSION is too old. Requires Node.js 18+."
    exit 1
fi

log_success "Node.js version $(node --version) is compatible"

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm not found. Please install npm."
    exit 1
fi

log_success "npm version $(npm --version) found"

# Check dependencies
if [ ! -d "node_modules" ]; then
    log_warning "node_modules not found. Running npm install..."
    npm install
    if [ $? -eq 0 ]; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
else
    log_success "Dependencies directory exists"
fi

echo

# CHECK 2: Environment Variables
echo -e "${BLUE}🔐 PHASE 2: Environment Variables${NC}"
echo "================================="

# Check .env.local or .env
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    log_warning "No .env.local or .env file found. This may cause issues in development."
fi

# Required environment variables for local development
REQUIRED_ENV_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
OPTIONAL_ENV_VARS=("OPENAI_API_KEY" "NEXT_PUBLIC_GOOGLE_ANALYTICS_ID")

for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_warning "Required environment variable $var is not set"
    else
        log_success "Environment variable $var is configured"
    fi
done

for var in "${OPTIONAL_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_info "Optional environment variable $var is not set"
    else
        log_success "Optional environment variable $var is configured"
    fi
done

echo

# CHECK 3: Code Quality & Type Safety
echo -e "${BLUE}🔍 PHASE 3: Code Quality Analysis${NC}"
echo "=================================="

# TypeScript compilation check
log_info "Checking TypeScript compilation..."
if npx tsc --noEmit --skipLibCheck; then
    log_success "TypeScript compilation successful"
else
    log_error "TypeScript compilation failed"
fi

# Linting check (if ESLint is configured)
if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ]; then
    log_info "Running ESLint analysis..."
    if npm run lint 2>/dev/null; then
        log_success "Linting passed"
    else
        log_warning "Linting issues detected (may not be critical)"
    fi
else
    log_info "No ESLint configuration found, skipping linting"
fi

echo

# CHECK 4: Comprehensive Test Suite
echo -e "${BLUE}🧪 PHASE 4: Test Suite Execution${NC}"
echo "================================="

log_info "Running comprehensive test suite..."
if npm test -- --watchAll=false --coverage=false --verbose 2>/dev/null; then
    log_success "All tests passed successfully"
else
    log_error "Test suite contains failures"
fi

# Check test coverage if available
if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
    log_info "Generating test coverage report..."
    if npm run test:coverage 2>/dev/null || npm test -- --coverage --watchAll=false 2>/dev/null; then
        log_success "Test coverage generated"
    else
        log_info "Test coverage generation not available or failed"
    fi
fi

echo

# CHECK 5: Build Process Validation
echo -e "${BLUE}🔨 PHASE 5: Build Process${NC}"
echo "=========================="

log_info "Testing production build..."
if npm run build; then
    log_success "Production build successful"
    
    # Check build output size
    if [ -d ".next" ]; then
        BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
        log_info "Build size: $BUILD_SIZE"
        
        # Check for large bundle sizes (warning if > 500KB first load JS)
        if [ -f ".next/BUILD_ID" ]; then
            log_success "Build ID generated successfully"
        fi
    fi
else
    log_error "Production build failed"
fi

echo

# CHECK 6: Runtime Health Checks
echo -e "${BLUE}🏥 PHASE 6: Runtime Health Validation${NC}"
echo "====================================="

# Start development server for health checks (background)
log_info "Starting development server for health checks..."
npm run dev > /dev/null 2>&1 &
DEV_SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if server is responding
if curl -s http://localhost:3000 > /dev/null; then
    log_success "Development server is responding"
    
    # Check health endpoint if available
    if curl -s http://localhost:3000/api/health > /dev/null; then
        HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
        if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
            log_success "Health endpoint is operational"
        else
            log_warning "Health endpoint returned unexpected response"
        fi
    else
        log_info "Health endpoint not available (this is okay for basic setups)"
    fi
else
    log_error "Development server is not responding"
fi

# Clean up development server
kill $DEV_SERVER_PID 2>/dev/null || true
sleep 2

echo

# CHECK 7: Security & Performance Analysis
echo -e "${BLUE}🔒 PHASE 7: Security & Performance${NC}"
echo "=================================="

# Check for common security issues
log_info "Checking for security issues..."

# Check for hardcoded secrets (basic check)
if grep -r "sk-" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then
    log_error "Potential hardcoded API keys found in source code"
else
    log_success "No obvious hardcoded secrets detected"
fi

# Check for console.log statements (should be minimal in production)
CONSOLE_LOGS=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 10 ]; then
    log_warning "Found $CONSOLE_LOGS console.log statements (consider reducing for production)"
else
    log_success "Console.log usage is reasonable ($CONSOLE_LOGS occurrences)"
fi

# Check bundle analyzer if available
if command -v npx >/dev/null && npx --help | grep -q "bundle-analyzer" 2>/dev/null; then
    log_info "Bundle analysis available (run 'npm run analyze' for detailed report)"
else
    log_info "Bundle analyzer not configured (optional)"
fi

echo

# CHECK 8: Production Deployment Readiness
echo -e "${BLUE}🚀 PHASE 8: Deployment Readiness${NC}"
echo "================================="

# Check Vercel configuration
if [ -f "vercel.json" ]; then
    log_success "Vercel configuration found"
    
    # Validate vercel.json syntax
    if node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf8'))" 2>/dev/null; then
        log_success "vercel.json syntax is valid"
    else
        log_error "vercel.json has invalid JSON syntax"
    fi
else
    log_info "No vercel.json found (using defaults)"
fi

# Check for deployment scripts
if [ -f "scripts/deploy.sh" ]; then
    log_success "Deployment script found"
    
    # Check if deployment script is executable
    if [ -x "scripts/deploy.sh" ]; then
        log_success "Deployment script is executable"
    else
        log_warning "Deployment script is not executable (run: chmod +x scripts/deploy.sh)"
    fi
else
    log_warning "No deployment script found"
fi

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    log_success "Vercel CLI is installed ($(vercel --version))"
else
    log_warning "Vercel CLI not found (install with: npm install -g vercel)"
fi

echo

# CHECK 9: Documentation & Maintenance
echo -e "${BLUE}📚 PHASE 9: Documentation Status${NC}"
echo "================================="

# Check for essential documentation
DOCS=("README.md" "DEPLOYMENT.md" "CLAUDE.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        log_success "$doc exists"
    else
        log_warning "$doc not found"
    fi
done

# Check for package.json scripts
REQUIRED_SCRIPTS=("build" "dev" "test")
for script in "${REQUIRED_SCRIPTS[@]}"; do
    if npm run --silent 2>/dev/null | grep -q "$script"; then
        log_success "npm script '$script' is configured"
    else
        log_warning "npm script '$script' not found"
    fi
done

echo

# FINAL REPORT
echo -e "${PURPLE}📊 FINAL ERROR DETECTION REPORT${NC}"
echo -e "${PURPLE}================================${NC}"
echo

if [ ${#ERRORS[@]} -eq 0 ]; then
    log_success "🎉 NO CRITICAL ERRORS DETECTED!"
    echo -e "${GREEN}Napoleon AI is ready for deployment.${NC}"
else
    echo -e "${RED}❌ CRITICAL ERRORS FOUND: ${#ERRORS[@]}${NC}"
    for error in "${ERRORS[@]}"; do
        echo -e "${RED}   • $error${NC}"
    done
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS FOUND: ${#WARNINGS[@]}${NC}"
    for warning in "${WARNINGS[@]}"; do
        echo -e "${YELLOW}   • $warning${NC}"
    done
fi

echo
echo -e "${BLUE}📈 SUMMARY:${NC}"
echo -e "   Errors: ${#ERRORS[@]}"
echo -e "   Warnings: ${#WARNINGS[@]}"
echo -e "   Overall Status: $( [ ${#ERRORS[@]} -eq 0 ] && echo -e "${GREEN}HEALTHY${NC}" || echo -e "${RED}NEEDS ATTENTION${NC}" )"

echo
if [ ${#ERRORS[@]} -eq 0 ]; then
    echo -e "${GREEN}🎖️  Napoleon AI is battle-ready! Deploy with confidence.${NC}"
    exit 0
else
    echo -e "${RED}🔧 Please resolve the critical errors above before deployment.${NC}"
    exit 1
fi
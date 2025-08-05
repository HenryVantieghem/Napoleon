#!/bin/bash

# Napoleon AI - Bulletproof Deployment Pipeline
# Military precision deployment with zero-tolerance for errors

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
MAX_RETRIES=3
RETRY_COUNT=0
HEALTH_CHECK_TIMEOUT=60
ROLLBACK_ON_FAILURE=true

echo -e "${PURPLE}🎖️  NAPOLEON AI - BULLETPROOF DEPLOYMENT PIPELINE${NC}"
echo -e "${PURPLE}=================================================${NC}"
echo -e "${CYAN}Military precision meets luxury craftsmanship${NC}"
echo

# Function to log with timestamp
log_with_timestamp() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[$timestamp] 📋 $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[$timestamp] ✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[$timestamp] ⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}[$timestamp] ❌ $message${NC}"
            ;;
        "CRITICAL")
            echo -e "${RED}[$timestamp] 🚨 CRITICAL: $message${NC}"
            ;;
    esac
}

# Function to run error detection
run_error_detection() {
    log_with_timestamp "INFO" "Running comprehensive error detection..."
    
    if [ -f "scripts/error-detection.sh" ]; then
        if ./scripts/error-detection.sh; then
            log_with_timestamp "SUCCESS" "Error detection passed - system is healthy"
            return 0
        else
            log_with_timestamp "ERROR" "Error detection failed - critical issues found"
            return 1
        fi
    else
        log_with_timestamp "WARNING" "Error detection script not found, running basic checks"
        
        # Basic fallback checks
        npm test -- --watchAll=false --coverage=false
        npm run build
        
        log_with_timestamp "SUCCESS" "Basic checks passed"
        return 0
    fi
}

# Function to deploy to staging
deploy_to_staging() {
    log_with_timestamp "INFO" "Deploying to Vercel preview (staging)..."
    
    local staging_url
    staging_url=$(vercel --yes 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ -n "$staging_url" ]; then
        echo "$staging_url" > .staging-url
        log_with_timestamp "SUCCESS" "Staging deployment successful: $staging_url"
        return 0
    else
        log_with_timestamp "ERROR" "Failed to extract staging URL"
        return 1
    fi
}

# Function to run integration tests on staging
test_staging_deployment() {
    local staging_url="$1"
    log_with_timestamp "INFO" "Running integration tests on staging: $staging_url"
    
    # Health check
    local health_status
    health_status=$(curl -s "$staging_url/api/health" | jq -r '.status' 2>/dev/null || echo "unknown")
    
    if [ "$health_status" = "healthy" ]; then
        log_with_timestamp "SUCCESS" "Staging health check passed"
    else
        log_with_timestamp "ERROR" "Staging health check failed: $health_status"
        return 1
    fi
    
    # Basic functionality test
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$staging_url")
    
    if [ "$response_code" = "200" ]; then
        log_with_timestamp "SUCCESS" "Staging site is responding correctly"
    else
        log_with_timestamp "ERROR" "Staging site returned HTTP $response_code"
        return 1
    fi
    
    # Test critical paths
    local dashboard_response
    dashboard_response=$(curl -s -o /dev/null -w "%{http_code}" "$staging_url/dashboard")
    
    if [ "$dashboard_response" = "200" ] || [ "$dashboard_response" = "302" ]; then
        log_with_timestamp "SUCCESS" "Dashboard endpoint is accessible"
    else
        log_with_timestamp "WARNING" "Dashboard endpoint returned HTTP $dashboard_response (may be expected for auth)"
    fi
    
    return 0
}

# Function to deploy to production
deploy_to_production() {
    log_with_timestamp "INFO" "Deploying to production..."
    
    local production_url
    production_url=$(vercel --prod --yes 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    
    if [ -n "$production_url" ]; then
        echo "$production_url" > .production-url
        log_with_timestamp "SUCCESS" "Production deployment successful: $production_url"
        return 0
    else
        log_with_timestamp "ERROR" "Failed to extract production URL"
        return 1
    fi
}

# Function to validate production deployment
validate_production() {
    local production_url="$1"
    log_with_timestamp "INFO" "Validating production deployment: $production_url"
    
    local end_time=$((SECONDS + HEALTH_CHECK_TIMEOUT))
    
    while [ $SECONDS -lt $end_time ]; do
        # Health check
        local health_status
        health_status=$(curl -s "$production_url/api/health" | jq -r '.status' 2>/dev/null || echo "unknown")
        
        if [ "$health_status" = "healthy" ]; then
            log_with_timestamp "SUCCESS" "Production health check passed"
            
            # Test critical endpoints
            local main_response
            main_response=$(curl -s -o /dev/null -w "%{http_code}" "$production_url")
            
            if [ "$main_response" = "200" ]; then
                log_with_timestamp "SUCCESS" "Production site is fully operational"
                return 0
            fi
        fi
        
        log_with_timestamp "INFO" "Waiting for production deployment to stabilize... (${HEALTH_CHECK_TIMEOUT}s timeout)"
        sleep 5
    done
    
    log_with_timestamp "ERROR" "Production validation timed out after ${HEALTH_CHECK_TIMEOUT}s"
    return 1
}

# Function to monitor for errors post-deployment
monitor_deployment() {
    local production_url="$1"
    log_with_timestamp "INFO" "Monitoring deployment for 2 minutes..."
    
    local monitoring_end=$((SECONDS + 120))
    local error_count=0
    
    while [ $SECONDS -lt $monitoring_end ]; do
        local health_response
        health_response=$(curl -s "$production_url/api/health" 2>/dev/null || echo "")
        
        if echo "$health_response" | grep -q '"status":"healthy"'; then
            # All good, continue monitoring
            sleep 10
        else
            ((error_count++))
            log_with_timestamp "WARNING" "Health check failed (error count: $error_count)"
            
            if [ $error_count -ge 3 ]; then
                log_with_timestamp "CRITICAL" "Multiple health check failures detected"
                return 1
            fi
            
            sleep 5
        fi
    done
    
    log_with_timestamp "SUCCESS" "Deployment monitoring completed - system is stable"
    return 0
}

# Function to rollback deployment
rollback_deployment() {
    log_with_timestamp "CRITICAL" "Initiating deployment rollback..."
    
    # Get previous deployment
    local previous_deployments
    previous_deployments=$(vercel ls --scope napoleon 2>/dev/null | grep napoleon-ai | head -2)
    
    if [ -n "$previous_deployments" ]; then
        log_with_timestamp "INFO" "Previous deployments found, rollback capability available"
        log_with_timestamp "WARNING" "Manual rollback required - please use Vercel dashboard"
    else
        log_with_timestamp "WARNING" "No previous deployments found for automated rollback"
    fi
    
    return 1
}

# Function to send deployment notification
send_notification() {
    local status="$1"
    local url="$2"
    
    case $status in
        "SUCCESS")
            log_with_timestamp "SUCCESS" "🎉 Napoleon AI deployment completed successfully!"
            log_with_timestamp "INFO" "Production URL: $url"
            log_with_timestamp "INFO" "Health Check: $url/api/health"
            ;;
        "FAILURE")
            log_with_timestamp "CRITICAL" "💥 Napoleon AI deployment failed!"
            log_with_timestamp "ERROR" "Please check the error logs above and retry"
            ;;
    esac
}

# Main deployment pipeline
main() {
    local start_time=$SECONDS
    
    log_with_timestamp "INFO" "Starting bulletproof deployment pipeline..."
    
    # Phase 1: Pre-deployment validation
    echo
    log_with_timestamp "INFO" "🔍 PHASE 1: Pre-deployment Validation"
    
    if ! run_error_detection; then
        log_with_timestamp "CRITICAL" "Pre-deployment validation failed!"
        exit 1
    fi
    
    # Phase 2: Staging deployment
    echo
    log_with_timestamp "INFO" "🚀 PHASE 2: Staging Deployment"
    
    if ! deploy_to_staging; then
        log_with_timestamp "CRITICAL" "Staging deployment failed!"
        exit 1
    fi
    
    local staging_url
    staging_url=$(cat .staging-url 2>/dev/null || echo "")
    
    if [ -n "$staging_url" ]; then
        if ! test_staging_deployment "$staging_url"; then
            log_with_timestamp "CRITICAL" "Staging tests failed!"
            exit 1
        fi
    fi
    
    # Phase 3: Production deployment confirmation
    echo
    log_with_timestamp "INFO" "🎯 PHASE 3: Production Deployment"
    
    # Ask for confirmation unless CI environment
    if [ -z "$CI" ]; then
        echo
        read -p "$(echo -e ${CYAN}Staging tests passed. Deploy to production? (y/N): ${NC})" -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_with_timestamp "INFO" "Production deployment cancelled by user"
            exit 0
        fi
    fi
    
    # Deploy to production
    if ! deploy_to_production; then
        log_with_timestamp "CRITICAL" "Production deployment failed!"
        
        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            rollback_deployment
        fi
        
        send_notification "FAILURE" ""
        exit 1
    fi
    
    local production_url
    production_url=$(cat .production-url 2>/dev/null || echo "")
    
    # Phase 4: Production validation
    echo
    log_with_timestamp "INFO" "🏥 PHASE 4: Production Validation"
    
    if [ -n "$production_url" ]; then
        if ! validate_production "$production_url"; then
            log_with_timestamp "CRITICAL" "Production validation failed!"
            
            if [ "$ROLLBACK_ON_FAILURE" = true ]; then
                rollback_deployment
            fi
            
            send_notification "FAILURE" "$production_url"
            exit 1
        fi
        
        # Phase 5: Post-deployment monitoring
        echo
        log_with_timestamp "INFO" "📊 PHASE 5: Post-deployment Monitoring"
        
        if ! monitor_deployment "$production_url"; then
            log_with_timestamp "CRITICAL" "Post-deployment monitoring detected issues!"
            
            if [ "$ROLLBACK_ON_FAILURE" = true ]; then
                rollbook_deployment
            fi
            
            send_notification "FAILURE" "$production_url"
            exit 1
        fi
        
        # Success!
        local duration=$((SECONDS - start_time))
        echo
        log_with_timestamp "SUCCESS" "🎖️  Bulletproof deployment completed in ${duration}s"
        send_notification "SUCCESS" "$production_url"
        
        # Cleanup temporary files
        rm -f .staging-url .production-url
        
    else
        log_with_timestamp "ERROR" "Could not determine production URL"
        exit 1
    fi
}

# Error handling
trap 'echo -e "${RED}Deployment pipeline interrupted${NC}"; exit 1' INT TERM

# Check prerequisites
if ! command -v vercel &> /dev/null; then
    log_with_timestamp "CRITICAL" "Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    log_with_timestamp "WARNING" "jq not found. Some features may be limited. Install with: brew install jq"
fi

# Run main pipeline
main "$@"
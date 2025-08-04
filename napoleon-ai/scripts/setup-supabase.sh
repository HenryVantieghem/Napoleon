#!/bin/bash

# 🚨 CRITICAL SUPABASE SETUP SCRIPT
# This script helps diagnose and fix Supabase DNS issues

echo "🚨 NAPOLEON AI - CRITICAL SUPABASE DIAGNOSTIC"
echo "=============================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ ERROR: .env.local file not found!"
    echo "📋 Creating .env.local template..."
    cat > .env.local << 'EOF'
# ⚠️ REPLACE THESE WITH YOUR ACTUAL SUPABASE VALUES
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Optional Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id-here
EOF
fi

echo ""
echo "🔍 CURRENT CONFIGURATION CHECK:"
echo "================================"

# Check current values
if grep -q "your-project" .env.local; then
    echo "❌ CRITICAL: Still using placeholder Supabase URL!"
    echo "📋 Current URL: $(grep NEXT_PUBLIC_SUPABASE_URL .env.local)"
    echo ""
    echo "🚨 TO FIX THIS IMMEDIATELY:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project (or create new one)"
    echo "3. Go to Settings > API"
    echo "4. Copy Project URL and anon public key"
    echo "5. Replace values in .env.local"
    echo ""
    echo "🔗 Your Supabase URL should look like:"
    echo "   https://abcdefghijklmnopqrst.supabase.co"
    echo ""
else
    SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2)
    echo "✅ Supabase URL configured: $SUPABASE_URL"
    
    # Test DNS resolution
    DOMAIN=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|http://||')
    echo "🔍 Testing DNS resolution for: $DOMAIN"
    
    if nslookup $DOMAIN > /dev/null 2>&1; then
        echo "✅ DNS resolution successful"
        
        # Test HTTP connection
        if curl -s --head $SUPABASE_URL > /dev/null; then
            echo "✅ HTTP connection successful"
        else
            echo "❌ HTTP connection failed"
        fi
    else
        echo "❌ DNS resolution failed - Invalid Supabase URL!"
    fi
fi

echo ""
echo "📋 VERCEL ENVIRONMENT VARIABLES:"
echo "================================"
echo "Make sure to set these in Vercel dashboard:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- OPENAI_API_KEY"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"

echo ""
echo "🛠️  NEXT STEPS:"
echo "1. Fix .env.local with real Supabase credentials"
echo "2. Update Vercel environment variables"
echo "3. Redeploy application"
echo "4. Test authentication flow"
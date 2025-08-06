#!/bin/bash

echo "🔍 OAUTH REDIRECT URI DEBUGGING SCRIPT"
echo "========================================"

echo ""
echo "📋 Environment Variables:"
echo "  NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:-'UNDEFINED'}"
echo "  GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:+SET}"
echo "  GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:+SET}"

echo ""
echo "🌐 Expected Redirect URI:"
if [ -n "${NEXT_PUBLIC_APP_URL}" ]; then
    echo "  ${NEXT_PUBLIC_APP_URL}/auth/gmail/callback"
else
    echo "  http://localhost:3001/auth/gmail/callback (fallback)"
fi

echo ""
echo "📍 Production Domain Check:"
echo "  Expected for napoleonai.app: https://napoleonai.app/auth/gmail/callback"

echo ""
echo "🚀 Quick Test Commands:"
echo "  1. Check environment: npm run build"
echo "  2. Start dev server: npm run dev"
echo "  3. Check logs when testing OAuth flow"

echo ""
echo "🔧 NEXT STEPS TO DEBUG:"
echo "  1. Ensure NEXT_PUBLIC_APP_URL=https://napoleonai.app in production"
echo "  2. Verify Google Cloud Console has exact redirect URI configured"
echo "  3. Test OAuth flow and check browser console for detailed logs"
echo "  4. Look for '🔍 [OAUTH DEBUG]' messages in logs"
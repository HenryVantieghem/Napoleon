# 🎖️ NAPOLEON AI - GMAIL OAUTH COMPLETE TEST PROTOCOL

## ✅ STEP-BY-STEP GMAIL OAUTH TESTING

### Phase 1: Pre-OAuth Status Check
1. **Navigate to**: https://napoleonai.app/prototype
2. **Expected Connection Status**: Gmail shows "Not connected" with "Connect Gmail" button
3. **Open Browser Console** (F12) to monitor logs

### Phase 2: OAuth Flow Initiation
1. **Click "Connect Gmail" button**
2. **Expected Behavior**: Redirects to Google OAuth consent screen
3. **Expected URL Pattern**: `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline...`
4. **Console Logs to Look For**:
   ```
   🔍 [OAUTH DEBUG] Environment check:
   🚀 [OAUTH DEBUG] Generated auth URL: https://accounts.google.com...
   ```

### Phase 3: Google OAuth Consent
1. **Sign in to Google Account** (if not already signed in)
2. **Review Permissions**: Should request Gmail readonly access
3. **Click "Allow"** to grant permissions
4. **Expected Redirect**: Back to `https://napoleonai.app/auth/gmail/callback?code=...`

### Phase 4: OAuth Callback Processing
1. **Monitor Console for**:
   ```
   🔄 [OAUTH CALLBACK] Gmail OAuth callback started
   ✅ [OAUTH CALLBACK] OAuth tokens received: {access_token: true, refresh_token: true}
   🍪 [OAUTH CALLBACK] Tokens stored in secure cookies
   ```
2. **Expected Final Redirect**: `https://napoleonai.app/prototype?gmail=connected`

### Phase 5: Message Loading Verification
1. **Expected Connection Status**: Gmail shows "✅ Connected"
2. **Message Loading Logs**:
   ```
   🍪 [GMAIL CLIENT] Using user OAuth tokens from cookies
   📧 [GMAIL CLIENT] Starting Gmail message fetch...
   📊 [MESSAGES API] Gmail messages loaded: X
   ```
3. **Expected Result**: Gmail messages from past 7 days display with priority scoring

## 🚨 TROUBLESHOOTING OAUTH ISSUES

### If OAuth Fails at Step 2:
- **Check**: GOOGLE_CLIENT_ID is set in Vercel environment
- **Verify**: Google Cloud Console has OAuth client configured
- **Confirm**: Authorized redirect URI is `https://napoleonai.app/auth/gmail/callback`

### If Callback Fails at Step 4:
- **Look for**: `❌ [OAUTH CALLBACK] REDIRECT URI MISMATCH ERROR!`
- **Check**: NEXT_PUBLIC_APP_URL=https://napoleonai.app in Vercel
- **Verify**: Google Cloud Console redirect URI exactly matches

### If Token Storage Fails:
- **Console Error**: `🍪 [GMAIL CLIENT] Cookie access error:`
- **Browser Issue**: Cookies may be blocked, try incognito mode
- **Domain Issue**: Verify cookies are set for napoleonai.app domain

### If Messages Don't Load:
- **Console Shows**: `❌ [GMAIL CLIENT] No OAuth tokens available`
- **Re-try OAuth**: Complete flow again to refresh tokens
- **Check Permissions**: Verify Gmail API access was granted

## ✅ SUCCESS CRITERIA

### OAuth Flow Success:
- [ ] Google OAuth consent completed without errors
- [ ] Callback processed with tokens stored in cookies
- [ ] Redirected to `/prototype?gmail=connected`
- [ ] Connection status shows "✅ Connected"

### Message Loading Success:
- [ ] Gmail messages from past 7 days display
- [ ] Messages with "urgent", "asap", "?" show 🚨 priority
- [ ] Message counts show actual numbers (not 0)
- [ ] No error messages in connection status

### Console Logging Success:
- [ ] OAuth URL generation logged with environment details
- [ ] Token storage confirmation in callback
- [ ] Gmail client successfully using stored tokens
- [ ] Message fetch and priority classification logged

## 🎯 IMMEDIATE TESTING PROTOCOL

**STEP 1**: Open https://napoleonai.app/prototype in incognito browser
**STEP 2**: Open browser console (F12) to monitor logs
**STEP 3**: Complete Gmail OAuth flow following steps above
**STEP 4**: Verify messages load and connection shows "✅ Connected"
**STEP 5**: Check console logs match expected patterns

---

**If OAuth completes but messages still don't load, the token storage/retrieval system needs additional debugging.**
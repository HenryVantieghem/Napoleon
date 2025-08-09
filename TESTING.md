# 🧪 Testing Guide - Clerk Hosted Auth Implementation

## Local Development Testing

### 1. Basic Auth Flow
```bash
# Start development server
pnpm dev

# Test URLs
http://localhost:3000/          # Landing page
http://localhost:3000/prototype # Public prototype page
http://localhost:3000/dashboard # Protected dashboard (redirects to sign-in)
```

### 2. Authentication Testing Steps

#### A. Sign-In Modal Flow
1. Visit `http://localhost:3000/`
2. Click "Sign In" button in navigation → Should open Clerk modal
3. Complete Google sign-in → Should redirect to `/dashboard`
4. Verify `/dashboard` shows welcome message and redirects to `/prototype`

#### B. CTA Button Flow
1. Visit `http://localhost:3000/` (signed out)
2. Click "Start Streaming Messages" → Should open Clerk modal
3. Complete sign-in → Should redirect to `/dashboard`

#### C. Signed-In State
1. After signing in, visit `http://localhost:3000/`
2. Verify navigation shows "Dashboard" instead of "Sign In"
3. Verify CTA shows "Go to Dashboard" instead of "Start Streaming Messages"
4. Click "Go to Dashboard" → Should navigate to `/dashboard`

### 3. Protection Testing

#### A. Dashboard Protection
1. Visit `http://localhost:3000/dashboard` (signed out)
2. Should redirect to Clerk sign-in page
3. After sign-in, should show dashboard content

#### B. Public Routes
1. Visit `http://localhost:3000/` (signed out) → Should work
2. Visit `http://localhost:3000/prototype` (signed out) → Should work
3. Visit `http://localhost:3000/api/health` (signed out) → Should work

## Production Testing

### 1. Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Test URLs
https://napoleonai.app/          # Production landing
https://napoleonai.app/prototype # Production prototype
https://napoleonai.app/dashboard # Production dashboard
```

### 2. Clerk Configuration Verification

#### A. Allowed Origins
Ensure these are configured in Clerk Dashboard:
- `https://napoleonai.app`
- `https://*.vercel.app` (for preview deployments)

#### B. Redirect URIs
Verify these redirect URIs are set:
- `https://napoleonai.app/dashboard`
- `https://napoleonai.app/prototype`
- `https://*.vercel.app/dashboard` (for preview deployments)

#### C. Hosted Pages
Verify hosted pages are configured at:
- `https://accounts.napoleonai.app/sign-in`
- `https://accounts.napoleonai.app/sign-up`

### 3. Environment Variables Check
```bash
# Verify these are set in Vercel
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=https://accounts.napoleonai.app/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=https://accounts.napoleonai.app/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Edge Cases & Error Testing

### 1. Network Issues
- Test with slow network → Modal should still work
- Test with offline state → Should show appropriate error

### 2. Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 3. OAuth Provider Testing
- Google sign-in flow
- Test with different Google accounts
- Test OAuth error scenarios

## Performance Testing

### 1. Load Times
- Landing page load time < 2s
- Modal open time < 500ms
- Auth redirect time < 1s

### 2. Bundle Size
```bash
# Check bundle size impact
pnpm build
# Verify no significant increase in bundle size
```

## Security Testing

### 1. Route Protection
- Verify `/dashboard` is properly protected
- Verify API routes are protected as needed
- Test direct URL access to protected routes

### 2. Token Handling
- Verify tokens are properly stored
- Test token refresh scenarios
- Test logout functionality

## Monitoring & Debugging

### 1. Clerk Dashboard
- Monitor sign-in/sign-up events
- Check for failed authentication attempts
- Review user session data

### 2. Vercel Analytics
- Monitor page load times
- Check for 404/500 errors
- Review user flow analytics

### 3. Console Logs
- Check browser console for errors
- Monitor network requests
- Verify no sensitive data in logs

## Rollback Plan

If issues arise:
1. Revert to previous deployment
2. Check Clerk configuration
3. Verify environment variables
4. Test with different browsers/devices

## Success Criteria

✅ **All tests pass when:**
- Sign-in modal opens correctly
- Authentication flow completes successfully
- Users are redirected to `/dashboard` after sign-in
- Protected routes are properly secured
- Public routes remain accessible
- No console errors during auth flow
- Mobile responsiveness maintained
- Performance metrics within acceptable ranges

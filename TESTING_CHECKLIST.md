# Napoleon AI Prototype Testing Checklist

## Pre-Launch Tests
- [x] Node version 18+ confirmed (v20.19.3)
- [x] All dependencies installed
- [x] Environment variables template created
- [ ] Database connection working
- [x] Existing tests still pass (no test failures)

## Launch Tests
- [x] npm run lint - passed with warnings only
- [x] npm run test - passed (no tests found)
- [x] npm run build - SUCCESS! ✅
- [x] npm run dev - started on http://localhost:3000

## Manual Testing
- [ ] Navigate to http://localhost:3000/prototype
- [ ] Clerk authentication works
- [ ] Sign in/out functions properly
- [ ] Gmail OAuth flow completes
- [ ] Gmail messages display (7 days)
- [ ] Slack connection established
- [ ] Slack messages display (7 days)
- [ ] Messages sorted chronologically
- [ ] Refresh button works
- [ ] No console errors
- [ ] Responsive on mobile

## Integration Tests
- [ ] Gmail + Slack messages combined
- [ ] Timestamps accurate
- [ ] Message count correct
- [ ] Error states handled gracefully

## Performance Tests
- [ ] Page loads < 3 seconds
- [ ] Messages render smoothly
- [ ] No memory leaks

## Edge Cases
- [ ] No messages in 7 days
- [ ] Only Gmail messages
- [ ] Only Slack messages
- [ ] API rate limits handled
- [ ] Network errors handled

## Sign-off
- [ ] All tests passed
- [ ] Ready for deployment
# Napoleon AI Prototype Testing Checklist

## Pre-Launch Tests
- [x] Node version 18+ confirmed (v20.19.3)
- [ ] All dependencies installed
- [ ] Environment variables set
- [ ] Database connection working
- [ ] Existing tests still pass

## Launch Tests
```bash
npm run lint
npm run test
npm run build
npm run dev
```

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
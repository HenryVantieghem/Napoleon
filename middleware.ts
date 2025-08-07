import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/terms',
    '/privacy',
    '/api/health',
    '/auth/gmail',           // ✅ CRITICAL: Add OAuth initiation route
    '/auth/gmail/callback',
    '/auth/slack',
    '/auth/slack/callback',
  ],
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
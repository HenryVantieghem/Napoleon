import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/terms',
    '/privacy',
    '/api/health',
    '/auth/gmail/callback',
    '/auth/slack',
    '/auth/slack/callback',
  ],
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
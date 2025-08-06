import { authMiddleware } from '@clerk/nextjs/server'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/terms',
    '/privacy',
    '/api/health',
    '/auth/gmail/callback',
  ],
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
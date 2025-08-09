import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
  publicRoutes: ['/', '/prototype', '/api/health', '/api/debug/tokens'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)'],
};
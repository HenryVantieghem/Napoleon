import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/api/health",
    "/api/webhook(.*)"
  ],
  
  // Ignore static files and Next.js internals
  ignoredRoutes: [
    "/((?!api|trpc))(_next.*)",
    "/favicon.ico",
    "/.*\\.(png|jpg|jpeg|gif|svg|ico)$"
  ],

  // After auth logic
  afterAuth(auth, req) {
    // Allow public routes
    if (auth.isPublicRoute) {
      return;
    }

    // Redirect unauthenticated users to sign-in
    if (!auth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }

    // Allow authenticated users to continue
    return;
  },
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
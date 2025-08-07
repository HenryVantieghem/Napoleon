import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that don't require authentication
  publicRoutes: [
    "/",
    "/api/webhook(.*)",
    "/api/health",
    "/sign-in(.*)",
    "/sign-up(.*)"
  ],
  
  // Routes to completely ignore
  ignoredRoutes: [
    "/((?!api|trpc))(_next.*)",
    "/favicon.ico",
    "/.*\\.(png|jpg|jpeg|gif|svg|ico)$"
  ],

  // Custom after auth logic
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
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
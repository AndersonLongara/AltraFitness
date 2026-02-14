import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes (no auth required)
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/join(.*)",
]);

// Routes that require auth but no specific role
const isAuthOnlyRoute = createRouteMatcher([
    "/onboarding(.*)",
    "/auth-redirect(.*)",
]);

// Trainer-only routes
const isTrainerRoute = createRouteMatcher([
    "/dashboard(.*)",
]);

// Student-only routes
const isStudentRoute = createRouteMatcher([
    "/student(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    // Allow public routes
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // Protect all other routes
    const { userId } = await auth.protect();

    // We removed the strict role check here because relying on sessionClaims 
    // for metadata requires specific Clerk Dashboard configuration and can be susceptible 
    // to race conditions during onboarding.
    // 
    // Instead, we will handle role verification in the Layouts/Pages of 
    // /dashboard and /student using the server-side clerkClient.

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals, static files, and diagnostic endpoints
        '/((?!_next|api/health|api/debug|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes (except health and debug)
        '/(api(?!/health)(?!/debug)|trpc)(.*)',
    ],
};

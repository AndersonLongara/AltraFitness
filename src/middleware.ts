import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes (no auth required)
const isPublicRoute = createRouteMatcher([
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)"
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
    const { userId, sessionClaims } = await auth.protect();

    // Extract role from Clerk publicMetadata
    const role = sessionClaims?.metadata?.role as string | undefined;

    // If no role assigned, redirect to onboarding
    if (!role) {
        const onboardingUrl = new URL("/onboarding", req.url);
        return NextResponse.redirect(onboardingUrl);
    }

    // Enforce role-based access
    if (isTrainerRoute(req) && role !== "trainer") {
        // Student trying to access trainer routes
        console.warn(`[Middleware] Student ${userId} attempted to access trainer route: ${req.nextUrl.pathname}`);
        const studentUrl = new URL("/student", req.url);
        return NextResponse.redirect(studentUrl);
    }

    if (isStudentRoute(req) && role !== "student") {
        // Trainer trying to access student routes
        console.warn(`[Middleware] Trainer ${userId} attempted to access student route: ${req.nextUrl.pathname}`);
        const dashboardUrl = new URL("/dashboard", req.url);
        return NextResponse.redirect(dashboardUrl);
    }

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

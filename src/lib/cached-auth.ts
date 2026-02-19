/**
 * Per-request deduplication using React.cache()
 *
 * React.cache() memoizes function calls within a single server request.
 * Calls with the same arguments return the cached result without re-executing,
 * avoiding redundant Clerk API calls and DB queries across server components and
 * server actions within the same render cycle.
 */
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Deduplicates currentUser() calls within the same request.
 * Multiple server components/actions calling this in the same render
 * will receive the same Clerk User object without extra roundtrips.
 */
export const getCachedCurrentUser = cache(currentUser);

/**
 * Deduplicates the student lookup by email within the same request.
 * Includes trainer and plan relations used across most student pages.
 */
export const getCachedStudentByEmail = cache(async (email: string) => {
    return db.query.students.findFirst({
        where: eq(students.email, email),
        with: {
            trainer: true,
            plan: true,
        },
    });
});

/**
 * Convenience: resolve user + student in one cached call.
 * Returns null if user not found.
 */
export const getCachedStudentIdentity = cache(async () => {
    const user = await getCachedCurrentUser();
    if (!user) return null;
    const email =
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses?.[0]?.emailAddress;
    if (!email) return null;
    const student = await getCachedStudentByEmail(email);
    return student ? { user, student, email } : null;
});

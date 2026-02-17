import { redirect } from "next/navigation";
import { getRoleRedirectUrl } from "@/lib/auth-helpers";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage({ searchParams }: { searchParams: Promise<{ invite_token?: string }> }) {
    const params = await searchParams;
    const inviteTokenParam = params.invite_token;

    console.log('[auth-redirect] inviteTokenParam:', inviteTokenParam);

    // 0) Check URL parameter first (most reliable for OAuth flows)
    if (inviteTokenParam) {
        try {
            console.log('[auth-redirect] Checking URL param token in DB...');
            // Validate the token still exists in DB
            const studentByToken = await db.query.students.findFirst({
                where: eq(students.inviteToken, inviteTokenParam),
                columns: { id: true },
            });
            if (studentByToken) {
                console.log('[auth-redirect] Token valid, redirecting to /join/', inviteTokenParam);
                redirect(`/join/${inviteTokenParam}`);
            }
            console.log('[auth-redirect] Token not found in DB');
        } catch (err) {
            console.error('[auth-redirect] URL param check failed:', err);
            // Continue to next check
        }
    }

    // 1) Check cookie (fallback for direct navigation)
    const cookieStore = await cookies();
    const inviteTokenCookie = cookieStore.get('invite_token')?.value;
    console.log('[auth-redirect] inviteTokenCookie:', inviteTokenCookie);
    
    if (inviteTokenCookie) {
        try {
            console.log('[auth-redirect] Checking cookie token in DB...');
            // Validate the token still exists in DB
            const studentByToken = await db.query.students.findFirst({
                where: eq(students.inviteToken, inviteTokenCookie),
                columns: { id: true },
            });
            if (studentByToken) {
                console.log('[auth-redirect] Cookie token valid, redirecting to /join/', inviteTokenCookie);
                redirect(`/join/${inviteTokenCookie}`);
            }
            console.log('[auth-redirect] Cookie token not found in DB');
            // Token consumed or invalid - cookie will be cleared client-side
        } catch (err) {
            console.error('[auth-redirect] Cookie check failed:', err);
            // Continue to next check
        }
    }

    // 2) Fallback: check by email
    try {
        const user = await currentUser();
        if (user) {
            const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
            if (email) {
                const pendingStudent = await db.query.students.findFirst({
                    where: and(
                        eq(students.email, email),
                        isNotNull(students.inviteToken),
                    ),
                    columns: { inviteToken: true },
                });
                if (pendingStudent?.inviteToken) {
                    redirect(`/join/${pendingStudent.inviteToken}`);
                }
            }
        }
    } catch (err) {
        console.error('[auth-redirect] Email check failed:', err);
        // Continue to role redirect
    }

    // 3) Normal role-based redirect
    const redirectUrl = await getRoleRedirectUrl();
    redirect(redirectUrl);
}

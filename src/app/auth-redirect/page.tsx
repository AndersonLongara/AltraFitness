import { redirect } from "next/navigation";
import { getRoleRedirectUrl } from "@/lib/auth-helpers";
import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage() {
    // 1) Check cookie first (most reliable — set when user visits /join/[token])
    const cookieStore = await cookies();
    const inviteTokenCookie = cookieStore.get('invite_token')?.value;
    if (inviteTokenCookie) {
        // Validate the token still exists in DB
        const studentByToken = await db.query.students.findFirst({
            where: and(
                eq(students.inviteToken, inviteTokenCookie),
            ),
            columns: { id: true },
        });
        if (studentByToken) {
            redirect(`/join/${inviteTokenCookie}`);
        } else {
            // Token consumed or invalid, clean up
            cookieStore.delete('invite_token');
        }
    }

    // 2) Fallback: check by email
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

    // 3) Normal role-based redirect
    const redirectUrl = await getRoleRedirectUrl();
    redirect(redirectUrl);
}

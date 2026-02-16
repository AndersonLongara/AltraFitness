import { redirect } from "next/navigation";
import { getRoleRedirectUrl } from "@/lib/auth-helpers";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage() {
    // Check if the user has a pending invite (student created via invite link)
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

    // Get role-specific redirect URL
    const redirectUrl = await getRoleRedirectUrl();
    redirect(redirectUrl);
}

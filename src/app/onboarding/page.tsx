import { getPlatformPlansForOnboarding, type PlatformPlanOption } from "@/app/actions/onboarding";
import OnboardingClient from "./OnboardingClient";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ invite_token?: string }> }) {
    const params = await searchParams;
    const inviteTokenParam = params.invite_token;

    console.log('[onboarding] inviteTokenParam:', inviteTokenParam);

    // 0) Check URL parameter first (from OAuth redirect)
    if (inviteTokenParam) {
        try {
            const studentByToken = await db.query.students.findFirst({
                where: eq(students.inviteToken, inviteTokenParam),
                columns: { id: true },
            });
            if (studentByToken) {
                redirect(`/join/${inviteTokenParam}`);
            }
        } catch (err) {
            console.error('[onboarding] URL param check failed:', err);
            // Continue to next check
        }
    }

    // 1) Check cookie (fallback)
    const cookieStore = await cookies();
    const inviteTokenCookie = cookieStore.get('invite_token')?.value;
    console.log('[onboarding] inviteTokenCookie:', inviteTokenCookie);
    
    if (inviteTokenCookie) {
        try {
            const studentByToken = await db.query.students.findFirst({
                where: eq(students.inviteToken, inviteTokenCookie),
                columns: { id: true },
            });
            if (studentByToken) {
                redirect(`/join/${inviteTokenCookie}`);
            }
            // Token invalid - cookie will be cleared client-side
        } catch (err) {
            console.error('[onboarding] Cookie check failed:', err);
            // Continue to next check
        }
    }

    // 2) Fallback: check by email
    try {
        const user = await currentUser();
        if (user) {
            const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
            console.log('[onboarding] Checking email:', email);
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
        console.error('[onboarding] Email check failed:', err);
        // Continue to onboarding
    }

    console.log('[onboarding] No pending invite found, proceeding to normal onboarding flow');

    let platformPlans: PlatformPlanOption[];
    try {
        platformPlans = await getPlatformPlansForOnboarding();
    } catch (err) {
        console.error("[onboarding] page failed to load plans:", err);
        platformPlans = [];
    }
    return <OnboardingClient initialPlatformPlans={platformPlans} />;
}

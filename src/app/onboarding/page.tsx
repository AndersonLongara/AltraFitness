import { getPlatformPlansForOnboarding, type PlatformPlanOption } from "@/app/actions/onboarding";
import OnboardingClient from "./OnboardingClient";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
    // If user has a pending invite, redirect to join page instead of onboarding
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

    let platformPlans: PlatformPlanOption[];
    try {
        platformPlans = await getPlatformPlansForOnboarding();
    } catch (err) {
        console.error("[onboarding] page failed to load plans:", err);
        platformPlans = [];
    }
    return <OnboardingClient initialPlatformPlans={platformPlans} />;
}

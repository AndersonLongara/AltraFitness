import { getPlatformPlansForOnboarding } from "@/app/actions/onboarding";
import OnboardingClient from "./OnboardingClient";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
    let platformPlans;
    try {
        platformPlans = await getPlatformPlansForOnboarding();
    } catch (err) {
        console.error("[onboarding] page failed to load plans:", err);
        platformPlans = [];
    }
    return <OnboardingClient initialPlatformPlans={platformPlans} />;
}

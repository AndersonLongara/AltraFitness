import { getPlatformPlansForOnboarding } from "@/app/actions/onboarding";
import OnboardingClient from "./OnboardingClient";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
    const platformPlans = await getPlatformPlansForOnboarding();
    return <OnboardingClient initialPlatformPlans={platformPlans} />;
}

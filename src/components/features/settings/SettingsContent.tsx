"use client";

import { useState } from "react";
import SettingsTabs, { type SettingsTab } from "./SettingsTabs";
import ProfileSection from "./ProfileSection";
import SubscriptionSection from "./SubscriptionSection";
import AccountSection from "./AccountSection";
import AboutSection from "./AboutSection";
import type { TrainerProfile, SubscriptionInfo, UsageStats, PlatformPlanForSettings } from "@/app/actions/settings";

interface SettingsContentProps {
    profile: TrainerProfile;
    subscription: SubscriptionInfo;
    usage: UsageStats;
    platformPlans: PlatformPlanForSettings[];
    initialTab?: SettingsTab;
}

export default function SettingsContent({ profile, subscription, usage, platformPlans, initialTab = "profile" }: SettingsContentProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

    return (
        <div className="space-y-8">
            <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="min-h-[400px]">
                {activeTab === "profile" && <ProfileSection profile={profile} />}
                {activeTab === "subscription" && (
                    <SubscriptionSection subscription={subscription} usage={usage} platformPlans={platformPlans} />
                )}
                {activeTab === "account" && <AccountSection profile={profile} />}
                {activeTab === "about" && <AboutSection />}
            </div>
        </div>
    );
}

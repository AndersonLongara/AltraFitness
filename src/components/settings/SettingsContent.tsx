"use client";

import { useState } from "react";
import SettingsTabs, { type SettingsTab } from "./SettingsTabs";
import ProfileSection from "./ProfileSection";
import SubscriptionSection from "./SubscriptionSection";
import AccountSection from "./AccountSection";
import AboutSection from "./AboutSection";
import type { TrainerProfile, SubscriptionInfo, UsageStats } from "@/app/actions/settings";

interface SettingsContentProps {
    profile: TrainerProfile;
    subscription: SubscriptionInfo;
    usage: UsageStats;
}

export default function SettingsContent({ profile, subscription, usage }: SettingsContentProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

    return (
        <div className="space-y-8">
            <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="min-h-[400px]">
                {activeTab === "profile" && <ProfileSection profile={profile} />}
                {activeTab === "subscription" && (
                    <SubscriptionSection subscription={subscription} usage={usage} />
                )}
                {activeTab === "account" && <AccountSection />}
                {activeTab === "about" && <AboutSection />}
            </div>
        </div>
    );
}

import LayoutSidebar from "@/components/layout/LayoutSidebar";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import SettingsContent from "@/components/features/settings/SettingsContent";
import type { SettingsTab } from "@/components/features/settings/SettingsTabs";
import { SignOutButtonSafe } from "@/components/auth/SignOutButtonSafe";
import { getTrainerSettings, getSubscriptionInfo, getUsageStats, getPlatformPlansForSettings } from "@/app/actions/settings";

const VALID_TABS: SettingsTab[] = ["profile", "subscription", "account", "about"];

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolved = await searchParams;
    const tab = resolved?.tab;
    const initialTab: SettingsTab = typeof tab === "string" && VALID_TABS.includes(tab as SettingsTab) ? (tab as SettingsTab) : "profile";

    const [profile, subscription, usage, platformPlans] = await Promise.all([
        getTrainerSettings(),
        getSubscriptionInfo(),
        getUsageStats(),
        getPlatformPlansForSettings(),
    ]);

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24 md:pb-8">
            <LayoutSidebar />

            <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                            Configurações
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Gerencie seu perfil, plano e preferências.
                        </p>
                    </div>

                    <SignOutButtonSafe className="px-6 py-3 bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-500/30 transition-all flex items-center gap-2 disabled:opacity-70">
                        <SignOut size={20} weight="bold" />
                        Sair da Conta
                    </SignOutButtonSafe>
                </header>

                <SettingsContent
                    profile={profile}
                    subscription={subscription}
                    usage={usage}
                    platformPlans={platformPlans}
                    initialTab={initialTab}
                />
            </main>
        </div>
    );
}

import Sidebar from "@/components/layout/Sidebar";
import { SignOutButton } from "@clerk/nextjs";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import SettingsContent from "@/components/settings/SettingsContent";
import { getTrainerSettings, getSubscriptionInfo, getUsageStats } from "@/app/actions/settings";

export default async function SettingsPage() {
    const [profile, subscription, usage] = await Promise.all([
        getTrainerSettings(),
        getSubscriptionInfo(),
        getUsageStats(),
    ]);

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24 md:pb-8">
            <Sidebar />

            <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                            Configurações
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Gerencie seu perfil, plano e preferências.
                        </p>
                    </div>

                    <SignOutButton redirectUrl="/">
                        <button className="px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all flex items-center gap-2">
                            <SignOut size={20} weight="bold" />
                            Sair da Conta
                        </button>
                    </SignOutButton>
                </header>

                <SettingsContent
                    profile={profile}
                    subscription={subscription}
                    usage={usage}
                />
            </main>
        </div>
    );
}

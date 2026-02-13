import Sidebar from "@/components/layout/Sidebar";
import { UserProfile } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { SignOut } from "@phosphor-icons/react/dist/ssr";

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24 md:pb-8">
            <Sidebar />

            <main className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                            Meu Perfil
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Gerencie sua conta e preferências.
                        </p>
                    </div>

                    <SignOutButton redirectUrl="/">
                        <button className="px-6 py-3 bg-rose-50 text-rose-600 font-bold rounded-2xl hover:bg-rose-100 transition-all flex items-center gap-2">
                            <SignOut size={20} weight="bold" />
                            Sair da Conta
                        </button>
                    </SignOutButton>
                </header>

                <div className="bg-pure-white rounded-[2rem] soft-shadow overflow-hidden border border-slate-100">
                    <div className="p-2 md:p-4 overflow-x-auto">
                        <UserProfile
                            path="/dashboard/settings"
                            appearance={{
                                elements: {
                                    rootBox: "w-full mx-auto",
                                    card: "shadow-none border-none p-0 w-full",
                                    navbar: "hidden md:flex",
                                    navbarMobileMenuButton: "text-graphite-dark",
                                    headerTitle: "text-xl font-bold text-graphite-dark",
                                    headerSubtitle: "text-slate-500",
                                    profileSectionTitleText: "text-graphite-dark font-bold",
                                    accordionTriggerButton: "text-graphite-dark font-bold",
                                    formButtonPrimary: "bg-performance-green hover:bg-emerald-600 text-white font-bold",
                                }
                            }}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

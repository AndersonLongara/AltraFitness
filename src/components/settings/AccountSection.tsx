"use client";

import { UserProfile } from "@clerk/nextjs";

export default function AccountSection() {
    return (
        <div className="space-y-6">
            {/* Clerk UserProfile embedded */}
            <div className="bg-white rounded-[32px] soft-shadow overflow-hidden border border-slate-100">
                <div className="p-2 md:p-4 overflow-x-auto">
                    <UserProfile
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
                                formButtonPrimary:
                                    "bg-performance-green hover:bg-emerald-600 text-white font-bold rounded-xl",
                                formFieldInput:
                                    "rounded-xl border-slate-200 focus:border-performance-green focus:ring-performance-green/20",
                                badge: "bg-performance-green/10 text-performance-green font-bold",
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

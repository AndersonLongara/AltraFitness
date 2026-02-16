"use client";

import { UserProfile } from "@clerk/nextjs";

export default function AccountSection() {
    return (
        <div className="space-y-6">
            {/* Clerk UserProfile embedded */}
            <div className="bg-white dark:bg-[#1E2A36] rounded-[32px] soft-shadow overflow-hidden border border-slate-100 dark:border-white/10">
                <div className="p-2 md:p-4 overflow-x-auto">
                    <UserProfile
                        appearance={{
                            variables: {
                                colorBackground: "transparent",
                                colorText: "inherit",
                                colorTextSecondary: "#94A3B8",
                            },
                            elements: {
                                rootBox: "w-full mx-auto",
                                card: "shadow-none border-none p-0 w-full !bg-transparent",
                                navbar: "hidden md:flex",
                                navbarMobileMenuButton: "text-graphite-dark dark:text-white",
                                navbarButton: "dark:text-slate-300 dark:hover:text-white",
                                navbarButtonActive: "dark:text-white",
                                pageScrollBox: "!bg-transparent",
                                page: "!bg-transparent",
                                headerTitle: "text-xl font-bold text-graphite-dark dark:text-white",
                                headerSubtitle: "text-slate-500 dark:text-slate-400",
                                profileSectionTitleText: "text-graphite-dark dark:text-white font-bold",
                                profileSectionContent: "dark:text-slate-300",
                                profileSectionPrimaryButton: "dark:text-slate-300",
                                accordionTriggerButton: "text-graphite-dark dark:text-white font-bold",
                                accordionContent: "dark:text-slate-300",
                                formButtonPrimary:
                                    "bg-performance-green hover:bg-emerald-600 text-white font-bold rounded-xl",
                                formFieldInput:
                                    "rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white focus:border-performance-green focus:ring-performance-green/20",
                                formFieldLabel: "dark:text-slate-400",
                                badge: "bg-performance-green/10 text-performance-green font-bold",
                                userPreviewMainIdentifier: "dark:text-white",
                                userPreviewSecondaryIdentifier: "dark:text-slate-400",
                                footer: "hidden",
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

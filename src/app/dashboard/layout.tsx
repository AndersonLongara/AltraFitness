import { redirect } from "next/navigation";
import React from "react";
import { getRole } from "@/lib/auth-helpers";
import { auth } from "@clerk/nextjs/server";
import { hasSalesAccess } from "@/app/actions/settings";
import { SubscriptionNavProvider } from "@/app/providers/SubscriptionNavProvider";
import SyncThemeFromDb from "./SyncThemeFromDb";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const role = await getRole();
    if (!role) redirect("/onboarding");
    if (role !== "trainer") {
        if (role === "superadmin") redirect("/superadmin");
        redirect("/student");
    }

    const salesAccess = await hasSalesAccess();

    return (
        <SubscriptionNavProvider hasSalesAccess={salesAccess}>
            <SyncThemeFromDb />
            <div className="min-h-screen bg-gray-50 dark:bg-[#131B23]">
                {children}
            </div>
        </SubscriptionNavProvider>
    );
}

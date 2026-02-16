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
    let userId: string | null = null;
    try {
        const session = await auth();
        userId = session?.userId ?? null;
    } catch {
        redirect("/sign-in");
    }
    if (!userId) redirect("/sign-in");

    const role = await getRole();
    if (!role) redirect("/onboarding");
    if (role !== "trainer") {
        if (role === "superadmin") redirect("/superadmin");
        redirect("/student");
    }

    let salesAccess = false;
    try {
        salesAccess = await hasSalesAccess();
    } catch {
        // fallback para não derrubar o layout
    }

    return (
        <SubscriptionNavProvider hasSalesAccess={salesAccess}>
            <SyncThemeFromDb />
            <div className="min-h-screen bg-gray-50 dark:bg-[#131B23]">
                {children}
            </div>
        </SubscriptionNavProvider>
    );
}

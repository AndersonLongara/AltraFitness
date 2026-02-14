import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();
    
    if (!userId) {
        redirect("/sign-in");
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata.role as string | undefined;

    if (!role) {
        redirect("/onboarding");
    }

    if (role !== "trainer") {
        redirect("/student");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
}

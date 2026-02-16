import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import LayoutSuperAdminSidebar from "@/components/layout/LayoutSuperAdminSidebar";
import { getRole } from "@/lib/auth-helpers";

export default async function SuperAdminLayout({
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
  if (role !== "superadmin") {
    if (role === "trainer") redirect("/dashboard");
    if (role === "student") redirect("/student");
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#131B23]">
      <LayoutSuperAdminSidebar />
      <main className="pl-0 md:pl-24 pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-6 md:py-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import LayoutSidebar from "@/components/layout/LayoutSidebar";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { leads, plans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import SalesPageContent from "@/components/sales/SalesPageContent";
import { hasSalesAccess } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const salesAccess = await hasSalesAccess();
    if (!salesAccess) {
        redirect("/dashboard");
    }

    const leadsList = await db.query.leads.findMany({
        where: eq(leads.trainerId, userId),
        orderBy: [desc(leads.createdAt)],
    });

    const plansList = await db.query.plans.findMany({
        where: eq(plans.trainerId, userId),
    });

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-full mx-auto p-4 md:p-6 space-y-8">
                <SalesPageContent leadsList={leadsList as any} plansList={plansList} />
            </main>
        </div>
    );
}

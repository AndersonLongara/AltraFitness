import Sidebar from "@/components/layout/Sidebar";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { leads, plans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import SalesPageContent from "@/components/sales/SalesPageContent";

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const leadsList = await db.query.leads.findMany({
        where: eq(leads.trainerId, userId),
        orderBy: [desc(leads.createdAt)],
    });

    const plansList = await db.query.plans.findMany({
        where: eq(plans.trainerId, userId),
    });

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-full mx-auto p-4 md:p-6 space-y-8">
                <SalesPageContent leadsList={leadsList as any} plansList={plansList} />
            </main>
        </div>
    );
}

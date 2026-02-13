import Sidebar from "@/components/layout/Sidebar";
import PlansManager from "@/components/financial/PlansManager";
import FinancialHeader from "@/components/financial/FinancialHeader";
import PaymentsList from "@/components/financial/PaymentsList";
import SubscriptionsList from "@/components/financial/SubscriptionsList";
import { db } from "@/db";
import { plans, payments, students } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function FinancialPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const plansList = await db.select().from(plans).where(eq(plans.trainerId, userId));
    const paymentsList = await db.query.payments.findMany({
        where: eq(payments.trainerId, userId),
        with: {
            student: { columns: { name: true } },
            plan: { columns: { name: true } },
        },
        orderBy: (payments: any, { desc }: any) => [desc(payments.dueDate)],
    });

    const studentsList = await db.select({ id: students.id, name: students.name })
        .from(students)
        .where(eq(students.trainerId, userId));

    const subscriptionsList = await db.query.students.findMany({
        where: eq(students.trainerId, userId),
        with: {
            plan: { columns: { name: true, durationMonths: true } },
        },
        columns: { id: true, name: true, planId: true, planEnd: true },
    });

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <FinancialHeader />

                <div className="grid grid-cols-1 gap-6">
                    {/* Summary / Stats (Placeholder) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-graphite-dark text-white p-6 rounded-3xl soft-shadow col-span-1 md:col-span-1">
                            <h3 className="text-lg font-bold mb-4 opacity-90">Resumo Estimado</h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-slate-400 text-xs font-bold uppercase">Receita Mensal Recorrente</span>
                                    <div className="text-3xl font-extrabold text-emerald-400">R$ --,--</div>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-xs font-bold uppercase">Planos Ativos</span>
                                    <div className="text-xl font-bold">{plansList.filter((p: any) => p.active).length}</div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <PlansManager plans={plansList} />
                        </div>
                    </div>

                    {/* Subscriptions List */}
                    <div className="col-span-1">
                        <SubscriptionsList subscriptions={subscriptionsList as any} plans={plansList} />
                    </div>

                    {/* Payments List */}
                    <div className="col-span-1">
                        <PaymentsList payments={paymentsList as any} students={studentsList} />
                    </div>
                </div>
            </main>
        </div>
    );
}


import { Plus, MagnifyingGlass, Cookie, CaretRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { LayoutSidebar } from "@/components/layout";
import Link from "next/link";
import { db } from "@/db";
import { nutritionalPlans } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function DietTemplatesPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const templates = await db.query.nutritionalPlans.findMany({
        where: and(
            eq(nutritionalPlans.trainerId, userId),
            eq(nutritionalPlans.isTemplate, true)
        ),
        orderBy: (plans: any, { desc }: any) => [desc(plans.createdAt)],
    });

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                        <Link href="/dashboard/nutrition" className="p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <ArrowLeft size={24} weight="bold" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                                Modelos de Dieta
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                                Crie modelos reutilizáveis para agilizar suas prescrições.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/nutrition/templates/new"
                        className="px-6 py-4 bg-graphite-dark dark:bg-amber-500 dark:text-white text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"
                    >
                        <Plus size={20} weight="bold" />
                        Novo Modelo
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((plan) => (
                        <div key={plan.id} className="bg-pure-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-50 dark:border-white/10 group hover:border-amber-200 dark:hover:border-amber-500/40 transition-all cursor-pointer text-left">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-amber-500/30 transition-colors">
                                    <Cookie size={28} weight="duotone" />
                                </div>
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/30">
                                    Modelo
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-graphite-dark dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {plan.title}
                            </h3>

                            <div className="flex gap-4 mb-6 mt-4">
                                <div className="bg-slate-50 dark:bg-white/10 px-3 py-2 rounded-xl text-center flex-1">
                                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Kcal</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-200">{plan.dailyKcal}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/10 px-3 py-2 rounded-xl text-center flex-1">
                                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Prot</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-200">{plan.proteinG}g</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-white/10 px-3 py-2 rounded-xl text-center flex-1">
                                    <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Carbs</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-200">{plan.carbsG}g</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-white/10 flex items-center justify-between">
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                    {plan.createdAt ? format(new Date(plan.createdAt), "dd MMM") : "--"}
                                </span>
                                <Link href={`/dashboard/nutrition/templates/${plan.id}/edit`} className="flex items-center gap-1 text-sm font-bold text-slate-400 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    Editar <CaretRight size={14} weight="bold" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {templates.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-white/5 rounded-4xl border-2 border-dashed border-slate-200 dark:border-white/15">
                            <div className="w-16 h-16 bg-white dark:bg-[#1E2A36] rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-500 mx-auto mb-4 soft-shadow border border-slate-100 dark:border-white/10">
                                <Cookie size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400 dark:text-slate-400">Nenhum modelo criado</h3>
                            <Link href="/dashboard/nutrition/templates/new" className="text-amber-600 dark:text-amber-400 font-bold text-sm mt-2 inline-block hover:underline">
                                Criar primeiro modelo
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

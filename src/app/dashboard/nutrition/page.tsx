import { Plus, MagnifyingGlass, User, CaretRight, Cookie, Copy, BookOpen } from "@phosphor-icons/react/dist/ssr";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import Link from "next/link";
import { db } from "@/db";
import { nutritionalPlans } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function NutritionHubPage() {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const plansList = await db.query.nutritionalPlans.findMany({
            where: and(
                eq(nutritionalPlans.trainerId, userId),
                eq(nutritionalPlans.isTemplate, false)
            ),
            with: {
                student: {
                    columns: {
                        name: true,
                        photoUrl: true
                    }
                }
            },
            orderBy: (plans: any, { desc }: any) => [desc(plans.createdAt)],
        });
        
        return renderPage(plansList);
    } catch (error) {
        console.error('[NutritionHub] Error:', error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-ice-white dark:bg-[#131B23]">
                <div className="bg-white dark:bg-[#1E2A36] p-8 rounded-2xl shadow-lg max-w-md border border-slate-100 dark:border-white/10">
                    <h1 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Erro ao carregar nutrição</h1>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
                    <a href="/dashboard" className="mt-4 inline-block text-emerald-600 dark:text-performance-green font-medium hover:underline">Voltar ao Dashboard</a>
                </div>
            </div>
        );
    }
}

function renderPage(plansList: any[]) {

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight text-left">
                            Nutrição & Dietas
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2 text-left">
                            Prescreva planos alimentares e acompanhe macros.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/nutrition/templates"
                            className="px-6 py-4 bg-white dark:bg-[#1E2A36] text-amber-600 dark:text-amber-400 font-bold rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors flex items-center gap-2 border border-amber-100 dark:border-amber-500/20 soft-shadow"
                        >
                            <Copy size={20} weight="bold" />
                            Modelos
                        </Link>
                        <Link
                            href="/dashboard/nutrition/library"
                            className="px-6 py-4 bg-white dark:bg-[#1E2A36] text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2 border border-slate-100 dark:border-white/10 soft-shadow"
                        >
                            <BookOpen size={20} weight="bold" />
                            Biblioteca
                        </Link>
                        <Link
                            href="/dashboard/nutrition/new"
                            className="px-6 py-4 bg-graphite-dark dark:bg-amber-500 dark:text-white text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"
                        >
                            <Plus size={20} weight="bold" />
                            Novo Plano
                        </Link>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-white dark:bg-[#1E2A36] px-4 py-4 rounded-2xl soft-shadow border border-slate-100 dark:border-white/10 flex items-center">
                        <MagnifyingGlass size={20} className="text-slate-400 dark:text-slate-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Buscar por plano ou aluno..."
                            className="bg-transparent outline-none text-sm font-medium text-slate-600 dark:text-slate-200 w-full placeholder:text-slate-300 dark:placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Plans List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plansList.map((plan) => (
                        <div key={plan.id} className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 group hover:border-performance-green dark:hover:border-performance-green/50 transition-all cursor-pointer text-left">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center group-hover:bg-performance-green group-hover:text-graphite-dark dark:group-hover:text-graphite-dark transition-colors">
                                    <Cookie size={28} weight="duotone" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.active ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500'}`}>
                                    {plan.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-graphite-dark dark:text-white mb-1 group-hover:text-performance-green transition-colors">
                                {plan.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/20 overflow-hidden">
                                    {plan.student?.photoUrl ? (
                                        <img src={plan.student.photoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={12} weight="fill" className="text-slate-400 dark:text-slate-500 m-auto" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{plan.student?.name || "Sem Aluno"}</span>
                            </div>

                            <div className="flex gap-4 mb-6">
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

                            <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                    {plan.createdAt ? format(new Date(plan.createdAt), "dd MMM") : "--"}
                                </span>
                                <Link href={`/dashboard/students/${plan.studentId}/diet/${plan.id}/edit`} className="flex items-center gap-1 text-sm font-bold text-slate-400 dark:text-slate-500 group-hover:text-graphite-dark dark:group-hover:text-white transition-colors">
                                    Editar <CaretRight size={14} weight="bold" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {plansList.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-white/5 rounded-4xl border-2 border-dashed border-slate-200 dark:border-white/10">
                            <div className="w-16 h-16 bg-white dark:bg-[#1E2A36] rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-500 mx-auto mb-4 soft-shadow">
                                <Cookie size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400 dark:text-slate-400">Nenhum plano prescrito</h3>
                            <Link href="/dashboard/nutrition/new" className="text-performance-green font-bold text-sm mt-2 inline-block hover:underline">
                                Criar prescrição nutricional
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

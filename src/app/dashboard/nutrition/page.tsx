import { Plus, MagnifyingGlass, User, CaretRight, Cookie, Copy, BookOpen } from "@phosphor-icons/react/dist/ssr";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { db } from "@/db";
import { nutritionalPlans } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function NutritionHubPage() {
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

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight text-left">
                            Nutrição & Dietas
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 text-left">
                            Prescreva planos alimentares e acompanhe macros.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/nutrition/templates"
                            className="px-6 py-4 bg-white text-amber-600 font-bold rounded-2xl hover:bg-amber-50 transition-colors flex items-center gap-2 border border-amber-100 soft-shadow"
                        >
                            <Copy size={20} weight="bold" />
                            Modelos
                        </Link>
                        <Link
                            href="/dashboard/nutrition/library"
                            className="px-6 py-4 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-100 soft-shadow"
                        >
                            <BookOpen size={20} weight="bold" />
                            Biblioteca
                        </Link>
                        <Link
                            href="/dashboard/nutrition/new"
                            className="px-6 py-4 bg-graphite-dark text-white font-bold rounded-2xl hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-200"
                        >
                            <Plus size={20} weight="bold" />
                            Novo Plano
                        </Link>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-pure-white px-4 py-4 rounded-2xl soft-shadow border border-slate-100 flex items-center">
                        <MagnifyingGlass size={20} className="text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Buscar por plano ou aluno..."
                            className="bg-transparent outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Plans List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plansList.map((plan) => (
                        <div key={plan.id} className="bg-pure-white p-6 rounded-3xl soft-shadow border border-slate-50 group hover:border-performance-green transition-all cursor-pointer text-left">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-performance-green group-hover:text-graphite-dark transition-colors">
                                    <Cookie size={28} weight="duotone" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {plan.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-graphite-dark mb-1 group-hover:text-performance-green transition-colors">
                                {plan.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                    {plan.student?.photoUrl ? (
                                        <img src={plan.student.photoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={12} weight="fill" className="text-slate-400 m-auto" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-slate-500">{plan.student?.name || "Sem Aluno"}</span>
                            </div>

                            <div className="flex gap-4 mb-6">
                                <div className="bg-slate-50 px-3 py-2 rounded-xl text-center flex-1">
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-tighter">Kcal</span>
                                    <span className="text-sm font-bold text-slate-600">{plan.dailyKcal}</span>
                                </div>
                                <div className="bg-slate-50 px-3 py-2 rounded-xl text-center flex-1">
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-tighter">Prot</span>
                                    <span className="text-sm font-bold text-slate-600">{plan.proteinG}g</span>
                                </div>
                                <div className="bg-slate-50 px-3 py-2 rounded-xl text-center flex-1">
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-tighter">Carbs</span>
                                    <span className="text-sm font-bold text-slate-600">{plan.carbsG}g</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    {plan.createdAt ? format(new Date(plan.createdAt), "dd MMM") : "--"}
                                </span>
                                <Link href={`/dashboard/students/${plan.studentId}/diet/${plan.id}/edit`} className="flex items-center gap-1 text-sm font-bold text-slate-400 group-hover:text-graphite-dark transition-colors">
                                    Editar <CaretRight size={14} weight="bold" />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {plansList.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4 soft-shadow">
                                <Cookie size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400">Nenhum plano prescrito</h3>
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

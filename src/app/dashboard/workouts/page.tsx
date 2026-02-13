import { Plus, MagnifyingGlass, CalendarCheck, User, CaretRight, BookOpen, Copy } from "@phosphor-icons/react/dist/ssr";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { db } from "@/db";
import { workoutPlans } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and, ne } from "drizzle-orm";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function WorkoutsHubPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const plansList = await db.query.workoutPlans.findMany({
        where: and(
            eq(workoutPlans.trainerId, userId),
            eq(workoutPlans.isTemplate, false)
        ),
        with: {
            student: {
                columns: {
                    name: true,
                    photoUrl: true
                }
            },
            workouts: true
        },
        orderBy: (plans: any, { desc }: any) => [desc(plans.createdAt)],
    });

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                            Treinos & Prescrições
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Gerencie planilhas e acompanhe a execução dos alunos.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard/workouts/templates"
                            className="px-6 py-4 bg-white text-amber-600 font-bold rounded-2xl hover:bg-amber-50 transition-colors flex items-center gap-2 border border-amber-100 soft-shadow"
                        >
                            <Copy size={20} weight="bold" />
                            Modelos
                        </Link>
                        <Link
                            href="/dashboard/workouts/library"
                            className="px-6 py-4 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-2 border border-slate-100 soft-shadow"
                        >
                            <BookOpen size={20} weight="bold" />
                            Biblioteca
                        </Link>
                        <Link
                            href="/dashboard/workouts/new"
                            className="px-6 py-4 bg-graphite-dark text-white font-bold rounded-2xl hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-200"
                        >
                            <Plus size={20} weight="bold" />
                            Nova Ficha
                        </Link>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-pure-white px-4 py-4 rounded-2xl soft-shadow border border-slate-100 flex items-center">
                        <MagnifyingGlass size={20} className="text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Buscar por título ou aluno..."
                            className="bg-transparent outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Workout List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plansList.map((plan) => (
                        <Link
                            key={plan.id}
                            href={`/dashboard/workouts/${plan.id}/edit?from=/dashboard/workouts`}
                            className="bg-pure-white p-6 rounded-3xl soft-shadow border border-slate-50 group hover:border-performance-green transition-all cursor-pointer block"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-performance-green group-hover:text-graphite-dark transition-colors">
                                    <CalendarCheck size={28} weight="duotone" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {plan.active ? 'Ativa' : 'Inativa'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-graphite-dark mb-1 group-hover:text-performance-green transition-colors line-clamp-1">
                                {plan.name}
                            </h3>

                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                                    {plan.student?.photoUrl ? (
                                        <img src={plan.student.photoUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={12} weight="fill" className="text-slate-400 m-auto" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-slate-500">{plan.student?.name || "Sem Aluno"}</span>
                            </div>

                            <div className="flex gap-1 mb-6">
                                {plan.workouts.map((w: any, idx: number) => (
                                    <span key={w.id} className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-md">
                                        Treino {String.fromCharCode(65 + idx)}
                                    </span>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    {plan.createdAt ? format(new Date(plan.createdAt), "dd MMM") : "--"}
                                </span>
                                <div className="flex items-center gap-1 text-sm font-bold text-slate-400 group-hover:text-graphite-dark transition-colors">
                                    Editar <CaretRight size={14} weight="bold" />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {plansList.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4 soft-shadow">
                                <CalendarCheck size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400">Nenhuma ficha prescrita</h3>
                            <Link href="/dashboard/workouts/new" className="text-performance-green font-bold text-sm mt-2 inline-block hover:underline">
                                Começar nova ficha
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

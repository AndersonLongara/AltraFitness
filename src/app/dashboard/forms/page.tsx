import { getForms } from "@/app/actions/forms";
import Link from "next/link";
import { Plus, NotePencil } from "@phosphor-icons/react/dist/ssr";
import LayoutSidebar from "@/components/layout/LayoutSidebar";

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
    const forms = await getForms();

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                            Formulários
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                            Crie questionários de check-in, feedback e onboarding para seus alunos.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/forms/new"
                        className="px-6 py-4 bg-graphite-dark dark:bg-amber-500 dark:text-white text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-amber-600 transition-colors shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2"
                    >
                        <Plus size={20} weight="bold" />
                        Novo Formulário
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <div
                            key={form.id}
                            className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 relative group hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all"
                        >
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/dashboard/forms/${form.id}/edit`}
                                    className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                >
                                    <NotePencil size={20} weight="bold" />
                                </Link>
                            </div>

                            <div className="mb-4">
                                <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3 ${
                                        form.isActive
                                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                                    }`}
                                >
                                    {form.isActive ? 'Ativo' : 'Rascunho'}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{form.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{form.description || 'Sem descrição.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/10 pt-4 mt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trigger</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                                        {form.triggerType === 'manual' ? 'Manual' : form.triggerType?.replace('_', ' ') || 'N/A'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Perguntas</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{form.questions?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {forms.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-white/5">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                                <NotePencil size={32} weight="duotone" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-200 mb-2">Nenhum formulário criado</h3>
                            <p className="text-slate-400 dark:text-slate-500 mb-6">Comece criando um check-in ou pesquisa para seus alunos.</p>
                            <Link
                                href="/dashboard/forms/new"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-performance-green dark:bg-emerald-500 dark:text-white text-graphite-dark font-bold rounded-xl hover:brightness-110 transition-all"
                            >
                                <Plus size={18} weight="bold" />
                                Criar primeiro formulário
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

import { getForms } from "@/app/actions/forms";
import Link from "next/link";
import { Plus, NotePencil, Eye, Trash, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";

import Sidebar from "@/components/layout/Sidebar";

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
    const forms = await getForms();

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                            Formulários
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">
                            Crie questionários de check-in, feedback e onboarding para seus alunos.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/forms/new"
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                    >
                        <Plus size={20} weight="bold" />
                        Novo Formulário
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map((form) => (
                        <div key={form.id} className="bg-pure-white p-6 rounded-3xl soft-shadow border border-slate-50 relative group hover:border-emerald-100 transition-all">
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/dashboard/forms/${form.id}/edit`} className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                    <NotePencil size={20} weight="bold" />
                                </Link>
                            </div>

                            <div className="mb-4">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3 ${form.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {form.isActive ? 'Ativo' : 'Rascunho'}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{form.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2">{form.description || 'Sem descrição.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 mt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trigger</p>
                                    <p className="text-sm font-bold text-slate-700 capitalize">
                                        {form.triggerType === 'manual' ? 'Manual' : form.triggerType?.replace('_', ' ') || 'N/A'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Perguntas</p>
                                    <p className="text-sm font-bold text-slate-700">{form.questions?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {forms.length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <NotePencil size={32} weight="fill" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-600 mb-2">Nenhum formulário criado</h3>
                            <p className="text-slate-400 mb-6">Comece criando um check-in ou pesquisa para seus alunos.</p>
                            <Link
                                href="/dashboard/forms/new"
                                className="text-emerald-600 font-bold hover:underline"
                            >
                                Criar primeira formulário
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

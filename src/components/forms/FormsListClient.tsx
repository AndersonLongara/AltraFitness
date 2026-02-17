'use client';

import { useState } from "react";
import Link from "next/link";
import { Plus, NotePencil, ChatCenteredText, CaretLeft, CaretRight } from "@phosphor-icons/react";

interface Form {
    id: string;
    title: string;
    description: string | null;
    type: string | null;
    triggerType: string | null;
    isActive: boolean | null;
    questions: any[];
}

interface FormsListClientProps {
    forms: Form[];
    questionnaires: Form[];
}

const ITEMS_PER_PAGE = 6;

export default function FormsListClient({ forms, questionnaires }: FormsListClientProps) {
    const [formsPage, setFormsPage] = useState(1);
    const [questionnairesPage, setQuestionnairesPage] = useState(1);

    const paginatedForms = forms.slice((formsPage - 1) * ITEMS_PER_PAGE, formsPage * ITEMS_PER_PAGE);
    const paginatedQuestionnaires = questionnaires.slice((questionnairesPage - 1) * ITEMS_PER_PAGE, questionnairesPage * ITEMS_PER_PAGE);

    const totalFormsPages = Math.ceil(forms.length / ITEMS_PER_PAGE);
    const totalQuestionnairesPages = Math.ceil(questionnaires.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-12">
            {/* Formulários Section */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-graphite-dark dark:text-white tracking-tight flex items-center gap-2">
                            <NotePencil size={28} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                            Formulários
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Check-ins, feedback e onboarding para alunos
                        </p>
                    </div>
                    <Link
                        href="/dashboard/forms/new"
                        className="px-6 py-3 bg-performance-green dark:bg-emerald-500 text-graphite-dark dark:text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2"
                    >
                        <Plus size={20} weight="bold" />
                        Novo Formulário
                    </Link>
                </div>

                {forms.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedForms.map((form) => (
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
                        </div>

                        {/* Pagination Controls for Forms */}
                        {totalFormsPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <button
                                    onClick={() => setFormsPage(p => Math.max(1, p - 1))}
                                    disabled={formsPage === 1}
                                    className="p-3 rounded-xl bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <CaretLeft size={20} weight="bold" />
                                </button>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 px-4 py-2 bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 rounded-xl">
                                    Página {formsPage} de {totalFormsPages}
                                </span>
                                <button
                                    onClick={() => setFormsPage(p => Math.min(totalFormsPages, p + 1))}
                                    disabled={formsPage >= totalFormsPages}
                                    className="p-3 rounded-xl bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <CaretRight size={20} weight="bold" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-white/5">
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
            </section>

            {/* Divider */}
            <div className="border-t-2 border-slate-200 dark:border-white/10"></div>

            {/* Questionários Section */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-graphite-dark dark:text-white tracking-tight flex items-center gap-2">
                            <ChatCenteredText size={28} weight="duotone" className="text-blue-600 dark:text-blue-400" />
                            Questionários
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            Templates de questionários para o pipeline de vendas
                        </p>
                    </div>
                    <Link
                        href="/dashboard/forms/new?type=lead_questionnaire"
                        className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                    >
                        <Plus size={20} weight="bold" />
                        Novo Questionário
                    </Link>
                </div>

                {questionnaires.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedQuestionnaires.map((questionnaire) => (
                                <div
                                    key={questionnaire.id}
                                    className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 relative group hover:border-blue-200 dark:hover:border-blue-500/30 transition-all"
                                >
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/dashboard/forms/${questionnaire.id}/edit`}
                                            className="p-2 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        >
                                            <NotePencil size={20} weight="bold" />
                                        </Link>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span
                                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                    questionnaire.isActive
                                                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                        : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                                                }`}
                                            >
                                                {questionnaire.isActive ? 'Ativo' : 'Rascunho'}
                                            </span>
                                            {questionnaire.triggerType === 'on_scheduled' && (
                                                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full uppercase tracking-wide">
                                                    Auto
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{questionnaire.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{questionnaire.description || 'Sem descrição.'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-white/10 pt-4 mt-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trigger</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                                                {questionnaire.triggerType === 'manual' ? 'Manual' : questionnaire.triggerType?.replace('_', ' ') || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Perguntas</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{questionnaire.questions?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls for Questionnaires */}
                        {totalQuestionnairesPages > 1 && (
                            <div className="flex items-center justify-center gap-3 mt-8">
                                <button
                                    onClick={() => setQuestionnairesPage(p => Math.max(1, p - 1))}
                                    disabled={questionnairesPage === 1}
                                    className="p-3 rounded-xl bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <CaretLeft size={20} weight="bold" />
                                </button>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 px-4 py-2 bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 rounded-xl">
                                    Página {questionnairesPage} de {totalQuestionnairesPages}
                                </span>
                                <button
                                    onClick={() => setQuestionnairesPage(p => Math.min(totalQuestionnairesPages, p + 1))}
                                    disabled={questionnairesPage >= totalQuestionnairesPages}
                                    className="p-3 rounded-xl bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <CaretRight size={20} weight="bold" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-white/5">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                            <ChatCenteredText size={32} weight="duotone" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-600 dark:text-slate-200 mb-2">Nenhum questionário criado</h3>
                        <p className="text-slate-400 dark:text-slate-500 mb-6">Crie questionários para qualificar seus leads.</p>
                        <Link
                            href="/dashboard/forms/new?type=lead_questionnaire"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all"
                        >
                            <Plus size={18} weight="bold" />
                            Criar primeiro questionário
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}

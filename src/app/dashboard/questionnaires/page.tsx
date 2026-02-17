import { getLeadQuestionnaireTemplates } from "@/app/actions/lead-forms";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import Link from "next/link";
import { Plus, ChatCenteredText, Eye, Pencil, Calendar, ListNumbers } from "@phosphor-icons/react/dist/ssr";

export default async function QuestionnairesPage() {
    const questionnaires = await getLeadQuestionnaireTemplates();
    
    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24">
            <LayoutSidebar />
            
            <main className="max-w-7xl mx-auto p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                            Questionários para Leads
                        </h1>
                        <p className="text-soft-gray dark:text-gray-400 mt-1">
                            Gerencie templates de questionários para o pipeline de vendas
                        </p>
                    </div>
                    <Link
                        href="/dashboard/questionnaires/new"
                        className="px-6 py-3 bg-performance-green text-graphite-dark font-bold rounded-2xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={20} weight="bold" />
                        Novo Questionário
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                <ChatCenteredText size={24} weight="bold" className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
                                <p className="text-2xl font-extrabold text-graphite-dark dark:text-white">{questionnaires.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Calendar size={24} weight="bold" className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Automáticos</p>
                                <p className="text-2xl font-extrabold text-graphite-dark dark:text-white">
                                    {questionnaires.filter(q => q.triggerType === 'on_scheduled').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <ListNumbers size={24} weight="bold" className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Perguntas</p>
                                <p className="text-2xl font-extrabold text-graphite-dark dark:text-white">
                                    {questionnaires.reduce((sum, q) => sum + q.questions.length, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questionnaires List */}
                {questionnaires.length === 0 ? (
                    <div className="bg-white dark:bg-[#1E2A36] p-12 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 text-center">
                        <div className="mb-4 text-6xl">📝</div>
                        <h3 className="text-xl font-bold text-graphite-dark dark:text-white mb-2">
                            Nenhum questionário criado ainda
                        </h3>
                        <p className="text-soft-gray dark:text-gray-400 mb-6">
                            Crie seu primeiro questionário para começar a qualificar seus leads
                        </p>
                        <Link
                            href="/dashboard/questionnaires/new"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-performance-green text-graphite-dark font-bold rounded-2xl hover:brightness-110 transition-all"
                        >
                            <Plus size={20} weight="bold" />
                            Criar Primeiro Questionário
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {questionnaires.map((questionnaire) => (
                            <div
                                key={questionnaire.id}
                                className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-600 transition-all group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-4">
                                        <ChatCenteredText size={24} weight="bold" className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    {questionnaire.triggerType === 'on_scheduled' && (
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                            Auto
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-extrabold text-graphite-dark dark:text-white mb-2 line-clamp-2">
                                    {questionnaire.title}
                                </h3>
                                {questionnaire.description && (
                                    <p className="text-sm text-soft-gray dark:text-gray-400 mb-4 line-clamp-2">
                                        {questionnaire.description}
                                    </p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <ListNumbers size={16} />
                                        {questionnaire.questions.length} perguntas
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/10">
                                    <Link
                                        href={`/dashboard/questionnaires/${questionnaire.id}`}
                                        className="flex-1 px-4 py-2 bg-slate-100 dark:bg-white/10 text-graphite-dark dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Eye size={16} weight="bold" />
                                        Ver
                                    </Link>
                                    <Link
                                        href={`/dashboard/questionnaires/${questionnaire.id}/edit`}
                                        className="flex-1 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Pencil size={16} weight="bold" />
                                        Editar
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

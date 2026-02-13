import { getStudentAssessments } from "@/app/actions/assessments";
import { Plus, CaretRight, TrendUp, TrendDown, Minus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BackButton from "@/components/ui/BackButton";

export default async function AssessmentsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const assessments = await getStudentAssessments(id);

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Avaliações Físicas</h1>
                        <p className="text-slate-500 font-medium">Histórico e evolução corporal</p>
                    </div>
                </div>
                <Link
                    href={`/dashboard/students/${id}/assessments/new`}
                    className="flex items-center gap-2 bg-graphite-dark text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    <Plus size={20} weight="bold" />
                    Nova Avaliação
                </Link>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {assessments.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <Plus size={32} weight="bold" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhuma avaliação encontrada</h3>
                        <p className="text-slate-400 mb-6">Realize a primeira avaliação física para começar a monitorar o progresso.</p>
                        <Link
                            href={`/dashboard/students/${id}/assessments/new`}
                            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                        >
                            Começar agora &rarr;
                        </Link>
                    </div>
                ) : (
                    assessments.map((assessment, index) => {
                        const prev = assessments[index + 1];
                        const weightDelta = prev ? assessment.weight - prev.weight : 0;
                        const fatDelta = prev && assessment.bodyFat && prev.bodyFat ? assessment.bodyFat - prev.bodyFat : 0;

                        return (
                            <Link
                                key={assessment.id}
                                href={`/dashboard/students/${id}/assessments/${assessment.id}`}
                                className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                                            <TrendUp size={24} weight="duotone" />
                                            {/* Logic to change icon could be added based on method */}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">
                                                {format(assessment.date, "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                            </h3>
                                            <p className="text-sm text-slate-400 font-medium capitalize">
                                                {assessment.method === 'pollock3' ? 'Pollock 3 Dobras' :
                                                    assessment.method === 'pollock7' ? 'Pollock 7 Dobras' :
                                                        assessment.method === 'guedes' ? 'Guedes' :
                                                            'Bioimpedância'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 sm:gap-12">
                                        {/* Weight */}
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 font-bold uppercase">Peso</p>
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-xl font-black text-slate-700">{assessment.weight.toFixed(1)}kg</span>
                                                {prev && (
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${weightDelta > 0 ? 'bg-emerald-50 text-emerald-600' : weightDelta < 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Body Fat */}
                                        <div className="text-right min-w-[80px]">
                                            <p className="text-xs text-slate-400 font-bold uppercase">% Gordura</p>
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-xl font-black text-slate-700">
                                                    {assessment.bodyFat ? `${assessment.bodyFat.toFixed(1)}%` : '-'}
                                                </span>
                                                {/* Lower body fat is usually better (emerald for negative delta) */}
                                                {prev && assessment.bodyFat && prev.bodyFat && (
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${fatDelta < 0 ? 'bg-emerald-50 text-emerald-600' : fatDelta > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        {fatDelta > 0 ? '+' : ''}{fatDelta.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-100 group-hover:text-slate-500 transition-colors">
                                            <CaretRight size={16} weight="bold" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}

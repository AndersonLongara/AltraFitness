import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CaretRight, ChartLineUp, Scales } from "@phosphor-icons/react/dist/ssr";

interface AssessmentListProps {
    assessments: any[];
    onSelect: (assessment: any) => void;
}

export default function AssessmentList({ assessments, onSelect }: AssessmentListProps) {
    if (!assessments || assessments.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                    <Scales size={32} weight="duotone" />
                </div>
                <h3 className="text-slate-500 font-bold mb-1">Nenhuma avaliação encontrada</h3>
                <p className="text-slate-400 text-sm">Realize a primeira avaliação física para acompanhar o progresso.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {assessments.map((assessment) => (
                <div
                    key={assessment.id}
                    onClick={() => onSelect(assessment)}
                    className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <Calendar size={24} weight="duotone" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-700">
                                {format(new Date(assessment.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                    <Scales size={14} />
                                    {assessment.weight.toFixed(1)} kg
                                </span>
                                {assessment.bodyFat && (
                                    <span className="flex items-center gap-1">
                                        <ChartLineUp size={14} />
                                        {assessment.bodyFat.toFixed(1)}% GC
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                            Ver Detalhes
                        </span>
                        <CaretRight size={18} weight="bold" className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                </div>
            ))}
        </div>
    );
}

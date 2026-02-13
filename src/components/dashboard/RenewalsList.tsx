interface Renewal {
    id: string;
    name: string;
    plan: string;
    daysLeft: number;
    overdue: boolean;
}

interface RecoveriesListProps {
    renewals: Renewal[];
}

export default function RenewalsList({ renewals }: RecoveriesListProps) {
    return (
        <div className="bg-pure-white p-6 md:p-8 rounded-3xl soft-shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-graphite-dark">Próximos Vencimentos</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Status de renovação</p>
                </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {renewals.length > 0 ? (
                    renewals.map((student) => (
                        <div key={student.id} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-performance-green group-hover:text-graphite-dark transition-colors">
                                    {student.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-700">{student.name}</h4>
                                    <p className="text-xs text-slate-400">{student.plan}</p>
                                </div>
                            </div>
                            <div className="text-right whitespace-nowrap">
                                <span className={`text-[10px] md:text-xs font-bold px-2 py-1.5 md:py-2 rounded-xl shrink-0 ${student.overdue ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {student.overdue ? 'Vencido' : `Vence em ${student.daysLeft}d`}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <p className="text-sm font-medium text-slate-400">Nenhum vencimento próximo</p>
                    </div>
                )}
            </div>
        </div>
    );
}

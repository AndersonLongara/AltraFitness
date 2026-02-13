'use client';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { CaretRight, FileText } from "@phosphor-icons/react";

interface Assessment {
    id: string;
    date: string;
    weight: number;
    bodyFat: number | null;
}

interface AssessmentHistoryProps {
    assessments: Assessment[];
}

export default function AssessmentHistory({ assessments }: AssessmentHistoryProps) {
    if (!assessments || assessments.length === 0) return null;

    // Sort by date desc
    const sorted = [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="bg-surface-grey border border-white/5 p-6 rounded-[32px] mb-24 relative overflow-hidden group">
            <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                <span className="w-1.5 h-4 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                Histórico de Avaliações
            </h3>

            <div className="space-y-4">
                {sorted.map((assessment) => (
                    <Link
                        key={assessment.id}
                        href={`/student/evolution/${assessment.id}`}
                        className="flex items-center justify-between p-4 bg-deep-black border border-white/5 rounded-2xl hover:bg-white/5 transition-all group/item"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 group-hover/item:text-amber-500 transition-colors">
                                <FileText size={20} weight="duotone" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover/item:text-amber-400 transition-colors">
                                    {format(parseISO(assessment.date), 'dd MMMM yyyy', { locale: ptBR })}
                                </h4>
                                <div className="flex gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                                    <span>{assessment.weight}kg</span>
                                    {assessment.bodyFat && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-zinc-800 self-center"></span>
                                            <span>{assessment.bodyFat}% Gordura</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <CaretRight size={20} className="text-zinc-800 group-hover/item:text-amber-500 group-hover/item:translate-x-1 transition-all" />
                    </Link>
                ))}
            </div>

            {/* Ambient Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />
        </div>
    );
}

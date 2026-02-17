'use client';

import { useDroppable } from "@dnd-kit/core";

interface PipelineColumnProps {
    id: string;
    title: string;
    leads: any[];
    totalValue?: number;
    children: React.ReactNode;
}

const STAGE_COLORS: Record<string, string> = {
    new: 'text-blue-500 border-blue-500 bg-blue-50',
    contacted: 'text-indigo-500 border-indigo-500 bg-indigo-50',
    scheduled: 'text-amber-500 border-amber-500 bg-amber-50',
    negotiation: 'text-purple-500 border-purple-500 bg-purple-50',
    won: 'text-emerald-500 border-emerald-500 bg-emerald-50',
    lost: 'text-rose-500 border-rose-500 bg-rose-50',
};

export default function PipelineColumn({ id, title, leads, totalValue = 0, children }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const colorClass = STAGE_COLORS[id] || 'text-slate-500 border-slate-300 bg-slate-50';

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-w-[280px] lg:min-w-0 bg-slate-50/50 rounded-[24px] p-3 flex flex-col gap-3 transition-all border-t-4 ${id === 'new' ? 'border-blue-500' : id === 'contacted' ? 'border-indigo-500' : id === 'scheduled' ? 'border-amber-500' : id === 'negotiation' ? 'border-purple-500' : id === 'won' ? 'border-emerald-500' : 'border-rose-500'} ${isOver ? 'bg-slate-100 ring-2 ring-performance-green/20' : ''}`}
        >
            <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-black uppercase tracking-widest ${id === 'won' ? 'text-emerald-600' : 'text-slate-500'}`}>{title}</h3>
                    <span className="bg-white text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-slate-100">
                        {leads.length}
                    </span>
                </div>
                {totalValue > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                        R$ {totalValue.toLocaleString('pt-BR', { notation: "compact", maximumFractionDigits: 1 })}
                    </span>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-3 min-h-[500px]">
                {children}
            </div>
        </div>
    );
}

'use client';

import { Calendar, Barbell, ForkKnife } from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StatsOverviewProps {
    stats: {
        totalWorkouts: number;
        totalMeals: number;
        joinedAt: Date | string;
    };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
    const joinedAtDate = typeof stats.joinedAt === 'string' ? new Date(stats.joinedAt) : stats.joinedAt;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="bg-surface-grey border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center gap-3 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <Barbell size={20} weight="duotone" />
                </div>
                <div>
                    <div className="text-2xl font-black text-white">{stats.totalWorkouts}</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Treinos</div>
                </div>
            </div>

            <div className="bg-surface-grey border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center gap-3 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <ForkKnife size={20} weight="duotone" />
                </div>
                <div>
                    <div className="text-2xl font-black text-white">{stats.totalMeals}</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Refeições</div>
                </div>
            </div>

            <div className="bg-surface-grey border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center text-center gap-3 col-span-2 lg:col-span-1 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <Calendar size={20} weight="duotone" />
                </div>
                <div>
                    <div className="text-sm font-bold text-white">
                        {format(joinedAtDate, "MMM yyyy", { locale: ptBR })}
                    </div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Membro Desde</div>
                </div>
            </div>
        </div>
    );
}

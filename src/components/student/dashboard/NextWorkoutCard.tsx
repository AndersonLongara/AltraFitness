'use client';

import { Barbell, ArrowRight, LightbulbFilament } from "@phosphor-icons/react";
import Link from "next/link";

interface NextWorkoutCardProps {
    workout: {
        id: string;
        title: string;
        muscleGroup?: string; // We might need to fetch this or infer from title
        exerciseCount: number;
    } | null;
}

export default function NextWorkoutCard({ workout }: NextWorkoutCardProps) {
    if (!workout) {
        return (
            <div className="bg-surface-grey p-8 rounded-4xl border border-white/5 flex flex-col items-center justify-center text-center py-10 relative overflow-hidden group">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-acid-lime/10 transition-colors">
                    <Barbell size={32} weight="duotone" className="text-zinc-600 group-hover:text-acid-lime transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Descanso Merecido!</h3>
                <p className="text-sm text-zinc-500 max-w-[200px]">Nenhum treino agendado. Aproveite para recuperar.</p>

                <Link href="/student/workouts" className="mt-6 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold transition-all border border-white/5">
                    Ver Todos os Treinos
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-surface-grey rounded-4xl p-1 pb-1 relative group overflow-hidden border border-white/10">
            {/* Gradient Border Trick if needed, or just inner padding */}
            <div className="bg-surface-grey rounded-[30px] p-6 relative z-10 overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                        <Barbell size={24} weight="fill" className="text-white" />
                    </div>
                    <span className="bg-acid-lime text-black px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(189,255,0,0.3)]">
                        Próximo Treino
                    </span>
                </div>

                <div className="mb-6">
                    <h3 className="text-2xl font-black text-white leading-tight mb-2">{workout.title}</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-zinc-400 text-xs font-medium bg-white/5 px-2 py-1 rounded-md">
                            {workout.exerciseCount} exercícios
                        </span>
                        <span className="text-zinc-400 text-xs font-medium bg-white/5 px-2 py-1 rounded-md">
                            ~45 min
                        </span>
                    </div>
                </div>

                {/* AI Tip */}
                <div className="bg-deep-black/50 rounded-2xl p-4 mb-6 flex gap-3 items-start border border-white/5">
                    <LightbulbFilament size={20} weight="fill" className="text-acid-lime shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        <span className="font-bold text-white block mb-0.5">Dica AI:</span>
                        Concentre-se na fase excêntrica dos movimentos hoje para maximizar a hipertrofia.
                    </p>
                </div>

                <Link href={`/student/workouts/${workout.id}`}>
                    <button className="w-full py-4 bg-acid-lime text-black rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(189,255,0,0.2)]">
                        Começar Agora <ArrowRight weight="bold" />
                    </button>
                </Link>

                {/* Background Decoration */}
                <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 pointer-events-none">
                    <Barbell size={200} weight="fill" className="text-white" />
                </div>
            </div>
        </div>
    );
}

'use client';

import { Barbell, ArrowRight, CheckCircle, Clock } from "@phosphor-icons/react";
import Link from "next/link";

interface WorkoutListProps {
    workouts: {
        id: string;
        title: string;
        exerciseCount: number;
        lastCompleted?: Date | null;
        status?: string; // 'pending', 'completed'
    }[];
}

export default function WorkoutList({ workouts }: WorkoutListProps) {
    if (workouts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface-grey border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                    <Barbell size={32} weight="duotone" />
                </div>
                <h3 className="text-lg font-bold text-white">Nenhum treino disponível</h3>
                <p className="text-zinc-500 text-sm mt-1">
                    Seu treinador ainda não liberou seu plano de treinos.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {workouts.map((workout) => (
                <Link key={workout.id} href={`/student/workouts/${workout.id}`}>
                    <div className="bg-surface-grey p-1 pb-1 rounded-4xl relative group overflow-hidden border border-white/10 transition-all hover:scale-[1.02]">
                        <div className="bg-surface-grey rounded-[30px] p-5 relative z-10">

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <div className="w-10 h-10 bg-white/5 border border-white/5 text-zinc-400 rounded-2xl flex items-center justify-center group-hover:bg-acid-lime group-hover:text-black group-hover:border-acid-lime transition-all duration-300">
                                    <Barbell size={20} weight={workout.lastCompleted ? "fill" : "duotone"} />
                                </div>
                                {workout.lastCompleted && (
                                    <span className="text-[10px] font-bold text-black bg-acid-lime px-2 py-1 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(189,255,0,0.4)]">
                                        <CheckCircle weight="fill" /> Feito
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 relative z-10">{workout.title}</h3>

                            <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium relative z-10">
                                <span className="flex items-center gap-1">
                                    <Barbell size={14} className="text-zinc-600" /> {workout.exerciseCount} exercícios
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} className="text-zinc-600" /> ~45 min
                                </span>
                            </div>

                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <div className="w-8 h-8 bg-acid-lime rounded-full flex items-center justify-center text-black shadow-lg shadow-acid-lime/30">
                                    <ArrowRight weight="bold" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

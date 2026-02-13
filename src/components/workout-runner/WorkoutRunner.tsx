"use client";

import { useState } from "react";
import ExerciseCard from "./ExerciseCard";
import RestTimer from "./RestTimer";
import { CheckCircle, ArrowLeft, Trophy } from "@phosphor-icons/react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { awardXP } from "@/app/actions/gamification";

interface WorkoutRunnerProps {
    workout: {
        id: string;
        title: string;
        studentId?: string;
        scheduledDate?: Date;
        items: any[];
    };
}

export default function WorkoutRunner({ workout }: WorkoutRunnerProps) {
    const [activeRest, setActiveRest] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [xpAwarded, setXpAwarded] = useState(0);

    const handleSetComplete = (restSeconds: number) => {
        if (restSeconds > 0) {
            setActiveRest(restSeconds);
        }
    };

    const handleFinish = async () => {
        setIsFinished(true);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2ECC71', '#10B981', '#F59E0B']
        });

        // Award XP if studentId is available
        if (workout.studentId) {
            let xp = 50; // Base XP

            // Bonus if completed on scheduled date
            if (workout.scheduledDate) {
                const today = new Date().toDateString();
                const scheduled = new Date(workout.scheduledDate).toDateString();
                if (today === scheduled) {
                    xp += 10;
                }
            }

            setXpAwarded(xp);
            await awardXP(workout.studentId, xp);
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen bg-ice-white flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
                    <CheckCircle size={48} weight="fill" />
                </div>
                <h1 className="text-3xl font-extrabold text-graphite-dark">Treino Concluído!</h1>
                <p className="text-slate-500 mt-2 mb-4 max-w-xs mx-auto">
                    Parabéns! Você arrasou no treino "{workout.title}".
                </p>

                {xpAwarded > 0 && (
                    <div className="bg-gradient-to-r from-emerald-100 to-emerald-50 p-4 rounded-2xl mb-8 animate-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-2 justify-center text-performance-green">
                            <Trophy size={24} weight="fill" />
                            <span className="text-2xl font-extrabold">+{xpAwarded} XP</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Continue assim para desbloquear badges!</p>
                    </div>
                )}

                <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-graphite-dark text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
                >
                    Voltar ao Início
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 pb-32">
            {/* Nav */}
            <header className="bg-pure-white p-4 sticky top-0 z-40 shadow-sm flex items-center gap-4">
                <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                    <ArrowLeft size={24} weight="bold" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold text-graphite-dark leading-tight line-clamp-1">{workout.title}</h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{workout.items.length} Exercícios</p>
                </div>
            </header>

            <div className="p-4 md:max-w-xl md:mx-auto space-y-6 mt-4">
                {workout.items.map((item) => (
                    <ExerciseCard
                        key={item.id}
                        exercise={item}
                        onSetComplete={handleSetComplete}
                    />
                ))}
            </div>

            {/* Float Action Button */}
            <div className="fixed bottom-6 left-0 right-0 p-6 md:max-w-xl md:mx-auto z-30 pointer-events-none">
                <button
                    onClick={handleFinish}
                    className="w-full py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl shadow-xl shadow-emerald-200 pointer-events-auto hover:brightness-110 active:scale-95 transition-all"
                >
                    Finalizar Treino
                </button>
            </div>

            {/* Timer Overlay */}
            {activeRest !== null && (
                <RestTimer
                    initialSeconds={activeRest}
                    onComplete={() => setActiveRest(null)}
                    onClose={() => setActiveRest(null)}
                />
            )}
        </div>
    );
}

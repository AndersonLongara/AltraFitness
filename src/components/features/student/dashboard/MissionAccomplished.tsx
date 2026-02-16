'use client';

import { CheckCircle, Trophy } from "@phosphor-icons/react";

interface MissionAccomplishedProps {
    workoutDone: boolean;
    hydrationMet: boolean;
    mealsMet: boolean;
}

export default function MissionAccomplished({ workoutDone, hydrationMet, mealsMet }: MissionAccomplishedProps) {
    const allGoalsMet = workoutDone && hydrationMet && mealsMet;

    if (!allGoalsMet) return null;

    return (
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[24px] p-6 text-white shadow-xl shadow-yellow-200 relative overflow-hidden animate-in slide-in-from-bottom duration-500 mb-6">
            <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <Trophy size={28} weight="fill" className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-black leading-tight">Missão Cumprida!</h3>
                    <p className="text-yellow-50 text-xs font-medium opacity-90">
                        Você destruiu suas metas de hoje.
                    </p>
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12">
                <Trophy size={100} weight="fill" />
            </div>

            {/* Confetti-like decoration (CSS) */}
            <div className="absolute top-2 right-4 w-2 h-2 bg-white rounded-full opacity-50 animate-pulse" />
            <div className="absolute bottom-6 left-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-30" />
        </div>
    );
}

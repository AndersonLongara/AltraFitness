'use client';

import { Trophy } from "@phosphor-icons/react";

interface MissionAccomplishedProps {
    workoutDone: boolean;
    hydrationMet: boolean;
    mealsMet: boolean;
}

const CONFETTI_COLORS = ['#fff', '#fef08a', '#fde047', '#facc15', '#eab308', '#f97316', '#fb923c'];

function ConfettiParticle({ delay, left, color, size, duration }: { delay: number; left: string; color: string; size: number; duration: number }) {
    return (
        <div
            className="absolute rounded-sm confetti-particle"
            style={{
                left,
                width: size,
                height: size * 1.4,
                backgroundColor: color,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
            }}
        />
    );
}

export default function MissionAccomplished({ workoutDone, hydrationMet, mealsMet }: MissionAccomplishedProps) {
    const allGoalsMet = workoutDone && hydrationMet && mealsMet;

    if (!allGoalsMet) return null;

    const particles = Array.from({ length: 24 }, (_, i) => (
        <ConfettiParticle
            key={i}
            delay={i * 0.05}
            left={`${(i * 7) % 100}%`}
            color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
            size={6 + (i % 4) * 2}
            duration={2 + (i % 3) * 0.5}
        />
    ));

    return (
        <>
            <style>{`
                @keyframes confetti-fall {
                    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(120px) rotate(720deg); opacity: 0; }
                }
                .confetti-particle { animation: confetti-fall linear forwards; top: -10px; }
            `}</style>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[24px] p-6 text-white shadow-xl shadow-yellow-200 relative overflow-hidden animate-in slide-in-from-bottom duration-500 mb-6">
                {particles}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Trophy size={28} weight="fill" className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black leading-tight">Missão Cumprida!</h3>
                        <p className="text-yellow-50 text-xs font-medium opacity-90">
                            Você destruiu suas metas de hoje. +50 XP bônus!
                        </p>
                    </div>
                </div>

                <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12 pointer-events-none">
                    <Trophy size={100} weight="fill" />
                </div>
            </div>
        </>
    );
}

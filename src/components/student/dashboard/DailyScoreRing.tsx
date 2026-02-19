'use client';

interface DailyScoreRingProps {
    workoutScore: number;   // 0 or 35
    mealsScore: number;     // 0–35
    hydrationScore: number; // 0–30
    totalScore: number;     // 0–100
}

const TREINO_COLOR = '#2ecc71';
const DIETA_COLOR = '#f97316';
const AGUA_COLOR = '#3b82f6';

export default function DailyScoreRing({
    workoutScore,
    mealsScore,
    hydrationScore,
    totalScore,
}: DailyScoreRingProps) {
    // Segment angles: treino 0–126° (35%), dieta 126–252° (35%), água 252–360° (30%)
    const treinoDeg = Math.min((workoutScore / 35) * 126, 126);
    const dietaDeg = Math.min((mealsScore / 35) * 126, 126);
    const aguaDeg = Math.min((hydrationScore / 30) * 108, 108);

    return (
        <div className="mb-8 flex flex-col items-center">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center ring-track">
                {/* Ring track (background) */}
                <div className="absolute inset-0 rounded-full border-[10px] border-white/10" />
                {/* Filled ring: three segments */}
                <div
                    className="absolute inset-0 rounded-full border-[10px] border-transparent transition-all duration-1000 ease-out"
                    style={{
                        background: `conic-gradient(from 0deg, ${TREINO_COLOR} 0deg ${treinoDeg}deg, rgba(45,45,45,0.9) ${treinoDeg}deg 126deg, ${DIETA_COLOR} 126deg ${126 + dietaDeg}deg, rgba(45,45,45,0.9) ${126 + dietaDeg}deg 252deg, ${AGUA_COLOR} 252deg ${252 + aguaDeg}deg, rgba(45,45,45,0.9) ${252 + aguaDeg}deg 360deg)`,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude',
                        WebkitMaskComposite: 'xor',
                        padding: '10px',
                    } as React.CSSProperties}
                />
                {/* Inner circle (hide center of ring) */}
                <div className="absolute inset-[10px] rounded-full bg-deep-black" />
                {/* Center number */}
                <span className="relative z-10 text-4xl font-black text-white tabular-nums transition-all duration-700">
                    {Math.round(totalScore)}%
                </span>
            </div>
            <div className="mt-4 flex gap-6 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                    <div
                        className={`w-2.5 h-2.5 rounded-full ${workoutScore >= 35 ? 'bg-acid-lime shadow-[0_0_8px_rgba(46,204,113,0.6)]' : 'bg-zinc-600'}`}
                    />
                    <span className="text-zinc-400">Treino</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div
                        className={`w-2.5 h-2.5 rounded-full ${mealsScore >= 35 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-zinc-600'}`}
                    />
                    <span className="text-zinc-400">Dieta</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div
                        className={`w-2.5 h-2.5 rounded-full ${hydrationScore >= 30 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-zinc-600'}`}
                    />
                    <span className="text-zinc-400">Água</span>
                </div>
            </div>
            <p className="mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Pontuação do dia
            </p>
        </div>
    );
}

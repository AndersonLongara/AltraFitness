"use client";

interface XPProgressBarProps {
    currentXP: number;
    level?: number;
}

export default function XPProgressBar({ currentXP, level }: XPProgressBarProps) {
    const calculatedLevel = level ?? Math.floor(currentXP / 100);
    const xpInCurrentLevel = currentXP % 100;
    const xpForNextLevel = 100;
    const progress = (xpInCurrentLevel / xpForNextLevel) * 100;

    return (
        <div className="bg-gradient-to-r from-emerald-100 to-emerald-50 p-6 rounded-3xl soft-shadow">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Nível</h3>
                    <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-600">
                        {calculatedLevel}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">XP Total</p>
                    <p className="text-2xl font-extrabold text-graphite-dark">{currentXP}</p>
                </div>
            </div>

            <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex justify-between mt-2 text-xs font-bold text-slate-500">
                <span>{xpInCurrentLevel} XP</span>
                <span>{xpForNextLevel} XP</span>
            </div>
        </div>
    );
}

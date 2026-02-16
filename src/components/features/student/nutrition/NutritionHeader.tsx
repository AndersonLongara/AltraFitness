'use client';

interface NutritionHeaderProps {
    dailyKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    consumed: {
        kcal: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

export default function NutritionHeader({ dailyKcal, proteinG, carbsG, fatG, consumed }: NutritionHeaderProps) {

    const percentage = (current: number, target: number) => {
        if (target === 0) return 0;
        return Math.min(100, Math.round((current / target) * 100));
    };

    return (
        <div className="bg-surface-grey border border-white/5 rounded-[32px] p-6 mb-8 relative overflow-hidden">
            <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Meta Diária</span>
                    <h1 className="text-3xl font-black text-white leading-none mt-1">
                        {dailyKcal} <span className="text-lg font-bold text-zinc-600">kcal</span>
                    </h1>
                </div>
                <div className="text-right">
                    <div className="inline-block">
                        <span className="text-[10px] font-bold text-acid-lime uppercase tracking-wider block mb-1">Consumido</span>
                        <div className="bg-acid-lime/10 border border-acid-lime/20 px-3 py-1 rounded-lg">
                            <h2 className="text-xl font-bold text-acid-lime leading-none">
                                {consumed.kcal} kcal
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
                {/* Protein */}
                <div className="bg-deep-black border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Proteína</span>
                    <div className="w-14 h-14 rounded-full border-4 border-white/5 border-t-purple-500 flex items-center justify-center mb-1 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
                        <span className="text-xs font-bold text-white z-10">{Math.round(consumed.protein)}g</span>
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1">/ {proteinG}g</span>
                </div>

                {/* Carbs */}
                <div className="bg-deep-black border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Carbo</span>
                    <div className="w-14 h-14 rounded-full border-4 border-white/5 border-t-amber-500 flex items-center justify-center mb-1 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
                        <span className="text-xs font-bold text-white z-10">{Math.round(consumed.carbs)}g</span>
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1">/ {carbsG}g</span>
                </div>

                {/* Fat */}
                <div className="bg-deep-black border border-white/5 rounded-2xl p-3 flex flex-col items-center text-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Gordura</span>
                    <div className="w-14 h-14 rounded-full border-4 border-white/5 border-t-red-500 flex items-center justify-center mb-1 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-red-500/20" />
                        <span className="text-xs font-bold text-white z-10">{Math.round(consumed.fat)}g</span>
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1">/ {fatG}g</span>
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-acid-lime to-emerald-500 opacity-5 rounded-bl-[100px] -mr-8 -mt-8 pointer-events-none" />
        </div>
    );
}

'use client';

import { BowlFood, Check, Clock } from "@phosphor-icons/react";
import { useState } from "react";
// import { checkInMeal } from "@/app/actions/gamification"; // TODO

interface NextMealCardProps {
    meal: {
        id: string;
        name: string;
        time: string;
        calories?: number;
    } | null;
}

export default function NextMealCard({ meal }: NextMealCardProps) {
    const [checked, setChecked] = useState(false);

    if (!meal) {
        return (
            <div className="bg-white p-6 rounded-[24px] soft-shadow border border-slate-50 flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mb-3">
                    <BowlFood size={24} weight="duotone" />
                </div>
                <h3 className="font-bold text-slate-700">Tudo em dia!</h3>
                <p className="text-xs text-slate-400 mt-1">Nenhuma refeição pendente agora.</p>
            </div>
        )
    }

    const handleCheckIn = async () => {
        // Optimistic update
        setChecked(true);
        // await checkInMeal(meal.id); // Implement later
    };

    if (checked) {
        return (
            <div className="bg-emerald-50 p-6 rounded-[24px] border border-emerald-100 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                    <Check size={24} weight="bold" />
                </div>
                <h3 className="font-bold text-emerald-800">Refeição Registrada!</h3>
                <p className="text-xs text-emerald-600 mt-1">+50 XP ganhos 🔥</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-grey p-1 pb-1 rounded-4xl relative group overflow-hidden border border-white/10">
            <div className="bg-surface-grey rounded-[30px] p-6 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                            <BowlFood size={24} weight="duotone" className="text-zinc-400 group-hover:text-acid-lime transition-colors" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-acid-lime uppercase tracking-widest block mb-1">Próxima Refeição</span>
                            <h3 className="font-bold text-white leading-tight text-lg">{meal.name}</h3>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6 ml-1">
                    <div className="flex items-center gap-1.5 bg-deep-black/50 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 border border-white/5">
                        <Clock size={14} weight="bold" className="text-zinc-500" />
                        {meal.time}
                    </div>
                    {meal.calories && (
                        <div className="flex items-center gap-1.5 bg-deep-black/50 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 border border-white/5">
                            {meal.calories} kcal
                        </div>
                    )}
                </div>

                <button
                    onClick={handleCheckIn}
                    className="w-full py-4 border border-white/10 bg-white/5 text-zinc-400 rounded-2xl font-bold text-sm hover:border-acid-lime/50 hover:bg-acid-lime/10 hover:text-acid-lime transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <Check size={18} weight="bold" />
                    Marcar como Feito
                </button>
            </div>
        </div>
    );
}

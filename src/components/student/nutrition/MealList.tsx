'use client';

import { useState, useCallback } from 'react';
import { Check } from "@phosphor-icons/react";
import { logMeal, undoLogMeal } from "@/app/actions/nutrition";
import { useRouter } from 'next/navigation';

const MEAL_XP = 25;

interface Meal {
    id: string;
    name: string;
    time?: string | null;
    items: {
        id: string;
        foodName: string;
        portion: number | string;
        unit?: string | null;
        calories?: number | null;
        protein?: number | null;
        carbs?: number | null;
        fat?: number | null;
        mealId?: string;
        foodId?: string | null;
    }[];
}

interface MealListProps {
    meals: Meal[];
    loggedMealIds: string[];
}

export default function MealList({ meals, loggedMealIds }: MealListProps) {
    const router = useRouter();
    const [openMealId, setOpenMealId] = useState<string | null>(null);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [celebratingMealId, setCelebratingMealId] = useState<string | null>(null);

    const handleLog = useCallback(async (mealId: string) => {
        setLoadingMap(prev => ({ ...prev, [mealId]: true }));
        try {
            await logMeal(mealId);
            setCelebratingMealId(mealId);
            setTimeout(() => setCelebratingMealId(null), 2000);
            router.refresh();
        } finally {
            setLoadingMap(prev => ({ ...prev, [mealId]: false }));
        }
    }, [router]);

    const handleUndo = async (mealId: string) => {
        if (!confirm("Desfazer check-in desta refeição?")) return;
        setLoadingMap(prev => ({ ...prev, [mealId]: true }));
        try {
            await undoLogMeal(mealId);
        } finally {
            setLoadingMap(prev => ({ ...prev, [mealId]: false }));
            router.refresh();
        }
    };

    return (
        <>
            <style>{`
                @keyframes meal-xp-float {
                    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -120%) scale(1.2); }
                }
                .animate-meal-xp { animation: meal-xp-float 1.5s ease-out forwards; }
            `}</style>
        <div className="space-y-4">
            {meals.map((meal) => {
                const isLogged = loggedMealIds.includes(meal.id);
                const isLoading = loadingMap[meal.id];
                const isOpen = openMealId === meal.id;

                // Calculate total calories for meal
                const totalKcal = meal.items.reduce((sum, item) => sum + (item.calories || 0), 0);

                const isCelebrating = celebratingMealId === meal.id;

                return (
                    <div
                        key={meal.id}
                        className={`relative bg-surface-grey rounded-3xl transition-all duration-300 border overflow-hidden ${
                            isLogged ? 'border-acid-lime/30 bg-acid-lime/5' : 'border-white/5'
                        } ${isCelebrating ? 'animate-pulse border-acid-lime/50 shadow-[0_0_24px_rgba(46,204,113,0.2)]' : ''}`}
                    >
                        {isCelebrating && (
                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-acid-lime font-black text-lg animate-meal-xp pointer-events-none z-10">
                                +{MEAL_XP} XP
                            </span>
                        )}
                        <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setOpenMealId(isOpen ? null : meal.id)}>

                            {/* Time & Info */}
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm border border-white/5 transition-transform ${isLogged ? 'bg-acid-lime/20 text-acid-lime' : 'bg-white/5 text-zinc-500'} ${isCelebrating ? 'scale-110' : ''}`}>
                                    {meal.time || '--:--'}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-lg ${isLogged ? 'text-white' : 'text-zinc-300'}`}>{meal.name}</h3>
                                    <p className="text-xs text-zinc-500 font-medium">
                                        {totalKcal > 0 ? `${totalKcal} kcal` : `${meal.items.length} itens`}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {isLogged ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUndo(meal.id); }}
                                        disabled={isLoading}
                                        className="w-10 h-10 bg-acid-lime text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(189,255,0,0.4)] hover:bg-white hover:text-black transition-colors"
                                    >
                                        <Check weight="bold" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleLog(meal.id); }}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-white/5 border border-white/5 text-zinc-400 rounded-xl text-xs font-bold hover:bg-acid-lime hover:text-black hover:border-acid-lime transition-all active:scale-95"
                                    >
                                        {isLoading ? '...' : 'Check-in'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Collapsible Details */}
                        {isOpen && (
                            <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                                <div className="h-px bg-white/5 mb-3" />
                                <ul className="space-y-3">
                                    {meal.items.map((item) => (
                                        <li key={item.id} className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-300 font-medium">{item.foodName}</span>
                                            <span className="text-zinc-500 text-xs bg-black/20 border border-white/5 px-3 py-1.5 rounded-lg">{item.portion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
        </>
    );
}

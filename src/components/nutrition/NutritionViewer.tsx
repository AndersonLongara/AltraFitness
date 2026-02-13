"use client";

import { Clock, CheckCircle, Fire, ShareNetwork } from "@phosphor-icons/react";
import { useState } from "react";

interface MealItem {
    id: string;
    foodName: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface Meal {
    id: string;
    name: string;
    time: string; // "08:00"
    items: MealItem[];
}

interface NutritionPlan {
    id: string;
    title: string;
    dailyKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    meals: Meal[];
}

interface NutritionViewerProps {
    plan: NutritionPlan;
}

export default function NutritionViewer({ plan }: NutritionViewerProps) {
    const [checkedMeals, setCheckedMeals] = useState<Record<string, boolean>>({});

    const toggleMeal = (mealId: string) => {
        setCheckedMeals(prev => ({ ...prev, [mealId]: !prev[mealId] }));
    };

    // Calculate consumed
    const consumed = plan.meals.reduce((acc, meal) => {
        if (checkedMeals[meal.id]) {
            meal.items.forEach(item => {
                acc.kcal += item.calories;
                acc.protein += item.protein;
                acc.carbs += item.carbs;
                acc.fat += item.fat;
            });
        }
        return acc;
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });

    const progress = Math.min(100, (consumed.kcal / plan.dailyKcal) * 100);

    return (
        <div className="min-h-screen pb-24 font-primary">
            {/* Header / Summary */}
            <div className="bg-deep-black text-white p-6 rounded-b-[40px] border-b border-white/5 relative overflow-hidden shadow-2xl z-20">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-deep-black/50" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-acid-lime/10 blur-[100px] rounded-full" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="text-[10px] font-black text-acid-lime uppercase tracking-[0.2em] mb-2 block">Plano Nutricional</span>
                            <h2 className="text-3xl font-black tracking-tight">{plan.title}</h2>
                        </div>
                        <button className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white transition-all">
                            <ShareNetwork size={22} weight="bold" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Consumido</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-black text-white">{Math.round(consumed.kcal)}</span>
                                <span className="text-zinc-500 text-sm font-bold">kcal</span>
                            </div>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Meta Diária</span>
                            <div className="flex items-baseline justify-end gap-1.5">
                                <span className="text-2xl font-black text-zinc-400">{plan.dailyKcal}</span>
                                <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">kcal</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-8 border border-white/5 p-1">
                        <div
                            className="h-full bg-gradient-to-r from-acid-lime to-emerald-400 rounded-full transition-all duration-700 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>

                    {/* Macro Split */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Proteína', val: consumed.protein, target: plan.proteinG, color: 'text-blue-400' },
                            { label: 'Carbo', val: consumed.carbs, target: plan.carbsG, color: 'text-amber-400' },
                            { label: 'Gordura', val: consumed.fat, target: plan.fatG, color: 'text-red-400' }
                        ].map((macro, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
                                <span className="block text-sm font-black text-white">{Math.round(macro.val)} <span className="text-[10px] text-zinc-600">/ {macro.target}g</span></span>
                                <span className={`text-[8px] uppercase ${macro.color} font-black tracking-widest mt-1 block`}>{macro.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Meals List */}
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Programação de Hoje</h3>
                    <span className="text-[10px] font-bold text-zinc-600">{plan.meals.length} refeições</span>
                </div>

                {plan.meals.map((meal) => {
                    const isChecked = checkedMeals[meal.id];

                    return (
                        <div
                            key={meal.id}
                            onClick={() => toggleMeal(meal.id)}
                            className={`bg-surface-grey rounded-[32px] p-6 border transition-all duration-300 cursor-pointer group ${isChecked
                                ? "border-acid-lime/30 bg-acid-lime/5"
                                : "border-white/5 hover:border-white/10"
                                }`}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isChecked
                                        ? "bg-acid-lime text-black rotate-12 scale-110 shadow-[0_0_20px_rgba(189,255,0,0.3)]"
                                        : "bg-deep-black text-zinc-500 border border-white/5"
                                        }`}>
                                        <Clock size={24} weight={isChecked ? "fill" : "bold"} />
                                    </div>
                                    <div>
                                        <h3 className={`font-black text-lg tracking-tight transition-colors ${isChecked ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                                            {meal.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Fire size={12} className={isChecked ? "text-acid-lime" : "text-zinc-600"} />
                                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{meal.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${isChecked
                                    ? "bg-acid-lime border-acid-lime text-black shadow-lg"
                                    : "border-white/10 text-transparent"
                                    }`}>
                                    <CheckCircle size={20} weight="fill" />
                                </div>
                            </div>

                            <div className="space-y-3 relative">
                                {meal.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-deep-black/30 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isChecked ? "bg-acid-lime" : "bg-zinc-700"}`} />
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-bold transition-all ${isChecked ? "text-zinc-500 line-through decoration-acid-lime/50" : "text-zinc-300"}`}>
                                                    {item.foodName}
                                                </span>
                                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-wider">{item.portion}</span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-zinc-500">{item.calories} <span className="text-[8px] uppercase tracking-tighter">kcal</span></span>
                                    </div>
                                ))}

                                {isChecked && (
                                    <div className="absolute inset-0 bg-deep-black/10 backdrop-blur-[1px] pointer-events-none rounded-2xl" />
                                )}
                            </div>
                        </div>
                    );
                })}

                <div className="text-center py-10">
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">AltraHub Performance System</p>
                    <div className="w-1 h-1 bg-acid-lime rounded-full mx-auto mt-4 animate-pulse shadow-[0_0_10px_rgba(189,255,0,1)]" />
                </div>
            </div>
        </div>
    );
}
    );
}

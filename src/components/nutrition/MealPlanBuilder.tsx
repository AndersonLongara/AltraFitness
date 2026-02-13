"use client";

import { useState } from "react";
import { Plus, Trash, FloppyDisk, Cookie, Clock, Leaf } from "@phosphor-icons/react";
import { createNutritionalPlan } from "@/app/actions/nutrition";
import { useUser } from "@clerk/nextjs";

interface MealItem {
    id: string; // temp id
    foodName: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface Meal {
    id: string; // temp id
    name: string;
    time: string;
    items: MealItem[];
}

interface MealPlanBuilderProps {
    students: { id: string, name: string }[];
    initialTargets?: {
        kcal: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

export default function MealPlanBuilder({ students, initialTargets }: MealPlanBuilderProps) {
    const { user } = useUser();
    const [title, setTitle] = useState("");
    const [studentId, setStudentId] = useState("");
    const [planMeals, setPlanMeals] = useState<Meal[]>([]);
    const [isPending, setIsPending] = useState(false);

    // Temp state for new item being added
    const [activeMealId, setActiveMealId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<Omit<MealItem, "id">>({
        foodName: "", portion: "", calories: 0, protein: 0, carbs: 0, fat: 0
    });

    const addMeal = () => {
        const newMeal: Meal = {
            id: crypto.randomUUID(),
            name: "Nova Refeição",
            time: "08:00",
            items: []
        };
        setPlanMeals([...planMeals, newMeal]);
    };

    const removeMeal = (id: string) => {
        setPlanMeals(planMeals.filter(m => m.id !== id));
    };

    const updateMeal = (id: string, field: keyof Meal, value: any) => {
        setPlanMeals(planMeals.map(m => m.id === id ? { ...m, [field]: value } : m));
    };

    const addItemToMeal = (mealId: string) => {
        if (!newItem.foodName) return;

        const item: MealItem = { ...newItem, id: crypto.randomUUID() };

        setPlanMeals(planMeals.map(m => {
            if (m.id === mealId) {
                return { ...m, items: [...m.items, item] };
            }
            return m;
        }));

        setNewItem({ foodName: "", portion: "", calories: 0, protein: 0, carbs: 0, fat: 0 });
        setActiveMealId(null);
    };

    const removeItemFromMeal = (mealId: string, itemId: string) => {
        setPlanMeals(planMeals.map(m => {
            if (m.id === mealId) {
                return { ...m, items: m.items.filter(i => i.id !== itemId) };
            }
            return m;
        }));
    };

    // Calculate Totals
    const totalStats = planMeals.reduce((acc, meal) => {
        meal.items.forEach(item => {
            acc.calories += item.calories;
            acc.protein += item.protein;
            acc.carbs += item.carbs;
            acc.fat += item.fat;
        });
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const handleSave = async () => {
        if (!title || !studentId || planMeals.length === 0) {
            alert("Preencha título, aluno e adicione refeições.");
            return;
        }

        setIsPending(true);
        try {
            await createNutritionalPlan({
                title,
                studentId,
                trainerId: user?.id || "system",
                dailyKcal: totalStats.calories, // Using calculated totals as target for now, or could use input
                proteinG: totalStats.protein,
                carbsG: totalStats.carbs,
                fatG: totalStats.fat,
                meals: planMeals.map((m, i) => ({
                    name: m.name,
                    time: m.time,
                    order: i,
                    items: m.items
                }))
            });
            alert("Plano salvo com sucesso!");
            // Reset or redirect
            setTitle("");
            setStudentId("");
            setPlanMeals([]);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar cardápio.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-pure-white p-6 rounded-3xl soft-shadow space-y-4">
                <h3 className="text-xl font-bold text-graphite-dark flex items-center gap-2">
                    <Leaf size={24} weight="fill" className="text-emerald-500" />
                    Editor de Cardápio
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Título do Plano</label>
                        <input
                            type="text"
                            className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100"
                            placeholder="Ex: Dieta Cutting - Semana 1"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Aluno</label>
                        <select
                            className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100"
                            value={studentId}
                            onChange={e => setStudentId(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Totals Bar */}
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500">Totais do Plano:</span>
                    <div className="flex gap-4">
                        <span className="font-bold text-slate-700">{totalStats.calories} kcal</span>
                        <span className="font-bold text-emerald-600">P: {totalStats.protein}g</span>
                        <span className="font-bold text-amber-600">C: {totalStats.carbs}g</span>
                        <span className="font-bold text-blue-600">G: {totalStats.fat}g</span>
                    </div>
                </div>
            </div>

            {/* Meals List */}
            <div className="space-y-4">
                {planMeals.map((meal, index) => (
                    <div key={meal.id} className="bg-pure-white p-6 rounded-3xl soft-shadow border border-transparent hover:border-emerald-100 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1 grid grid-cols-2 gap-4 mr-4">
                                <input
                                    type="text"
                                    value={meal.name}
                                    onChange={e => updateMeal(meal.id, "name", e.target.value)}
                                    className="font-bold text-lg text-graphite-dark bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-400 outline-none"
                                />
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock size={16} />
                                    <input
                                        type="time"
                                        value={meal.time}
                                        onChange={e => updateMeal(meal.id, "time", e.target.value)}
                                        className="bg-transparent font-medium outline-none"
                                    />
                                </div>
                            </div>
                            <button onClick={() => removeMeal(meal.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Trash size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="space-y-2 mb-4">
                            {meal.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl text-sm">
                                    <div>
                                        <span className="font-bold text-slate-700">{item.foodName}</span>
                                        <span className="text-slate-400 ml-2">({item.portion})</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex gap-2 text-xs font-medium opacity-60">
                                            <span>{item.calories}kcal</span>
                                            <span>P:{item.protein}</span>
                                            <span>C:{item.carbs}</span>
                                            <span>G:{item.fat}</span>
                                        </div>
                                        <button onClick={() => removeItemFromMeal(meal.id, item.id)} className="text-slate-300 hover:text-rose-500">
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Item Form */}
                        {activeMealId === meal.id ? (
                            <div className="p-4 bg-emerald-50 rounded-xl space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    <input placeholder="Alimento" className="p-2 rounded-xl text-sm" value={newItem.foodName} onChange={e => setNewItem({ ...newItem, foodName: e.target.value })} autoFocus />
                                    <input placeholder="Porção (ex: 100g)" className="p-2 rounded-xl text-sm" value={newItem.portion} onChange={e => setNewItem({ ...newItem, portion: e.target.value })} />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <input placeholder="Kcal" type="number" className="p-2 rounded-xl text-sm w-20" value={newItem.calories || ''} onChange={e => setNewItem({ ...newItem, calories: Number(e.target.value) })} />
                                    <input placeholder="Prot" type="number" className="p-2 rounded-xl text-sm w-16" value={newItem.protein || ''} onChange={e => setNewItem({ ...newItem, protein: Number(e.target.value) })} />
                                    <input placeholder="Carb" type="number" className="p-2 rounded-xl text-sm w-16" value={newItem.carbs || ''} onChange={e => setNewItem({ ...newItem, carbs: Number(e.target.value) })} />
                                    <input placeholder="Gord" type="number" className="p-2 rounded-xl text-sm w-16" value={newItem.fat || ''} onChange={e => setNewItem({ ...newItem, fat: Number(e.target.value) })} />

                                    <div className="flex-1"></div>
                                    <button onClick={() => setActiveMealId(null)} className="text-slate-500 text-sm px-4">Cancelar</button>
                                    <button onClick={() => addItemToMeal(meal.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">Adicionar</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setActiveMealId(meal.id)}
                                className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-slate-400 text-sm font-bold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                            >
                                + Adicionar Alimento
                            </button>
                        )}
                    </div>
                ))}

                <button
                    onClick={addMeal}
                    className="w-full py-4 bg-slate-100 rounded-3xl text-slate-500 font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus size={20} weight="bold" />
                    Nova Refeição
                </button>
            </div>

            {/* Save Action */}
            <div className="fixed bottom-6 right-6 md:right-10 z-40">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    <FloppyDisk size={24} weight="bold" />
                    {isPending ? 'Salvando...' : 'Salvar Cardápio'}
                </button>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { Calculator, Person, TrendUp, Barbell, Check } from "@phosphor-icons/react";

export default function MacroCalculator() {
    const [weight, setWeight] = useState<number | "">("");
    const [height, setHeight] = useState<number | "">(""); // in cm
    const [age, setAge] = useState<number | "">("");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [activity, setActivity] = useState<number>(1.55); // Moderate default
    const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">("maintain");

    const [results, setResults] = useState<{
        tdee: number;
        targetKcal: number;
        protein: number;
        carbs: number;
        fat: number;
    } | null>(null);

    const calculateMacros = () => {
        if (!weight || !height || !age) return;

        // Mifflin-St Jeor Equation
        let bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age));
        bmr += gender === "male" ? 5 : -161;

        const tdee = Math.round(bmr * activity);

        // Goal Adjustment
        let targetKcal = tdee;
        if (goal === "cut") targetKcal -= 500;
        if (goal === "bulk") targetKcal += 300;

        // Macro Split (Standard Balanced)
        const protein = Math.round(Number(weight) * 2); // 2g/kg
        const fat = Math.round(Number(weight) * 0.8);   // 0.8g/kg

        const proteinKcal = protein * 4;
        const fatKcal = fat * 9;
        const remainingKcal = targetKcal - (proteinKcal + fatKcal);
        const carbs = Math.round(remainingKcal / 4);

        setResults({ tdee, targetKcal, protein, carbs, fat });
    };

    return (
        <div className="bg-pure-white p-6 rounded-3xl soft-shadow space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-performance-green">
                    <Calculator size={24} weight="fill" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-graphite-dark">Calculadora de Macros</h3>
                    <p className="text-xs text-slate-500">Estimativa baseada em Mifflin-St Jeor</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Peso (kg)</label>
                    <input
                        type="number"
                        value={weight}
                        onChange={e => setWeight(Number(e.target.value))}
                        className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Altura (cm)</label>
                    <input
                        type="number"
                        value={height}
                        onChange={e => setHeight(Number(e.target.value))}
                        className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Idade</label>
                    <input
                        type="number"
                        value={age}
                        onChange={e => setAge(Number(e.target.value))}
                        className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Gênero</label>
                    <select
                        value={gender}
                        onChange={e => setGender(e.target.value as "male" | "female")}
                        className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Nível de Atividade</label>
                    <select
                        value={activity}
                        onChange={e => setActivity(Number(e.target.value))}
                        className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                        <option value={1.2}>Sedentário (Pouco ou nenhum exercício)</option>
                        <option value={1.375}>Leve (Exercício 1-3 dias/semana)</option>
                        <option value={1.55}>Moderado (Exercício 3-5 dias/semana)</option>
                        <option value={1.725}>Intenso (Exercício 6-7 dias/semana)</option>
                        <option value={1.9}>Muito Intenso (Atleta profissional)</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase">Objetivo</label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        <button
                            onClick={() => setGoal("cut")}
                            className={`p-2 rounded-xl text-xs font-bold transition-all ${goal === "cut" ? "bg-rose-100 text-rose-600 ring-2 ring-rose-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                        >
                            Definição
                        </button>
                        <button
                            onClick={() => setGoal("maintain")}
                            className={`p-2 rounded-xl text-xs font-bold transition-all ${goal === "maintain" ? "bg-emerald-100 text-performance-green ring-2 ring-emerald-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                        >
                            Manutenção
                        </button>
                        <button
                            onClick={() => setGoal("bulk")}
                            className={`p-2 rounded-xl text-xs font-bold transition-all ${goal === "bulk" ? "bg-emerald-100 text-emerald-600 ring-2 ring-emerald-200" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                        >
                            Ganho
                        </button>
                    </div>
                </div>

                <button
                    onClick={calculateMacros}
                    className="w-full py-4 bg-graphite-dark text-white font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                    <Calculator size={20} weight="bold" />
                    Calcular Metas
                </button>
            </div>

            {results && (
                <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-slate-500">Meta Diária</span>
                        <span className="text-2xl font-extrabold text-performance-green">{results.targetKcal} kcal</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-rose-50 p-4 rounded-xl text-center">
                            <span className="block text-xl font-bold text-rose-600">{results.protein}g</span>
                            <span className="text-[10px] font-bold text-rose-400 uppercase">Proteína</span>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl text-center">
                            <span className="block text-xl font-bold text-amber-600">{results.carbs}g</span>
                            <span className="text-[10px] font-bold text-amber-400 uppercase">Carboidrato</span>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                            <span className="block text-xl font-bold text-blue-600">{results.fat}g</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">Gordura</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { Cookie, Plus } from "@phosphor-icons/react";

export default function NutritionHeader() {
    return (
        <header className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight flex items-center gap-4">
                    <Cookie size={32} weight="fill" className="text-orange-500" />
                    Nutrição & Dietas
                </h1>
                <p className="text-slate-500 font-medium mt-2">
                    Gerencie planos alimentares e metas de macronutrientes.
                </p>
            </div>
            <button className="px-6 py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
                <Plus size={20} weight="bold" />
                Nova Dieta
            </button>
        </header>
    );
}

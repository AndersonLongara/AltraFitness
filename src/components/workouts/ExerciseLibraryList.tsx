"use client";

import { useState } from "react";
import { MagnifyingGlass, Barbell, Anchor, PersonSimpleRun, Trophy, Baseball, Target, SquaresFour } from "@phosphor-icons/react";
import ExerciseCard from "@/components/workouts/ExerciseCard";

interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
    videoUrl: string | null;
}

interface ExerciseLibraryListProps {
    initialExercises: Exercise[];
}

const CATEGORIES = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'];

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode, accent: string, bg: string, border: string }> = {
    'Todos': { icon: <SquaresFour size={18} weight="bold" />, accent: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
    'Peito': { icon: <Barbell size={18} weight="bold" />, accent: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
    'Costas': { icon: <Anchor size={18} weight="bold" />, accent: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
    'Pernas': { icon: <PersonSimpleRun size={18} weight="bold" />, accent: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    'Ombros': { icon: <Trophy size={18} weight="bold" />, accent: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    'Braços': { icon: <Baseball size={18} weight="bold" />, accent: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
    'Core': { icon: <Target size={18} weight="bold" />, accent: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
};

export default function ExerciseLibraryList({ initialExercises }: ExerciseLibraryListProps) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todos");

    const filtered = initialExercises.filter((ex) => {
        const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "Todos" || ex.muscleGroup === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8">
            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-pure-white px-4 py-4 rounded-2xl soft-shadow border border-slate-100 flex items-center">
                    <MagnifyingGlass size={20} className="text-slate-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-300"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {CATEGORIES.map((tag) => {
                        const config = CATEGORY_CONFIG[tag] || CATEGORY_CONFIG['Todos'];
                        const isActive = category === tag;
                        return (
                            <button
                                key={tag}
                                onClick={() => setCategory(tag)}
                                className={`px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${isActive
                                    ? `${config.bg} ${config.accent} ${config.border}`
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'
                                    }`}
                            >
                                {config.icon}
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                {filtered.map((ex) => {
                    const config = CATEGORY_CONFIG[ex.muscleGroup] || CATEGORY_CONFIG['Todos'];
                    return (
                        <ExerciseCard
                            key={ex.id}
                            name={ex.name}
                            muscleGroup={ex.muscleGroup}
                            videoUrl={ex.videoUrl}
                            icon={config.icon}
                            accentColor={config.accent}
                            bgColor={config.bg}
                        />
                    );
                })}

                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400">
                        <p>Nenhum exercício encontrado com estes filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

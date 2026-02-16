"use client";

import { X, MagnifyingGlass, CheckCircle, PlusCircle, Check, Barbell, Lightning, Heart, Target, Stairs, Tree, Wind, Cube } from "@phosphor-icons/react";
import { useState, useMemo } from "react";

interface Exercise {
    id: string;
    name: string;
    muscleGroup: string;
}

interface ExerciseSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectExercises: (exercises: Exercise[]) => void;
    exercises: Exercise[];
}

const CATEGORY_MAP: Record<string, { icon: any, color: string, bgColor: string }> = {
    "PEITO": { icon: Barbell, color: "text-blue-600", bgColor: "bg-blue-50" },
    "COSTAS": { icon: Barbell, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    "PERNAS": { icon: Target, color: "text-amber-600", bgColor: "bg-amber-50" },
    "OMBROS": { icon: Barbell, color: "text-purple-600", bgColor: "bg-purple-50" },
    "BICEPS": { icon: Barbell, color: "text-rose-600", bgColor: "bg-rose-50" },
    "TRICEPS": { icon: Barbell, color: "text-rose-600", bgColor: "bg-rose-50" },
    "ABDOMEN": { icon: Stairs, color: "text-orange-600", bgColor: "bg-orange-50" },
    "CARDIO": { icon: Lightning, color: "text-amber-500", bgColor: "bg-amber-50" },
    "GLUTEOS": { icon: Heart, color: "text-pink-600", bgColor: "bg-pink-50" },
    "OUTROS": { icon: Cube, color: "text-slate-600", bgColor: "bg-slate-50" },
};

export default function ExerciseSelector({ isOpen, onClose, onSelectExercises, exercises }: ExerciseSelectorProps) {
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Get unique categories from data
    const categories = useMemo(() => {
        const cats = Array.from(new Set(exercises.map(ex => ex.muscleGroup.toUpperCase())));
        return cats.sort();
    }, [exercises]);

    if (!isOpen) return null;

    const filtered = exercises.filter(ex => {
        const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
            ex.muscleGroup.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || ex.muscleGroup.toUpperCase() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleExercise = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selected = exercises.filter(ex => selectedIds.includes(ex.id));
        if (selected.length > 0) {
            onSelectExercises(selected);
            setSelectedIds([]); // Reset for next time
            onClose();
        }
    };

    const getCategoryInfo = (cat: string) => {
        return CATEGORY_MAP[cat.toUpperCase()] || CATEGORY_MAP["OUTROS"];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-dark/60 backdrop-blur-sm p-4">
            <div className="bg-pure-white w-full max-w-lg rounded-3xl soft-shadow overflow-hidden flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="text-xl font-bold text-graphite-dark">Selecionar Exercícios</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                            {selectedIds.length} selecionados
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <X size={24} weight="bold" />
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="bg-slate-50 border-b border-slate-100">
                    <div className="p-4 pb-2">
                        <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center shadow-sm">
                            <MagnifyingGlass size={20} className="text-slate-400 mr-2" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Buscar exercício..."
                                className="bg-transparent outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-300"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Filter Bar */}
                    <div className="flex gap-2 overflow-x-auto p-4 pt-0 no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${!selectedCategory ? 'bg-graphite-dark text-white border-graphite-dark' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                        >
                            Todos
                        </button>
                        {categories.map(cat => {
                            const info = getCategoryInfo(cat);
                            const isActive = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${isActive ? `${info.bgColor} ${info.color} border-current` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                                >
                                    <info.icon size={14} weight={isActive ? "bold" : "regular"} />
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/50">
                    {filtered.map((ex) => {
                        const isSelected = selectedIds.includes(ex.id);
                        const info = getCategoryInfo(ex.muscleGroup);
                        return (
                            <button
                                key={ex.id}
                                onClick={() => toggleExercise(ex.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl group transition-all text-left border-2 ${isSelected ? 'bg-emerald-50 border-performance-green ring-4 ring-emerald-50' : 'bg-white border-white hover:border-slate-100 shadow-sm'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-performance-green border-performance-green shadow-lg shadow-emerald-200' : 'bg-white border-slate-200'}`}>
                                        {isSelected && <Check size={14} weight="bold" className="text-graphite-dark" />}
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${info.bgColor} ${info.color}`}>
                                        <info.icon size={20} weight="duotone" />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold transition-colors ${isSelected ? 'text-performance-green' : 'text-slate-700'}`}>
                                            {ex.name}
                                        </h4>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{ex.muscleGroup}</span>
                                    </div>
                                </div>
                                {!isSelected && (
                                    <div className="text-slate-100 group-hover:text-slate-300 transition-colors">
                                        <PlusCircle size={28} weight="fill" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="p-12 text-center text-slate-300 animate-in fade-in zoom-in duration-300">
                            <MagnifyingGlass size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
                            <p className="font-bold">Nenhum exercício encontrado</p>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className="w-full py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl shadow-lg hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                    >
                        {selectedIds.length > 0 ? (
                            <>
                                <CheckCircle size={24} weight="bold" />
                                Adicionar {selectedIds.length} exercício{selectedIds.length > 1 ? 's' : ''}
                            </>
                        ) : (
                            "Selecione para adicionar"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}

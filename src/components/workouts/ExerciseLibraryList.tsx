"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, Barbell, Anchor, PersonSimpleRun, Trophy, Baseball, Target, SquaresFour, CaretLeft, CaretRight, HandFist, Horse, Plus, ArrowsOutSimple } from "@phosphor-icons/react";
import ExerciseCard from "@/components/workouts/ExerciseCard";
import ExerciseModal from "@/components/workouts/ExerciseModal";
import { normalizeMuscleGroup } from "@/lib/exercise-categories";

interface Exercise {
    id: string;
    trainerId: string | null;
    name: string;
    muscleGroup: string;
    videoUrl: string | null;
    imageUrl?: string | null;
    description: string | null;
}

interface ExerciseLibraryListProps {
    initialExercises: Exercise[];
    categories: string[];       // From DB: ['Todos', 'Peito', 'Costas', ...]
    muscleGroups: string[];     // From DB: ['Peito', 'Costas', ...]
}

const PAGE_SIZE = 10;

const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode, accent: string, bg: string, border: string }> = {
    'Todos': { icon: <SquaresFour size={18} weight="bold" />, accent: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
    'Peito': { icon: <Barbell size={18} weight="bold" />, accent: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' },
    'Costas': { icon: <Anchor size={18} weight="bold" />, accent: 'text-sky-600', bg: 'bg-sky-100', border: 'border-sky-200' },
    'Pernas': { icon: <PersonSimpleRun size={18} weight="bold" />, accent: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' },
    'Ombros': { icon: <Trophy size={18} weight="bold" />, accent: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
    'Bíceps': { icon: <HandFist size={18} weight="bold" />, accent: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' },
    'Tríceps': { icon: <Baseball size={18} weight="bold" />, accent: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
    'Core': { icon: <Target size={18} weight="bold" />, accent: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    'Glúteos': { icon: <Horse size={18} weight="bold" />, accent: 'text-pink-600', bg: 'bg-pink-100', border: 'border-pink-200' },
    'Mobilidade': { icon: <ArrowsOutSimple size={18} weight="bold" />, accent: 'text-teal-600', bg: 'bg-teal-100', border: 'border-teal-200' },
    'Cardio': { icon: <PersonSimpleRun size={18} weight="bold" />, accent: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    'Outros': { icon: <SquaresFour size={18} weight="bold" />, accent: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
};

export default function ExerciseLibraryList({ initialExercises, categories, muscleGroups }: ExerciseLibraryListProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Todos");
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

    const filtered = useMemo(() => {
        return initialExercises.filter((ex) => {
            const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
            let matchesCategory = category === "Todos";
            if (!matchesCategory) {
                matchesCategory = normalizeMuscleGroup(ex.muscleGroup) === normalizeMuscleGroup(category);
            }
            return matchesSearch && matchesCategory;
        });
    }, [initialExercises, search, category]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedExercises = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset page when filters change
    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleCategory = (cat: string) => {
        setCategory(cat);
        setPage(1);
    };

    const handleOpenCreate = useCallback(() => {
        setEditingExercise(null);
        setModalOpen(true);
    }, []);

    const handleOpenEdit = useCallback((exercise: Exercise) => {
        setEditingExercise(exercise);
        setModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        setEditingExercise(null);
    }, []);

    const handleSaved = useCallback(() => {
        router.refresh();
    }, [router]);

    return (
        <div className="space-y-6">
            {/* Search + New button */}
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-pure-white dark:bg-[#1E2A36] px-4 py-3.5 rounded-2xl soft-shadow border border-slate-100 dark:border-white/10 flex items-center">
                    <MagnifyingGlass size={20} className="text-slate-400 dark:text-slate-500 mr-3 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar exercício por nome..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="bg-transparent outline-none text-sm font-medium text-slate-600 dark:text-slate-200 w-full placeholder:text-slate-300 dark:placeholder:text-slate-500"
                    />
                    {search && (
                        <button onClick={() => handleSearch('')} className="ml-2 text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-300 flex-shrink-0">
                            <span className="text-xs font-bold">✕</span>
                        </button>
                    )}
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="px-5 py-3.5 bg-emerald-500 dark:bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none whitespace-nowrap flex-shrink-0"
                >
                    <Plus size={18} weight="bold" />
                    <span className="hidden sm:inline">Novo Exercício</span>
                </button>
            </div>

            {/* Category chips - wrapping grid */}
            <div className="flex flex-wrap gap-2">
                {categories.map((tag) => {
                    const config = CATEGORY_CONFIG[tag] || CATEGORY_CONFIG['Todos'];
                    const isActive = category === tag;
                    return (
                        <button
                            key={tag}
                            onClick={() => handleCategory(tag)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${isActive
                                ? `${config.bg} ${config.accent} ${config.border} dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30`
                                : 'bg-white dark:bg-[#1E2A36] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 border-slate-100 dark:border-white/10'
                                }`}
                        >
                            {config.icon}
                            {tag}
                        </button>
                    );
                })}
            </div>

            {/* Results count */}
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                {filtered.length} exercício{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                {totalPages > 1 && ` · Página ${currentPage} de ${totalPages}`}
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                {paginatedExercises.map((ex) => {
                    const config = CATEGORY_CONFIG[ex.muscleGroup] || CATEGORY_CONFIG['Todos'];
                    return (
                        <ExerciseCard
                            key={ex.id}
                            name={ex.name}
                            muscleGroup={ex.muscleGroup}
                            videoUrl={ex.videoUrl}
                            imageUrl={ex.imageUrl}
                            icon={config.icon}
                            accentColor={config.accent}
                            bgColor={config.bg}
                            onEdit={() => handleOpenEdit(ex)}
                        />
                    );
                })}

                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500">
                        <p>Nenhum exercício encontrado com estes filtros.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E2A36] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <CaretLeft size={20} weight="bold" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                        .reduce<(number | string)[]>((acc, p, i, arr) => {
                            if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((p, i) =>
                            typeof p === 'string' ? (
                                <span key={`dots-${i}`} className="px-2 text-slate-400 dark:text-slate-500 text-sm">...</span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${p === currentPage
                                        ? 'bg-graphite-dark dark:bg-amber-500/20 text-white dark:text-amber-400 border border-graphite-dark dark:border-amber-500/30'
                                        : 'bg-white dark:bg-[#1E2A36] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {p}
                                </button>
                            )
                        )}

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E2A36] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <CaretRight size={20} weight="bold" />
                    </button>
                </div>
            )}

            {/* Exercise Create/Edit Modal */}
            <ExerciseModal
                key={editingExercise?.id || 'new'}
                exercise={editingExercise}
                isOpen={modalOpen}
                onClose={handleCloseModal}
                onSaved={handleSaved}
                muscleGroups={muscleGroups}
            />
        </div>
    );
}

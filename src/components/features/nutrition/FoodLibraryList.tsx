
"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { MagnifyingGlass, Plus, Trash, PencilSimple, CheckCircle, Warning, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { searchFoods } from "@/app/actions/dietUtils";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface Food {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    baseUnit: string | null;
    baseAmount: number | null;
    source: string | null;
    category?: string | null;
}

const PAGE_SIZE = 50;

export default function FoodLibraryList({ initialFoods }: { initialFoods: Food[] }) {
    const [activeTab, setActiveTab] = useState<'my_foods' | 'system'>('my_foods');
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);
    const [systemFoods, setSystemFoods] = useState<Food[]>([]);
    const [isPending, startTransition] = useTransition();
    const [page, setPage] = useState(1);

    // Client-side filter for My Foods
    const filteredMyFoods = useMemo(() =>
        initialFoods.filter(f =>
            f.name.toLowerCase().includes(search.toLowerCase())
        ),
        [initialFoods, search]
    );

    // Server-side search for System Foods
    useEffect(() => {
        if (activeTab === 'system' && debouncedSearch.length >= 2) {
            startTransition(async () => {
                const results = await searchFoods(debouncedSearch);
                setSystemFoods(results as Food[]);
                setPage(1);
            });
        }
    }, [activeTab, debouncedSearch]);

    // Reset page when search or tab changes
    useEffect(() => { setPage(1); }, [search, activeTab]);

    const currentList = activeTab === 'my_foods' ? filteredMyFoods : systemFoods;
    const totalPages = Math.max(1, Math.ceil(currentList.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedFoods = currentList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab('my_foods')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'my_foods' ? 'border-graphite-dark dark:border-amber-400 text-graphite-dark dark:text-amber-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    Meus Alimentos ({filteredMyFoods.length})
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'system' ? 'border-graphite-dark dark:border-amber-400 text-graphite-dark dark:text-amber-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    Tabela Oficial (TACO/TBCA)
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-pure-white dark:bg-[#1E2A36] px-4 py-3 rounded-2xl soft-shadow border border-slate-100 dark:border-white/10 flex items-center">
                <MagnifyingGlass size={20} className="text-slate-400 dark:text-slate-500 mr-2" />
                <input
                    type="text"
                    placeholder={activeTab === 'system' ? "Buscar na tabela oficial..." : "Buscar nos meus alimentos..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-sm font-medium text-slate-600 dark:text-slate-200 w-full placeholder:text-slate-300 dark:placeholder:text-slate-500"
                />
            </div>

            {/* Results count */}
            {currentList.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                        {currentList.length} alimento{currentList.length !== 1 ? 's' : ''} encontrado{currentList.length !== 1 ? 's' : ''}
                        {totalPages > 1 && ` · Página ${currentPage} de ${totalPages}`}
                    </p>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedFoods.map((food) => (
                    <div key={food.id} className="bg-white dark:bg-[#1E2A36] p-5 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-md dark:hover:shadow-none transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-700 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                {food.name}
                            </h4>
                            {activeTab === 'my_foods' && (
                                <div className="flex bg-slate-50 dark:bg-white/5 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10">
                                        <PencilSimple size={16} weight="bold" />
                                    </button>
                                    <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10">
                                        <Trash size={16} weight="bold" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium mb-3">
                            <span className="bg-slate-50 dark:bg-white/5 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
                                {food.baseAmount}{food.baseUnit}
                            </span>
                            <span>•</span>
                            <span>{food.calories} kcal</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-black text-slate-400 dark:text-slate-500">
                            <div>
                                <span className="block text-emerald-500 dark:text-emerald-400">Prot</span>
                                {food.protein}g
                            </div>
                            <div>
                                <span className="block text-blue-500 dark:text-blue-400">Carb</span>
                                {food.carbs}g
                            </div>
                            <div>
                                <span className="block text-orange-500 dark:text-orange-400">Gord</span>
                                {food.fat}g
                            </div>
                        </div>
                    </div>
                ))}

                {activeTab === 'system' && isPending && (
                    <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 animate-pulse">
                        Buscando...
                    </div>
                )}

                {activeTab === 'system' && !isPending && systemFoods.length === 0 && search.length >= 2 && (
                    <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                        Nenhum alimento encontrado.
                    </div>
                )}

                {activeTab === 'my_foods' && filteredMyFoods.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                        {search ? "Nenhum alimento encontrado." : "Você ainda não criou alimentos personalizados."}
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
        </div>
    );

}

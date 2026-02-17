
"use client";

import { useState, useTransition, useEffect } from "react";
import { MagnifyingGlass, Plus, Trash, PencilSimple, CheckCircle, Warning, CaretLeft, CaretRight, Heart } from "@phosphor-icons/react";
import { searchFoods } from "@/app/actions/dietUtils";
import { toggleFavoriteFood } from "@/app/actions/favorites";
import { useDebounce } from "@/hooks/useDebounce";

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

interface FoodLibraryListProps {
    initialFoods: Food[];
    favoriteFoodIds: string[];
    favoriteFoods: Food[];
}

const ITEMS_PER_PAGE = 10;

export default function FoodLibraryList({ initialFoods, favoriteFoodIds, favoriteFoods }: FoodLibraryListProps) {
    const [activeTab, setActiveTab] = useState<'my_foods' | 'favorites' | 'system'>('my_foods');
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(favoriteFoodIds));
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);
    const [systemFoods, setSystemFoods] = useState<Food[]>([]);
    const [isPending, startTransition] = useTransition();
    const [currentPage, setCurrentPage] = useState(1);

    // Reset to page 1 when changing tabs or search
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, search]);

    // Client-side filter for My Foods
    const filteredMyFoods = initialFoods.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    // Client-side filter for Favorites
    const filteredFavorites = favoriteFoods.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
    );

    // Server-side search for System Foods
    useEffect(() => {
        if (activeTab === 'system' && debouncedSearch.length >= 2) {
            startTransition(async () => {
                const results = await searchFoods(debouncedSearch);
                setSystemFoods(results as Food[]);
            });
        }
    }, [activeTab, debouncedSearch]);

    const handleToggleFavorite = async (foodId: string) => {
        setTogglingId(foodId);
        try {
            const result = await toggleFavoriteFood(foodId);
            setFavoriteIds(prev => {
                const next = new Set(prev);
                if (result.favorited) {
                    next.add(foodId);
                } else {
                    next.delete(foodId);
                }
                return next;
            });
        } catch (e) {
            console.error('Erro ao favoritar alimento:', e);
        } finally {
            setTogglingId(null);
        }
    };

    // Pagination logic
    const currentFoods = activeTab === 'my_foods' ? filteredMyFoods : activeTab === 'favorites' ? filteredFavorites : systemFoods;
    const totalPages = Math.ceil(currentFoods.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedFoods = currentFoods.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab('my_foods')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'my_foods' ? 'border-graphite-dark dark:border-emerald-500 text-graphite-dark dark:text-white' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'}`}
                >
                    Meus Alimentos ({filteredMyFoods.length})
                </button>
                <button
                    onClick={() => setActiveTab('favorites')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'favorites' ? 'border-rose-500 dark:border-rose-400 text-rose-600 dark:text-rose-400' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'}`}
                >
                    <Heart size={16} weight={activeTab === 'favorites' ? 'fill' : 'bold'} />
                    Favoritos ({favoriteIds.size})
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'system' ? 'border-graphite-dark dark:border-emerald-500 text-graphite-dark dark:text-white' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white'}`}
                >
                    Tabela Oficial (TACO/TBCA)
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-[#1E2A36] px-4 py-3 rounded-2xl soft-shadow dark:shadow-none border border-slate-100 dark:border-white/10 flex items-center">
                <MagnifyingGlass size={20} className="text-slate-400 dark:text-slate-500 mr-2" />
                <input
                    type="text"
                    placeholder={activeTab === 'system' ? "Buscar na tabela oficial..." : "Buscar nos meus alimentos..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-sm font-medium text-slate-600 dark:text-white w-full placeholder:text-slate-300 dark:placeholder:text-slate-500"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedFoods.map((food) => (
                    <div key={food.id} className="bg-white dark:bg-[#1E2A36] p-5 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:shadow-md dark:hover:shadow-none transition-all group relative">
                        {/* Favorite button */}
                        <button
                            onClick={() => handleToggleFavorite(food.id)}
                            disabled={togglingId === food.id}
                            className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all ${
                                favoriteIds.has(food.id)
                                    ? 'text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-rose-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 opacity-0 group-hover:opacity-100'
                            } ${togglingId === food.id ? 'animate-pulse' : ''}`}
                            title={favoriteIds.has(food.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                            <Heart size={18} weight={favoriteIds.has(food.id) ? 'fill' : 'bold'} />
                        </button>

                        <div className="flex justify-between items-start mb-2 pr-8">
                            <h4 className="font-bold text-slate-700 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                                {food.name}
                            </h4>
                            {activeTab === 'my_foods' && (
                                <div className="flex bg-slate-50 dark:bg-white/5 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/20">
                                        <PencilSimple size={16} weight="bold" />
                                    </button>
                                    <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/20">
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

                {activeTab === 'favorites' && filteredFavorites.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500">
                        <Heart size={32} weight="bold" className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        {search ? "Nenhum favorito encontrado." : "Nenhum alimento favoritado ainda. Clique no ❤️ para salvar."}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {currentFoods.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Mostrando {startIndex + 1}-{Math.min(endIndex, currentFoods.length)} de {currentFoods.length} alimentos
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <CaretLeft size={20} weight="bold" />
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                // Show first page, last page, current page, and pages around current
                                if (
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`min-w-[40px] h-10 px-3 rounded-lg font-bold text-sm transition-colors ${
                                                page === currentPage
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                } else if (
                                    page === currentPage - 2 ||
                                    page === currentPage + 2
                                ) {
                                    return <span key={page} className="text-slate-400 dark:text-slate-500">...</span>;
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg bg-white dark:bg-[#1E2A36] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <CaretRight size={20} weight="bold" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

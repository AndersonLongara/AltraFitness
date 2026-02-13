
"use client";

import { useState, useTransition, useEffect } from "react";
import { MagnifyingGlass, Plus, Trash, PencilSimple, CheckCircle, Warning } from "@phosphor-icons/react";
import { searchFoods } from "@/app/actions/dietUtils";
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

export default function FoodLibraryList({ initialFoods }: { initialFoods: Food[] }) {
    const [activeTab, setActiveTab] = useState<'my_foods' | 'system'>('my_foods');
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 500);
    const [systemFoods, setSystemFoods] = useState<Food[]>([]);
    const [isPending, startTransition] = useTransition();

    // Client-side filter for My Foods
    const filteredMyFoods = initialFoods.filter(f =>
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

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('my_foods')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'my_foods' ? 'border-graphite-dark text-graphite-dark' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Meus Alimentos ({filteredMyFoods.length})
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'system' ? 'border-graphite-dark text-graphite-dark' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Tabela Oficial (TACO/TBCA)
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-pure-white px-4 py-3 rounded-2xl soft-shadow border border-slate-100 flex items-center">
                <MagnifyingGlass size={20} className="text-slate-400 mr-2" />
                <input
                    type="text"
                    placeholder={activeTab === 'system' ? "Buscar na tabela oficial..." : "Buscar nos meus alimentos..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-transparent outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-300"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(activeTab === 'my_foods' ? filteredMyFoods : systemFoods).map((food) => (
                    <div key={food.id} className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors line-clamp-2">
                                {food.name}
                            </h4>
                            {activeTab === 'my_foods' && (
                                <div className="flex bg-slate-50 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-1.5 text-slate-400 hover:text-blue-500 rounded-md hover:bg-blue-50">
                                        <PencilSimple size={16} weight="bold" />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50">
                                        <Trash size={16} weight="bold" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
                            <span className="bg-slate-50 px-2 py-1 rounded text-slate-500">
                                {food.baseAmount}{food.baseUnit}
                            </span>
                            <span>•</span>
                            <span>{food.calories} kcal</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-black text-slate-400">
                            <div>
                                <span className="block text-emerald-500">Prot</span>
                                {food.protein}g
                            </div>
                            <div>
                                <span className="block text-blue-500">Carb</span>
                                {food.carbs}g
                            </div>
                            <div>
                                <span className="block text-orange-500">Gord</span>
                                {food.fat}g
                            </div>
                        </div>
                    </div>
                ))}

                {activeTab === 'system' && isPending && (
                    <div className="col-span-full py-12 text-center text-slate-400 animate-pulse">
                        Buscando...
                    </div>
                )}

                {activeTab === 'system' && !isPending && systemFoods.length === 0 && search.length >= 2 && (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        Nenhum alimento encontrado.
                    </div>
                )}

                {activeTab === 'my_foods' && filteredMyFoods.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400">
                        {search ? "Nenhum alimento encontrado." : "Você ainda não criou alimentos personalizados."}
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, useTransition } from 'react';
import { MagnifyingGlass, Check, SealCheck } from '@phosphor-icons/react';
import { searchFoods } from '@/app/actions/dietUtils';
import { useDebounce } from '@/hooks/useDebounce';

interface FoodSearchPanelProps {
    onAddFood: (food: any) => void;
}

export default function FoodSearchPanel({ onAddFood }: FoodSearchPanelProps) {
    const [query, setQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'protein' | 'carbs' | 'fat' | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [debouncedQuery] = useDebounce(query, 300);

    useEffect(() => {
        // If query is too short AND no filter is selected, don't search
        if (debouncedQuery.length < 2 && !selectedFilter) {
            setResults([]);
            return;
        }

        startTransition(async () => {
            const data = await searchFoods(debouncedQuery, selectedFilter);
            setResults(data);
        });
    }, [debouncedQuery, selectedFilter]);

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="bg-white border-b border-map-gray-200">
                <div className="p-4 px-6 pb-2">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                            <MagnifyingGlass size={18} weight="bold" />
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 transition-all placeholder-slate-300"
                            placeholder="Buscar alimentos..."
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex px-6 pb-4 gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setSelectedFilter(null)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${!selectedFilter ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setSelectedFilter('protein')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${selectedFilter === 'protein' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                        Proteína
                    </button>
                    <button
                        onClick={() => setSelectedFilter('carbs')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${selectedFilter === 'carbs' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                        Carbo
                    </button>
                    <button
                        onClick={() => setSelectedFilter('fat')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1 ${selectedFilter === 'fat' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                        Gordura
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {isPending ? (
                    <div className="space-y-3 p-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />)}
                    </div>
                ) : (
                    results.map(food => (
                        <div
                            key={food.id}
                            onClick={() => onAddFood(food)}
                            className="bg-white p-3 rounded-2xl border border-slate-50 hover:border-emerald-200 hover:shadow-md cursor-pointer transition-all group"
                        >
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-slate-700 text-sm line-clamp-1 group-hover:text-emerald-600 transition-colors">
                                    {food.name}
                                </div>
                                {(food.source === 'TACO' || food.source === 'TBCA') && (
                                    <div className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <SealCheck weight="fill" /> {food.source}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                <span>{food.baseAmount}{food.baseUnit}</span>
                                <span>•</span>
                                <span>{food.calories} kcal</span>
                            </div>

                            <div className="grid grid-cols-3 gap-1 mt-2 text-[10px] font-bold text-slate-300">
                                <div className="bg-slate-50 rounded px-1 py-0.5 text-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">P: {food.protein}</div>
                                <div className="bg-slate-50 rounded px-1 py-0.5 text-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">C: {food.carbs}</div>
                                <div className="bg-slate-50 rounded px-1 py-0.5 text-center group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">G: {food.fat}</div>
                            </div>
                        </div>
                    ))
                )}
                {!isPending && results.length === 0 && query.length > 2 && (
                    <div className="text-center py-8 text-slate-400 text-sm">Nenhum alimento encontrado.</div>
                )}
            </div>
        </div>
    );
}

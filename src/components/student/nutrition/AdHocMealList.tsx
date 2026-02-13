'use client';

import { Trash, Cookie } from "@phosphor-icons/react";
import { deleteAdHocLog } from "@/app/actions/nutrition";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdHocMealListProps {
    logs: {
        id: string;
        name: string | null;
        calories: number | null;
        isCheatMeal: boolean | null;
    }[];
}

export default function AdHocMealList({ logs }: AdHocMealListProps) {
    const router = useRouter();
    const [loadingIds, setLoadingIds] = useState<string[]>([]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Remover "${name}"?`)) return;

        setLoadingIds(prev => [...prev, id]);
        try {
            await deleteAdHocLog(id);
        } finally {
            setLoadingIds(prev => prev.filter(lid => lid !== id));
            router.refresh(); // Refresh to update header stats
        }
    };

    if (logs.length === 0) return null;

    return (
        <div className="mt-8 mb-24">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider mb-4 px-1">
                Extras & Livres
            </h3>
            <div className="space-y-3">
                {logs.map(log => (
                    <div key={log.id} className={`bg-surface-grey p-4 rounded-2xl flex justify-between items-center border ${log.isCheatMeal ? 'border-red-500/30 bg-red-500/10' : 'border-white/5'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.isCheatMeal ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-zinc-400'}`}>
                                <Cookie weight="duotone" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{log.name || 'Refeição Extra'}</h4>
                                <span className="text-xs font-medium text-zinc-500">{log.calories} kcal</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDelete(log.id, log.name || 'Item')}
                            disabled={loadingIds.includes(log.id)}
                            className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <Trash weight="bold" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

'use client';

import { useState } from "react";
import { Drop, Plus } from "@phosphor-icons/react";
import { logHydration } from "@/app/actions/gamification"; // We will create this action next

interface HydrationTrackerProps {
    initialAmount: number;
    dailyGoal?: number; // Default 2500ml
}

export default function HydrationTracker({ initialAmount, dailyGoal = 2500 }: HydrationTrackerProps) {
    const [amount, setAmount] = useState(initialAmount);
    const [loading, setLoading] = useState(false);

    const handleAddWater = async (addAmount: number) => {
        setLoading(true);
        // Optimistic UI update
        const newAmount = amount + addAmount;
        setAmount(newAmount);

        try {
            await logHydration(addAmount);
        } catch (error) {
            console.error("Failed to log hydration", error);
            setAmount(amount); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    const progress = Math.min((amount / dailyGoal) * 100, 100);

    return (
        <div className="bg-surface-grey p-6 rounded-4xl border border-white/10 relative overflow-hidden flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <Drop size={24} weight="duotone" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Hidratação</h3>
                        <p className="text-xs text-zinc-500">Meta: {dailyGoal}ml</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-blue-400 block leading-none">{amount}</span>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">ml</span>
                </div>
            </div>

            {/* Visual Bottle / Progress */}
            <div className="relative h-4 bg-deep-black rounded-full overflow-hidden mb-6 z-10 border border-white/5">
                <div
                    className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 relative z-10 mt-auto">
                <button
                    onClick={() => handleAddWater(250)}
                    disabled={loading}
                    className="flex items-center justify-center gap-1 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-colors active:scale-95 border border-blue-500/10"
                >
                    <Plus weight="bold" /> 250
                </button>
                <button
                    onClick={() => handleAddWater(500)}
                    disabled={loading}
                    className="flex items-center justify-center gap-1 py-3 bg-blue-500/10 text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-500/20 transition-colors active:scale-95 border border-blue-500/10"
                >
                    <Plus weight="bold" /> 500
                </button>
            </div>

            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-8 text-blue-500/5 z-0 pointer-events-none">
                <Drop size={120} weight="fill" />
            </div>
        </div>
    );
}

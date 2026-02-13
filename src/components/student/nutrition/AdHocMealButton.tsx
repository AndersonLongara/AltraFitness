'use client';

import { useState } from 'react';
import { Plus, X, Cookie, Fire, Check } from "@phosphor-icons/react";
import { logAdHocMeal } from "@/app/actions/nutrition";
import { useRouter } from 'next/navigation';

export default function AdHocMealButton() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        calories: '',
        isCheatMeal: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return;

        setLoading(true);
        try {
            await logAdHocMeal({
                name: formData.name,
                calories: Number(formData.calories) || 0,
                isCheatMeal: formData.isCheatMeal
            });
            setIsOpen(false);
            setFormData({ name: '', calories: '', isCheatMeal: false });
        } catch (error) {
            console.error(error);
            alert("Erro ao registrar refeição.");
        } finally {
            setLoading(false);
            router.refresh();
        }
    };

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-acid-lime text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(189,255,0,0.4)] hover:scale-105 active:scale-95 transition-all z-40 border-2 border-black"
            >
                <Plus size={28} weight="bold" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-deep-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-surface-grey w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white">Refeição Extra</h3>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                                <X size={16} weight="bold" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">O que você comeu?</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Fatia de Pizza"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-deep-black border border-white/10 rounded-xl p-4 font-bold text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-acid-lime focus:border-acid-lime outline-none transition-all"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Estimativa de Calorias</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.calories}
                                        onChange={e => setFormData({ ...formData, calories: e.target.value })}
                                        className="w-full bg-deep-black border border-white/10 rounded-xl p-4 font-bold text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-acid-lime focus:border-acid-lime outline-none transition-all"
                                    />
                                    <span className="absolute right-4 top-4 text-xs font-bold text-zinc-500">kcal</span>
                                </div>
                            </div>

                            <div
                                onClick={() => setFormData({ ...formData, isCheatMeal: !formData.isCheatMeal })}
                                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${formData.isCheatMeal ? 'bg-red-500/10 border-red-500/50' : 'bg-deep-black border-white/5 hover:bg-white/5'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.isCheatMeal ? 'bg-red-500 text-white' : 'bg-white/5 text-zinc-500'}`}>
                                    <Cookie weight="fill" size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className={`font-bold ${formData.isCheatMeal ? 'text-red-400' : 'text-zinc-400'}`}>Refeição Livre?</div>
                                    <div className="text-[10px] text-zinc-600">Não conta para as macros oficiais</div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.isCheatMeal ? 'border-red-500 bg-red-500' : 'border-zinc-700 bg-transparent'}`}>
                                    {formData.isCheatMeal && <Check size={12} className="text-white" weight="bold" />}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-acid-lime text-deep-black rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(189,255,0,0.3)] hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                            >
                                {loading ? 'Salvando...' : 'Registrar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

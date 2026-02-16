"use client";

import { useState } from "react";
import { Plus, Trash, Check, X, PencilSimple } from "@phosphor-icons/react";
import { createPlan, deletePlan, togglePlanStatus } from "@/app/actions/financial";

interface Plan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    active: boolean | null;
}

export default function PlansManager({ plans }: { plans: Plan[] }) {
    const [isCreating, setIsCreating] = useState(false);
    const [newPlan, setNewPlan] = useState({ name: "", price: "", durationMonths: "1" });
    const [isPending, setIsPending] = useState(false);

    const handleCreate = async () => {
        if (!newPlan.name || !newPlan.price) return;

        setIsPending(true);
        try {
            await createPlan({
                name: newPlan.name,
                price: Math.round(Number(newPlan.price) * 100), // Convert to cents
                durationMonths: Number(newPlan.durationMonths)
            });
            setIsCreating(false);
            setNewPlan({ name: "", price: "", durationMonths: "1" });
        } catch (error) {
            console.error(error);
            alert("Erro ao criar plano");
        } finally {
            setIsPending(false);
        }
    };

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
    };

    return (
        <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-graphite-dark dark:text-white">Planos de Assinatura</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Gerencie as opções de matrícula.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-performance-green dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors font-bold flex items-center gap-2 text-sm"
                >
                    <Plus size={16} weight="bold" />
                    Novo Plano
                </button>
            </div>

            {isCreating && (
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl animate-in slide-in-from-top-2 border border-slate-100 dark:border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <input
                            placeholder="Nome (ex: Mensal Gold)"
                            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white text-sm font-medium outline-none focus:border-performance-green"
                            value={newPlan.name}
                            onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                            autoFocus
                        />
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400 dark:text-slate-500 text-sm">R$</span>
                            <input
                                type="number"
                                placeholder="0,00"
                                className="w-full p-2 pl-8 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white text-sm font-medium outline-none focus:border-performance-green"
                                value={newPlan.price}
                                onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                            />
                        </div>
                        <select
                            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-white text-sm font-medium outline-none focus:border-performance-green"
                            value={newPlan.durationMonths}
                            onChange={e => setNewPlan({ ...newPlan, durationMonths: e.target.value })}
                        >
                            <option value="1">1 Mês (Mensal)</option>
                            <option value="3">3 Meses (Trimestral)</option>
                            <option value="6">6 Meses (Semestral)</option>
                            <option value="12">12 Meses (Anual)</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="text-slate-500 dark:text-slate-400 text-xs font-bold px-4 py-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isPending}
                            className="bg-performance-green dark:bg-emerald-500 text-graphite-dark text-xs font-bold px-4 py-2 rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {isPending ? "Salvando..." : "Salvar Plano"}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {plans.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">Nenhum plano cadastrado.</div>
                ) : (
                    plans.map(plan => (
                        <div key={plan.id} className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl hover:border-emerald-100 dark:hover:border-emerald-500/30 transition-colors group">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className={`font-bold dark:text-white ${!plan.active && 'text-slate-400 dark:text-slate-500 line-through'}`}>{plan.name}</h4>
                                    {!plan.active && <span className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold uppercase">Inativo</span>}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
                                    {formatPrice(plan.price)} • {plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => togglePlanStatus(plan.id, !plan.active)}
                                    title={plan.active ? "Desativar" : "Ativar"}
                                    className={`p-2 rounded-xl transition-colors ${plan.active ? "text-slate-300 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"}`}
                                >
                                    {plan.active ? <X size={18} /> : <Check size={18} />}
                                </button>
                                <button
                                    onClick={() => { if (confirm('Excluir plano?')) deletePlan(plan.id) }}
                                    className="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { CalendarCheck, Clock, Trash, ArrowClockwise, Swap, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import { assignPlanToStudent, renewSubscription, cancelSubscription } from "@/app/actions/financial";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscription {
    id: string;
    name: string;
    planId: string | null;
    planEnd: Date | null;
    plan: {
        name: string;
        durationMonths: number;
    } | null;
}

interface Plan {
    id: string;
    name: string;
    durationMonths: number;
}

export default function SubscriptionsList({ subscriptions, plans }: { subscriptions: Subscription[], plans: Plan[] }) {
    const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
    const [search, setSearch] = useState("");
    const [assigningTo, setAssigningTo] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState("");

    const handleAssignPlan = async (studentId: string) => {
        if (!selectedPlan) return;
        await assignPlanToStudent({ studentId, planId: selectedPlan });
        setAssigningTo(null);
        setSelectedPlan("");
    };

    const handleRenew = async (studentId: string) => {
        if (confirm("Renovar assinatura do aluno?")) {
            await renewSubscription(studentId);
        }
    };

    const handleCancel = async (studentId: string) => {
        if (confirm("Cancelar assinatura? Esta ação não pode ser desfeita.")) {
            await cancelSubscription(studentId);
        }
    };

    const getSubscriptionStatus = (sub: Subscription) => {
        if (!sub.planId || !sub.planEnd) return 'expired';
        const daysUntilEnd = differenceInDays(new Date(sub.planEnd), new Date());
        if (daysUntilEnd < 0) return 'expired';
        if (daysUntilEnd <= 7) return 'expiring';
        return 'active';
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase());
        const status = getSubscriptionStatus(sub);
        const matchesFilter = filter === 'all' || status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="bg-pure-white p-6 rounded-3xl soft-shadow space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-graphite-dark">Assinaturas Ativas</h3>
                    <p className="text-sm text-slate-400">Gerenciamento de planos e renovações.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <MagnifyingGlass size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            placeholder="Buscar aluno..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-performance-green bg-slate-50"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="py-2.5 px-4 rounded-xl border border-slate-200 text-sm outline-none focus:border-performance-green bg-slate-50 font-medium text-slate-600"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="expiring">Expirando</option>
                        <option value="expired">Expirados</option>
                    </select>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-50">
                {filteredSubscriptions.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 text-sm">Nenhuma assinatura encontrada.</p>
                ) : (
                    filteredSubscriptions.map(sub => {
                        const status = getSubscriptionStatus(sub);
                        const daysUntilEnd = sub.planEnd ? differenceInDays(new Date(sub.planEnd), new Date()) : 0;
                        return (
                            <div key={sub.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-slate-700 text-sm truncate">{sub.name}</h4>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {status === 'active' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                                    <CalendarCheck weight="fill" size={10} /> Ativo
                                                </span>
                                            )}
                                            {status === 'expiring' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                                                    <Clock weight="fill" size={10} /> Expira em {daysUntilEnd}d
                                                </span>
                                            )}
                                            {status === 'expired' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                                    <Clock weight="fill" size={10} /> Expirado
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-400">{sub.plan?.name || 'Sem plano'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        {sub.planId && (
                                            <button
                                                onClick={() => handleRenew(sub.id)}
                                                className="p-2 text-performance-green hover:bg-emerald-50 rounded-xl transition-colors"
                                            >
                                                <ArrowClockwise size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setAssigningTo(sub.id)}
                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            <Swap size={16} />
                                        </button>
                                    </div>
                                </div>
                                {assigningTo === sub.id && (
                                    <div className="flex gap-2 items-center mt-2 pt-2 border-t border-slate-100">
                                        <select
                                            className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-performance-green"
                                            value={selectedPlan}
                                            onChange={e => setSelectedPlan(e.target.value)}
                                        >
                                            <option value="">Selecione</option>
                                            {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                        <button
                                            onClick={() => handleAssignPlan(sub.id)}
                                            className="text-xs bg-performance-green text-graphite-dark px-2 py-1 rounded-xl hover:brightness-110"
                                        >
                                            OK
                                        </button>
                                        <button
                                            onClick={() => setAssigningTo(null)}
                                            className="text-xs text-slate-500 px-2 py-1 hover:bg-slate-200 rounded-xl"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                            <th className="pb-3 pl-2">Aluno</th>
                            <th className="pb-3">Plano</th>
                            <th className="pb-3">Vencimento</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right pr-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredSubscriptions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-400">Nenhuma assinatura encontrada.</td>
                            </tr>
                        ) : (
                            filteredSubscriptions.map(sub => {
                                const status = getSubscriptionStatus(sub);
                                const daysUntilEnd = sub.planEnd ? differenceInDays(new Date(sub.planEnd), new Date()) : 0;

                                return (
                                    <tr key={sub.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                        <td className="py-4 pl-2 font-bold text-slate-700">{sub.name}</td>
                                        <td className="py-4 text-slate-500">
                                            {assigningTo === sub.id ? (
                                                <div className="flex gap-2 items-center">
                                                    <select
                                                        className="p-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-performance-green"
                                                        value={selectedPlan}
                                                        onChange={e => setSelectedPlan(e.target.value)}
                                                    >
                                                        <option value="">Selecione</option>
                                                        {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                    </select>
                                                    <button
                                                        onClick={() => handleAssignPlan(sub.id)}
                                                        className="text-xs bg-performance-green text-graphite-dark px-2 py-1 rounded-xl hover:brightness-110"
                                                    >
                                                        OK
                                                    </button>
                                                    <button
                                                        onClick={() => setAssigningTo(null)}
                                                        className="text-xs text-slate-500 px-2 py-1 hover:bg-slate-200 rounded-xl"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : (
                                                sub.plan?.name || '-'
                                            )}
                                        </td>
                                        <td className="py-4 text-slate-500">
                                            {sub.planEnd ? format(new Date(sub.planEnd), "dd/MM/yyyy") : '-'}
                                        </td>
                                        <td className="py-4">
                                            {status === 'active' && (
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">
                                                    <CalendarCheck weight="fill" /> Ativo
                                                </span>
                                            )}
                                            {status === 'expiring' && (
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase">
                                                    <Clock weight="fill" /> Expira em {daysUntilEnd}d
                                                </span>
                                            )}
                                            {status === 'expired' && (
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase">
                                                    <Clock weight="fill" /> Expirado
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {sub.planId && (
                                                    <button
                                                        onClick={() => handleRenew(sub.id)}
                                                        title="Renovar Assinatura"
                                                        className="p-2 text-performance-green hover:bg-emerald-50 rounded-xl transition-colors"
                                                    >
                                                        <ArrowClockwise size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setAssigningTo(sub.id)}
                                                    title="Trocar Plano"
                                                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                                                >
                                                    <Swap size={18} />
                                                </button>
                                                {sub.planId && (
                                                    <button
                                                        onClick={() => handleCancel(sub.id)}
                                                        title="Cancelar Assinatura"
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { CheckCircle, Clock, Trash, Funnel, MagnifyingGlass, Plus, X } from "@phosphor-icons/react";
import { markAsPaid, deletePayment, createPayment, createPaymentReceived } from "@/app/actions/financial";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Payment {
    id: string;
    amount: number;
    dueDate: Date;
    status: string | null;
    asaasInvoiceUrl?: string | null;
    student: { name: string };
    plan: { name: string } | null;
}

interface Student {
    id: string;
    name: string;
}

interface Plan {
    id: string;
    name: string;
    durationMonths: number;
}

export default function PaymentsList({ payments, students, plans = [] }: { payments: Payment[]; students: Student[]; plans?: Plan[] }) {
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [createMode, setCreateMode] = useState<"new" | "received">("new");
    const [newPayment, setNewPayment] = useState({ studentId: "", amount: "", dueDate: "", paidAt: "", planId: "", sendViaAsaas: false, billingType: "PIX" as "PIX" | "BOLETO" | "CREDIT_CARD" });
    const [createError, setCreateError] = useState<string | null>(null);

    const handleCreate = async () => {
        setCreateError(null);
        const valueReais = parseFloat(newPayment.amount.trim().replace(",", "."));
        if (Number.isNaN(valueReais) || valueReais <= 0) {
            setCreateError("Informe um valor válido maior que zero (ex: 99,90).");
            return;
        }
        if (valueReais > 999_999.99) {
            setCreateError("Valor máximo permitido é R$ 999.999,99.");
            return;
        }
        const amountCents = Math.round(valueReais * 100);
        try {
            if (createMode === "received") {
                if (!newPayment.studentId) {
                    setCreateError("Selecione o aluno.");
                    return;
                }
                const dateStr = newPayment.paidAt || new Date().toISOString().slice(0, 10);
                await createPaymentReceived({
                    studentId: newPayment.studentId,
                    amount: amountCents,
                    paidAt: new Date(dateStr),
                    planId: newPayment.planId || undefined,
                });
                setIsCreating(false);
                setNewPayment({ studentId: "", amount: "", dueDate: "", paidAt: "", planId: "", sendViaAsaas: false, billingType: "PIX" });
            } else {
                if (!newPayment.studentId || !newPayment.dueDate) {
                    setCreateError("Selecione o aluno e a data de vencimento.");
                    return;
                }
                const result = await createPayment({
                    studentId: newPayment.studentId,
                    amount: amountCents,
                    dueDate: new Date(newPayment.dueDate),
                    sendViaAsaas: newPayment.sendViaAsaas,
                    billingType: newPayment.sendViaAsaas ? newPayment.billingType : undefined,
                });
                setIsCreating(false);
                setNewPayment({ studentId: "", amount: "", dueDate: "", paidAt: "", planId: "", sendViaAsaas: false, billingType: "PIX" });
                if (result?.invoiceUrl) window.open(result.invoiceUrl, "_blank");
            }
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : "Erro ao criar cobrança.");
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.student.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || p.status === filter;

        if (filter === 'overdue' && p.status === 'pending') {
            return matchesSearch && new Date(p.dueDate) < new Date();
        }

        return matchesSearch && matchesFilter;
    });

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
    };

    const handleMarkAsPaid = async (id: string) => {
        if (confirm("Confirmar pagamento?")) {
            await markAsPaid(id);
        }
    };

    return (
        <div className="bg-pure-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow space-y-6 border border-slate-100 dark:border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-graphite-dark">Histórico de Pagamentos</h3>
                    <p className="text-sm text-slate-400">Controle de mensalidades e cobranças.</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button
                        onClick={() => { setCreateMode("new"); setNewPayment({ ...newPayment, paidAt: "" }); setIsCreating(true); }}
                        className="p-4 bg-performance-green text-graphite-dark rounded-xl hover:brightness-110 transition-all font-bold flex items-center gap-2 text-sm"
                    >
                        <Plus size={16} weight="bold" />
                        <span className="hidden md:inline">Nova Cobrança</span>
                    </button>
                    <button
                        onClick={() => { setCreateMode("received"); setNewPayment({ ...newPayment, paidAt: new Date().toISOString().slice(0, 10) }); setIsCreating(true); }}
                        className="p-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold flex items-center gap-2 text-sm border border-slate-200"
                    >
                        <CheckCircle size={16} weight="bold" />
                        <span className="hidden md:inline">Registrar pagamento recebido</span>
                    </button>

                    <div className="relative flex-1 md:w-48">
                        <MagnifyingGlass size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                            placeholder="Buscar aluno..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/20 text-sm outline-none focus:border-performance-green bg-slate-50 dark:bg-white/5"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/20 text-sm outline-none focus:border-performance-green bg-slate-50 dark:bg-white/5 font-medium text-slate-600 dark:text-slate-400"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                    >
                        <option value="all">Todos</option>
                        <option value="pending">Pendentes</option>
                        <option value="paid">Pagos</option>
                        <option value="overdue">Atrasados</option>
                    </select>
                </div>
            </div>

            {isCreating && (
                <div className="bg-slate-50 dark:bg-slate-200 p-4 rounded-2xl animate-in slide-in-from-top-2 border border-slate-100 dark:border-white/10 mb-4">
                    <p className="text-sm font-medium text-slate-600 mb-3">
                        {createMode === "received" ? "Registrar pagamento já recebido (PIX, dinheiro, transferência fora da plataforma). Opcional: defina o plano do aluno." : "Nova cobrança (vencimento futuro)"}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                        <select
                            className="p-2 rounded-xl border border-slate-200 dark:border-white/20 text-sm font-medium outline-none focus:border-performance-green bg-white dark:bg-white/5"
                            value={newPayment.studentId}
                            onChange={e => setNewPayment({ ...newPayment, studentId: e.target.value })}
                        >
                            <option value="">Selecione o Aluno</option>
                            {students?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-400 text-sm">R$</span>
                            <input
                                type="text"
                                placeholder="0,00"
                                className="w-full p-2 pl-8 rounded-xl border border-slate-200 dark:border-white/20 text-sm font-medium outline-none focus:border-performance-green bg-white dark:bg-white/5"
                                value={newPayment.amount}
                                onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                            />
                        </div>
                        {createMode === "received" ? (
                            <>
                                <select
                                    className="p-2 rounded-xl border border-slate-200 dark:border-white/20 text-sm font-medium outline-none focus:border-performance-green bg-white dark:bg-white/5"
                                    value={newPayment.planId}
                                    onChange={e => setNewPayment({ ...newPayment, planId: e.target.value })}
                                >
                                    <option value="">Plano (opcional)</option>
                                    {plans?.map((p: Plan) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    className="p-2 rounded-xl border border-slate-200 dark:border-white/20 text-sm font-medium outline-none focus:border-performance-green bg-white dark:bg-white/5"
                                    placeholder="Data do pagamento"
                                    value={newPayment.paidAt}
                                    onChange={e => setNewPayment({ ...newPayment, paidAt: e.target.value })}
                                />
                            </>
                        ) : (
                            <input
                                type="date"
                                className="p-2 rounded-xl border border-slate-200 dark:border-white/20 text-sm font-medium outline-none focus:border-performance-green bg-white dark:bg-white/5"
                                value={newPayment.dueDate}
                                onChange={e => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                            />
                        )}
                    </div>
                    {createMode === "new" && (
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={newPayment.sendViaAsaas}
                                    onChange={e => setNewPayment({ ...newPayment, sendViaAsaas: e.target.checked })}
                                    className="rounded border-slate-300 text-performance-green focus:ring-performance-green"
                                />
                                Enviar cobrança por Asaas (PIX/Boleto/Cartão)
                            </label>
                            {newPayment.sendViaAsaas && (
                                <select
                                    className="p-2 rounded-xl border border-slate-200 text-sm font-medium"
                                    value={newPayment.billingType}
                                    onChange={e => setNewPayment({ ...newPayment, billingType: e.target.value as "PIX" | "BOLETO" | "CREDIT_CARD" })}
                                >
                                    <option value="PIX">PIX</option>
                                    <option value="BOLETO">Boleto</option>
                                    <option value="CREDIT_CARD">Cartão</option>
                                </select>
                            )}
                        </div>
                    )}
                    {createError && <p className="text-sm text-red-600 mb-2">{createError}</p>}
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => { setIsCreating(false); setCreateError(null); }}
                            className="text-slate-500 text-xs font-bold px-4 py-2 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreate}
                            className="bg-performance-green text-graphite-dark text-xs font-bold px-4 py-2 rounded-xl hover:brightness-110 transition-all"
                        >
                            {createMode === "received" ? "Registrar" : "Lançar Cobrança"}
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
                {filteredPayments.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 text-sm">Nenhum pagamento encontrado.</p>
                ) : (
                    filteredPayments.map(payment => {
                        const isOverdue = payment.status === 'pending' && new Date(payment.dueDate) < new Date();
                        const displayStatus = isOverdue ? 'overdue' : payment.status;
                        return (
                            <div key={payment.id} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-700 text-sm truncate">{payment.student.name}</h4>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        {displayStatus === 'paid' && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                                <CheckCircle weight="fill" size={10} /> Pago
                                            </span>
                                        )}
                                        {displayStatus === 'pending' && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                                                <Clock weight="fill" size={10} /> Pendente
                                            </span>
                                        )}
                                        {displayStatus === 'overdue' && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                                <Clock weight="fill" size={10} /> Atrasado
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400">{format(payment.dueDate, "dd/MM/yyyy")}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <span className="font-mono font-bold text-sm text-slate-700">{formatPrice(payment.amount)}</span>
                                    <div className="flex items-center justify-end gap-2 mt-1">
                                        {payment.asaasInvoiceUrl && (
                                            <a href={payment.asaasInvoiceUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Ver cobrança">Link</a>
                                        )}
                                        {payment.status !== 'paid' && (
                                            <button onClick={() => handleMarkAsPaid(payment.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => { if (confirm('Excluir registro?')) deletePayment(payment.id) }} className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                </div>
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
                            <th className="pb-3">Valor</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right pr-2">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-400">Nenhum pagamento encontrado.</td>
                            </tr>
                        ) : (
                            filteredPayments.map(payment => {
                                const isOverdue = payment.status === 'pending' && new Date(payment.dueDate) < new Date();
                                const displayStatus = isOverdue ? 'overdue' : payment.status;

                                return (
                                    <tr key={payment.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 last:border-0">
                                        <td className="py-4 pl-2 font-bold text-slate-700">{payment.student.name}</td>
                                        <td className="py-4 text-slate-500">{payment.plan?.name || '-'}</td>
                                        <td className="py-4 text-slate-500">
                                            {format(payment.dueDate, "dd/MM/yyyy")}
                                        </td>
                                        <td className="py-4 font-mono font-medium text-slate-600">
                                            {formatPrice(payment.amount)}
                                        </td>
                                        <td className="py-4">
                                            {displayStatus === 'paid' && (
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase">
                                                    <CheckCircle weight="fill" /> Pago
                                                </span>
                                            )}
                                            {displayStatus === 'pending' && (
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase">
                                                    <Clock weight="fill" /> Pendente
                                                </span>
                                            )}
                                            {displayStatus === 'overdue' && (
                                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase">
                                                    <Clock weight="fill" /> Atrasado
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {payment.asaasInvoiceUrl && (
                                                    <a href={payment.asaasInvoiceUrl} target="_blank" rel="noopener noreferrer" title="Ver cobrança" className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">Link cobrança</a>
                                                )}
                                                {payment.status !== 'paid' && (
                                                    <button onClick={() => handleMarkAsPaid(payment.id)} title="Marcar como Pago" className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                <button onClick={() => { if (confirm('Excluir registro?')) deletePayment(payment.id) }} title="Excluir" className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                                                    <Trash size={18} />
                                                </button>
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

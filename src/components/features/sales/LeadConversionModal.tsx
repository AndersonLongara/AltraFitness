'use client';

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check, ArrowRight, Wallet, Calendar } from "@phosphor-icons/react";
import { convertLeadToStudent } from "@/app/actions/leads";

interface Plan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
}

interface LeadConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: { id: string; name: string } | null;
    plans: Plan[];
}

export default function LeadConversionModal({ isOpen, onClose, lead, plans }: LeadConversionModalProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isConverting, setIsConverting] = useState(false);

    if (!lead) return null;

    const handleConfirm = async () => {
        if (!selectedPlanId) return;

        setIsConverting(true);
        try {
            await convertLeadToStudent(lead.id, selectedPlanId, startDate);
            onClose();
            // Optional: Success Toast
        } catch (error) {
            console.error("Conversion failed", error);
            alert("Falha ao converter lead. Tente novamente.");
        } finally {
            setIsConverting(false);
        }
    };

    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-ice-white rounded-[32px] p-2 shadow-2xl z-50 animate-scale-in outline-none">
                    <Dialog.Title className="sr-only">Converter Lead em Aluno</Dialog.Title>

                    <div className="bg-pure-white rounded-[24px] p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-graphite-dark tracking-tight">Novo Aluno</h2>
                                <p className="text-slate-400 font-medium text-sm">Defina o plano para {lead.name}</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={24} weight="bold" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Plan Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Plano Contratado</label>
                                <div className="grid gap-2">
                                    {plans.length === 0 ? (
                                        <div className="p-4 bg-amber-50 rounded-xl text-amber-600 text-sm font-medium border border-amber-100">
                                            Nenhum plano cadastrado.
                                        </div>
                                    ) : (
                                        plans.map(plan => (
                                            <label
                                                key={plan.id}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group
                                                    ${selectedPlanId === plan.id
                                                        ? 'bg-emerald-50 border-performance-green/50 ring-1 ring-performance-green'
                                                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="plan"
                                                        value={plan.id}
                                                        checked={selectedPlanId === plan.id}
                                                        onChange={(e) => setSelectedPlanId(e.target.value)}
                                                        className="hidden"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-graphite-dark">{plan.name}</div>
                                                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                                                            {plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-emerald-600">
                                                    {(plan.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Início da Vigência</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Calendar size={24} weight="duotone" />
                                    </span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-4 pl-12 bg-slate-50 rounded-[12px] font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 transition-all border border-transparent focus:border-emerald-200"
                                    />
                                </div>
                            </div>

                            {/* Estimated Total */}
                            {selectedPlan && (
                                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase">Valor Total</div>
                                    <div className="text-xl font-extrabold text-graphite-dark">
                                        {(selectedPlan.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!selectedPlanId || isConverting}
                                    className="flex-1 py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isConverting ? (
                                        <>Processando...</>
                                    ) : (
                                        <>
                                            Confirmar <ArrowRight weight="bold" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

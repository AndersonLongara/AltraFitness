'use client';

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight, Calendar, CheckCircle } from "@phosphor-icons/react";
import { updateStudentPlan } from "@/app/actions/students";

interface Plan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
}

interface PlanSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    currentPlanId?: string;
    plans: Plan[];
    onUpdate: () => void;
}

export default function PlanSelectionModal({ isOpen, onClose, studentId, currentPlanId, plans, onUpdate }: PlanSelectionModalProps) {
    const [selectedPlanId, setSelectedPlanId] = useState<string>(currentPlanId || "");
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleConfirm = async () => {
        if (!selectedPlanId) return;

        setIsUpdating(true);
        try {
            await updateStudentPlan(studentId, selectedPlanId, startDate);
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Failed to update plan", error);
            alert("Falha ao atualizar plano. Tente novamente.");
        } finally {
            setIsUpdating(false);
        }
    };

    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-ice-white rounded-[32px] p-2 shadow-2xl z-50 animate-scale-in outline-none">
                    <Dialog.Title className="sr-only">Alterar Plano do Aluno</Dialog.Title>

                    <div className="bg-pure-white rounded-[24px] p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-graphite-dark tracking-tight">Alterar Plano</h2>
                                <p className="text-slate-400 font-medium text-sm">Selecione o novo plano do aluno</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={24} weight="bold" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Plan Selection */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Plano</label>
                                <div className="grid gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
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
                                                <div className="flex items-center gap-3">
                                                    <div className="font-bold text-emerald-600">
                                                        {(plan.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </div>
                                                    {selectedPlanId === plan.id && (
                                                        <CheckCircle size={20} weight="fill" className="text-performance-green" />
                                                    )}
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

                            {/* Info Box */}
                            {selectedPlan && (
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-500">
                                    Ao confirmar, o plano atual será substituído pelo <strong>{selectedPlan.name}</strong> e a data de vencimento será recalculada para <strong>{selectedPlan.durationMonths} meses</strong> a partir da data de início selecionada.
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
                                    disabled={!selectedPlanId || isUpdating}
                                    className="flex-1 py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? (
                                        <>Salvando...</>
                                    ) : (
                                        <>
                                            Salvar Alterações <ArrowRight weight="bold" />
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

'use client';

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FloppyDisk, User, InstagramLogo, WhatsappLogo, Calendar, CurrencyDollar, TrendUp } from "@phosphor-icons/react";
import Image from "next/image";
import { updateLeadStageData, updateLeadMetadata } from "@/app/actions/leads";

interface Lead {
    id: string;
    name: string;
    phone: string;
    socialHandle?: string | null;
    photoUrl?: string | null;
    pipelineStage: string | null;
    estimatedValue: number | null;
    temperature: string | null;
    stageData?: Record<string, any> | null;
}

interface LeadDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: Lead | null;
}

const STAGE_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'number' | 'date' | 'textarea' }[]> = {
    'new': [
        { key: 'initialNotes', label: 'Notas Iniciais', type: 'textarea' },
        { key: 'sourceDetail', label: 'Detalhe da Origem', type: 'text' }
    ],
    'contacted': [
        { key: 'contactAttempts', label: 'Tentativas de Contato', type: 'number' },
        { key: 'bestTime', label: 'Melhor Horário', type: 'text' },
        { key: 'responseSummary', label: 'Resumo da Resposta', type: 'textarea' }
    ],
    'scheduled': [
        { key: 'visitDate', label: 'Data da Visita', type: 'date' },
        { key: 'visitType', label: 'Tipo de Visita (Presencial/Online)', type: 'text' },
    ],
    'negotiation': [
        { key: 'proposalValue', label: 'Valor Proposto (R$)', type: 'number' },
        { key: 'objections', label: 'Principais Objeções', type: 'textarea' },
        { key: 'deadline', label: 'Prazo para Decisão', type: 'date' }
    ],
    'won': [
        { key: 'closedAt', label: 'Data de Fechamento', type: 'date' },
        { key: 'contractDuration', label: 'Duração do Contrato (Meses)', type: 'number' }
    ],
    'lost': [
        { key: 'lostReason', label: 'Motivo da Perda', type: 'text' },
        { key: 'feedback', label: 'Feedback do Cliente', type: 'textarea' }
    ]
};

export default function LeadDetailsModal({ isOpen, onClose, lead }: LeadDetailsModalProps) {
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [estimatedValue, setEstimatedValue] = useState<string>("");
    const [temperature, setTemperature] = useState<string>("warm");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData(lead.stageData || {});
            setEstimatedValue(lead.estimatedValue?.toString() || "");
            setTemperature(lead.temperature || "warm");
        }
    }, [lead]);

    if (!lead) return null;

    const currentStage = lead.pipelineStage || 'new';
    const fields = STAGE_FIELDS[currentStage] || [];

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Stage Data
            await updateLeadStageData(lead.id, formData);

            // Save Metadata (Value & Temperature) by updating lead directly
            const value = parseFloat(estimatedValue.replace(',', '.'));
            await updateLeadMetadata(lead.id, {
                estimatedValue: isNaN(value) ? 0 : value,
                temperature
            });

            onClose();
        } catch (error) {
            console.error("Failed to save lead details", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-ice-white rounded-[32px] p-2 shadow-2xl z-50 animate-scale-in outline-none max-h-[90vh] overflow-y-auto">
                    <Dialog.Title className="sr-only">Detalhes do Lead</Dialog.Title>

                    <div className="bg-pure-white rounded-[24px] p-6 md:p-8 space-y-6">
                        {/* Header: Photo + Info */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative shrink-0">
                                {lead.photoUrl ? (
                                    <Image
                                        src={lead.photoUrl}
                                        alt={lead.name}
                                        width={80}
                                        height={80}
                                        className="rounded-full object-cover border-4 border-slate-50 shadow-md"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-4 border-slate-50">
                                        <User weight="bold" size={40} />
                                    </div>
                                )}
                                {lead.socialHandle && (
                                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                                        <InstagramLogo size={16} weight="bold" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-graphite-dark">{lead.name}</h2>
                                        <p className="text-slate-400 font-medium flex items-center gap-2">
                                            {lead.socialHandle && <span className="text-slate-500">{lead.socialHandle}</span>}
                                            {lead.phone && (
                                                <a
                                                    href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    className="flex items-center gap-1 text-emerald-500 hover:underline text-sm font-bold bg-emerald-50 px-2 py-0.5 rounded-full"
                                                >
                                                    <WhatsappLogo weight="fill" /> WhatsApp
                                                </a>
                                            )}
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                                        <X size={24} weight="bold" />
                                    </button>
                                </div>

                                {/* Quick Metadata: Value & Temperature */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-slate-50 p-3 rounded-xl">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1">
                                            <CurrencyDollar size={14} /> Valor Estimado
                                        </label>
                                        <input
                                            type="number"
                                            value={estimatedValue}
                                            onChange={(e) => setEstimatedValue(e.target.value)}
                                            placeholder="0,00"
                                            className="bg-transparent font-bold text-graphite-dark w-full outline-none"
                                        />
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-1">
                                            <TrendUp size={14} /> Temperatura
                                        </label>
                                        <select
                                            value={temperature}
                                            onChange={(e) => setTemperature(e.target.value)}
                                            className="bg-transparent font-bold text-graphite-dark w-full outline-none appearance-none"
                                        >
                                            <option value="cold">Frio</option>
                                            <option value="warm">Morno</option>
                                            <option value="hot">Quente</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Stage Specific Documentation */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                                Documentação da Etapa: <span className="text-performance-green">{currentStage}</span>
                            </h3>

                            <div className="grid gap-4">
                                {fields.length > 0 ? fields.map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-bold text-slate-400 mb-1.5">{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                className="w-full p-3 bg-slate-50 rounded-xl font-medium text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 min-h-[100px] resize-none"
                                                placeholder={`Digite ${field.label.toLowerCase()}...`}
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                className="w-full p-3 bg-slate-50 rounded-xl font-medium text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100"
                                            />
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-slate-400 italic text-sm">Nenhum campo específico configurado para esta etapa.</p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-3 bg-performance-green text-graphite-dark font-bold rounded-xl shadow-lg shadow-emerald-200 hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {isSaving ? 'Salvando...' : (
                                    <>
                                        <FloppyDisk size={20} weight="bold" />
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

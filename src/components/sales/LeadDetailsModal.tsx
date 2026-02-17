'use client';

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FloppyDisk, User, InstagramLogo, WhatsappLogo, Calendar, CurrencyDollar, TrendUp, ChatCenteredText, PaperPlaneRight, CheckCircle, Clock, ListNumbers, NotePencil, CaretLeft, CaretRight } from "@phosphor-icons/react";
import Image from "next/image";
import { updateLeadStageData, updateLeadMetadata } from "@/app/actions/leads";
import { getLeadQuestionnaireTemplates, getLeadFormResponses, assignFormToLead } from "@/app/actions/lead-forms";
import { getForms } from "@/app/actions/forms";

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

const STAGE_FIELDS: Record<string, { key: string; label: string; type: 'text' | 'number' | 'date' | 'textarea' | 'time' | 'tel'; required?: boolean }[]> = {
    'new': [
        { key: 'initialNotes', label: 'Notas Iniciais', type: 'textarea' },
        { key: 'sourceDetail', label: 'Detalhe da Origem', type: 'text' }
    ],
    'contacted': [
        { key: 'clientWhatsApp', label: 'WhatsApp do Cliente', type: 'tel', required: true },
        { key: 'contactAttempts', label: 'Tentativas de Contato', type: 'number' },
        { key: 'bestTime', label: 'Melhor Horário', type: 'text' },
        { key: 'responseSummary', label: 'Resumo da Resposta', type: 'textarea' }
    ],
    'scheduled': [
        { key: 'scheduledDate', label: 'Data do Agendamento', type: 'date' },
        { key: 'scheduledTime', label: 'Horário do Agendamento', type: 'time' },
        { key: 'callLink', label: 'Link da Call (Meet, Zoom, etc)', type: 'text' },
        { key: 'visitType', label: 'Tipo de Visita (Presencial/Online)', type: 'text' },
    ],
    'negotiation': [
        { key: 'proposalValue', label: 'Valor Proposto (R$)', type: 'number' },
        { key: 'objections', label: 'Principais Objeções', type: 'textarea' },
        { key: 'deadline', label: 'Prazo para Decisão', type: 'date' }
    ],
    'won': [
        { key: 'clientWhatsApp', label: 'WhatsApp do Cliente', type: 'tel', required: true },
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
    
    // Lead forms/questionnaires state
    const [allForms, setAllForms] = useState<any[]>([]);
    const [allQuestionnaires, setAllQuestionnaires] = useState<any[]>([]);
    const [leadForms, setLeadForms] = useState<any[]>([]);
    const [isSendingForm, setIsSendingForm] = useState(false);
    
    // Pagination state
    const [formsPage, setFormsPage] = useState(1);
    const [questionnairesPage, setQuestionnairesPage] = useState(1);
    const ITEMS_PER_PAGE = 3;

    useEffect(() => {
        if (lead) {
            setFormData(lead.stageData || {});
            setEstimatedValue(lead.estimatedValue?.toString() || "");
            setTemperature(lead.temperature || "warm");
            
            // Fetch forms, questionnaires and lead forms
            if (lead.pipelineStage === 'scheduled') {
                fetchForms();
                fetchQuestionnaires();
                fetchLeadForms();
            }
        }
    }, [lead]);
    
    const fetchForms = async () => {
        try {
            const allTemplates = await getForms();
            // Filter for regular forms (not questionnaires)
            const forms = allTemplates.filter(t => t.type !== 'lead_questionnaire' && t.type !== 'questionnaire');
            setAllForms(forms);
        } catch (error) {
            console.error("Failed to fetch forms", error);
        }
    };
    
    const fetchQuestionnaires = async () => {
        try {
            const templates = await getLeadQuestionnaireTemplates();
            setAllQuestionnaires(templates);
        } catch (error) {
            console.error("Failed to fetch questionnaires", error);
        }
    };
    
    const fetchLeadForms = async () => {
        if (!lead) return;
        try {
            const forms = await getLeadFormResponses(lead.id);
            setLeadForms(forms);
        } catch (error) {
            console.error("Failed to fetch lead forms", error);
        }
    };
    
    const handleSendQuestionnaire = async (formId: string) => {
        if (!lead || !formId) return;
        setIsSendingForm(true);
        try {
            const { token } = await assignFormToLead(formId, lead.id);
            const link = `${window.location.origin}/f/${token}`;
            const message = `Olá ${lead.name}! Para melhor prepararmos nosso atendimento, por favor preencha este breve questionário: ${link}`;
            const whatsappUrl = `https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            await fetchLeadForms(); // Refresh the list
        } catch (error) {
            console.error("Failed to send questionnaire", error);
            alert("Erro ao enviar questionário");
        } finally {
            setIsSendingForm(false);
        }
    };

    if (!lead) return null;

    const currentStage = lead.pipelineStage || 'new';
    const fields = STAGE_FIELDS[currentStage] || [];

    const handleSave = async () => {
        // Validate required fields
        const requiredFields = fields.filter(f => f.required);
        const missingFields = requiredFields.filter(f => !formData[f.key]);
        
        if (missingFields.length > 0) {
            alert(`Campos obrigatórios não preenchidos: ${missingFields.map(f => f.label).join(', ')}`);
            return;
        }

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
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-[#1E2A36] rounded-[32px] p-2 shadow-2xl dark:shadow-none border border-slate-200 dark:border-white/10 z-50 animate-scale-in outline-none max-h-[90vh] overflow-y-auto">
                    <Dialog.Title className="sr-only">Detalhes do Lead</Dialog.Title>

                    <div className="bg-white dark:bg-[#1E2A36] rounded-[24px] p-6 md:p-8 space-y-6">
                        {/* Header: Photo + Info */}
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative shrink-0">
                                {lead.photoUrl ? (
                                    <Image
                                        src={lead.photoUrl}
                                        alt={lead.name}
                                        width={80}
                                        height={80}
                                        className="rounded-full object-cover border-4 border-slate-50 dark:border-white/10 shadow-md"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 border-4 border-slate-50 dark:border-white/10">
                                        <User weight="bold" size={40} />
                                    </div>
                                )}
                                {lead.socialHandle && (
                                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white p-1.5 rounded-full border-4 border-white dark:border-[#1E2A36] shadow-sm">
                                        <InstagramLogo size={16} weight="bold" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-graphite-dark dark:text-white">{lead.name}</h2>
                                        <p className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-2">
                                            {lead.socialHandle && <span className="text-slate-500 dark:text-slate-400">{lead.socialHandle}</span>}
                                            {lead.phone && (
                                                <a
                                                    href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    className="flex items-center gap-1 text-emerald-500 hover:underline text-sm font-bold bg-emerald-50 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full"
                                                >
                                                    <WhatsappLogo weight="fill" /> WhatsApp
                                                </a>
                                            )}
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="p-2 text-slate-300 dark:text-slate-500 hover:text-slate-500 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-full transition-colors">
                                        <X size={24} weight="bold" />
                                    </button>
                                </div>

                                {/* Quick Metadata: Value & Temperature */}
                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-transparent dark:border-white/10">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                                            <CurrencyDollar size={14} /> Valor Estimado
                                        </label>
                                        <input
                                            type="number"
                                            value={estimatedValue}
                                            onChange={(e) => setEstimatedValue(e.target.value)}
                                            placeholder="0,00"
                                            className="bg-transparent font-bold text-graphite-dark dark:text-white w-full outline-none"
                                        />
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-transparent dark:border-white/10">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                                            <TrendUp size={14} /> Temperatura
                                        </label>
                                        <select
                                            value={temperature}
                                            onChange={(e) => setTemperature(e.target.value)}
                                            className="bg-transparent font-bold text-graphite-dark dark:text-white w-full outline-none appearance-none"
                                        >
                                            <option value="cold">Frio</option>
                                            <option value="warm">Morno</option>
                                            <option value="hot">Quente</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100 dark:border-white/10" />

                        {/* Stage Specific Documentation */}
                        <div>
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                                Documentação da Etapa: <span className="text-performance-green">{currentStage}</span>
                            </h3>

                            <div className="grid gap-4">
                                {fields.length > 0 ? fields.map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.required}
                                                className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-graphite-dark dark:text-white outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 min-h-[100px] resize-none"
                                                placeholder={`Digite ${field.label.toLowerCase()}...`}
                                            />
                                        ) : field.type === 'tel' ? (
                                            <input
                                                type="tel"
                                                value={formData[field.key] || ''}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, '');
                                                    if (value.length > 11) value = value.slice(0, 11);
                                                    
                                                    if (value.length > 10) {
                                                        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                                                    } else if (value.length > 6) {
                                                        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                                                    } else if (value.length > 2) {
                                                        value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                                                    } else if (value.length > 0) {
                                                        value = value.replace(/^(\d*)/, '($1');
                                                    }
                                                    
                                                    setFormData({ ...formData, [field.key]: value });
                                                }}
                                                required={field.required}
                                                placeholder="(11) 98765-4321"
                                                className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-graphite-dark dark:text-white outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30"
                                            />
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={formData[field.key] || ''}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                required={field.required}
                                                className="w-full p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-medium text-graphite-dark dark:text-white outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30"
                                            />
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-slate-400 dark:text-slate-500 italic text-sm">Nenhum campo específico configurado para esta etapa.</p>
                                )}
                            </div>
                        </div>

                        {/* Forms & Questionnaires Section (only for scheduled stage) */}
                        {currentStage === 'scheduled' && (
                            <>
                                <hr className="border-slate-100 dark:border-white/10" />
                                
                                {/* Manual Questionnaire Send via WhatsApp */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                                            <WhatsappLogo size={24} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-1">Envio Manual de Questionário</h4>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-3">
                                                Selecione abaixo qual formulário ou questionário deseja enviar manualmente via WhatsApp.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Formulários Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <NotePencil size={16} /> Formulários
                                        </h3>
                                    </div>

                                    {allForms.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {allForms.slice((formsPage - 1) * ITEMS_PER_PAGE, formsPage * ITEMS_PER_PAGE).map((form) => (
                                                    <div
                                                        key={form.id}
                                                        className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                                                                form.isActive
                                                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                    : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                                                            }`}>
                                                                {form.isActive ? 'Ativo' : 'Rascunho'}
                                                            </span>
                                                            <button
                                                                onClick={() => handleSendQuestionnaire(form.id)}
                                                                disabled={isSendingForm || !lead.phone}
                                                                className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/30 disabled:opacity-50 transition-all"
                                                                title="Enviar via WhatsApp"
                                                            >
                                                                <PaperPlaneRight size={16} weight="bold" />
                                                            </button>
                                                        </div>
                                                        
                                                        <h4 className="text-base font-bold text-graphite-dark dark:text-white mb-1 line-clamp-1">{form.title}</h4>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-3">{form.description || 'Sem descrição'}</p>
                                                        
                                                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
                                                            <span className="flex items-center gap-1">
                                                                <ListNumbers size={12} />
                                                                {form.questions?.length || 0} perguntas
                                                            </span>
                                                            <span className="capitalize">
                                                                {form.triggerType === 'manual' ? 'Manual' : form.triggerType?.replace('_', ' ') || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Pagination Controls for Forms */}
                                            {allForms.length > ITEMS_PER_PAGE && (
                                                <div className="flex items-center justify-center gap-2 mt-4">
                                                    <button
                                                        onClick={() => setFormsPage(p => Math.max(1, p - 1))}
                                                        disabled={formsPage === 1}
                                                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-30 transition-all"
                                                    >
                                                        <CaretLeft size={16} weight="bold" />
                                                    </button>
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3">
                                                        {formsPage} / {Math.ceil(allForms.length / ITEMS_PER_PAGE)}
                                                    </span>
                                                    <button
                                                        onClick={() => setFormsPage(p => Math.min(Math.ceil(allForms.length / ITEMS_PER_PAGE), p + 1))}
                                                        disabled={formsPage >= Math.ceil(allForms.length / ITEMS_PER_PAGE)}
                                                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-30 transition-all"
                                                    >
                                                        <CaretRight size={16} weight="bold" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-slate-400 dark:text-slate-500 italic text-sm">
                                            Nenhum formulário disponível.
                                        </p>
                                    )}
                                </div>

                                <hr className="border-slate-100 dark:border-white/10" />

                                {/* Questionários Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <ChatCenteredText size={16} /> Questionários
                                        </h3>
                                    </div>

                                    {allQuestionnaires.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {allQuestionnaires.slice((questionnairesPage - 1) * ITEMS_PER_PAGE, questionnairesPage * ITEMS_PER_PAGE).map((questionnaire) => (
                                                    <div
                                                        key={questionnaire.id}
                                                        className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all"
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                                    <ChatCenteredText size={16} weight="bold" className="text-blue-600 dark:text-blue-400" />
                                                                </div>
                                                                {questionnaire.triggerType === 'on_scheduled' && (
                                                                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[9px] font-bold rounded-full">
                                                                        Auto
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleSendQuestionnaire(questionnaire.id)}
                                                                disabled={isSendingForm || !lead.phone}
                                                                className="p-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/30 disabled:opacity-50 transition-all"
                                                                title="Enviar via WhatsApp"
                                                            >
                                                                <PaperPlaneRight size={16} weight="bold" />
                                                            </button>
                                                        </div>
                                                        
                                                        <h4 className="text-base font-bold text-graphite-dark dark:text-white mb-1 line-clamp-1">{questionnaire.title}</h4>
                                                        <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-3">{questionnaire.description || 'Sem descrição'}</p>
                                                        
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
                                                            <span className="flex items-center gap-1">
                                                                <ListNumbers size={12} />
                                                                {questionnaire.questions?.length || 0} perguntas
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Pagination Controls for Questionnaires */}
                                            {allQuestionnaires.length > ITEMS_PER_PAGE && (
                                                <div className="flex items-center justify-center gap-2 mt-4">
                                                    <button
                                                        onClick={() => setQuestionnairesPage(p => Math.max(1, p - 1))}
                                                        disabled={questionnairesPage === 1}
                                                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-30 transition-all"
                                                    >
                                                        <CaretLeft size={16} weight="bold" />
                                                    </button>
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3">
                                                        {questionnairesPage} / {Math.ceil(allQuestionnaires.length / ITEMS_PER_PAGE)}
                                                    </span>
                                                    <button
                                                        onClick={() => setQuestionnairesPage(p => Math.min(Math.ceil(allQuestionnaires.length / ITEMS_PER_PAGE), p + 1))}
                                                        disabled={questionnairesPage >= Math.ceil(allQuestionnaires.length / ITEMS_PER_PAGE)}
                                                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 disabled:opacity-30 transition-all"
                                                    >
                                                        <CaretRight size={16} weight="bold" />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-slate-400 dark:text-slate-500 italic text-sm">
                                            Nenhum questionário disponível. <a href="/dashboard/forms/new?type=lead_questionnaire" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Criar questionário</a>
                                        </p>
                                    )}
                                </div>

                                {/* List of Sent Forms/Questionnaires Responses */}
                                {leadForms.length > 0 && (
                                    <>
                                        <hr className="border-slate-100 dark:border-white/10" />
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                                                Respostas Recebidas
                                            </h3>
                                            <div className="space-y-2">
                                                {leadForms.map((lf) => (
                                                    <details key={lf.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                                                        <summary className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                {lf.status === 'completed' ? (
                                                                    <CheckCircle size={20} weight="fill" className="text-emerald-500" />
                                                                ) : (
                                                                    <Clock size={20} weight="bold" className="text-amber-500" />
                                                                )}
                                                                <div>
                                                                    <p className="font-bold text-graphite-dark dark:text-white">{lf.form.title}</p>
                                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                                        {lf.status === 'completed' 
                                                                            ? `Respondido em ${new Date(lf.completedAt).toLocaleDateString('pt-BR')}`
                                                                            : 'Aguardando resposta'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                lf.status === 'completed' 
                                                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                                                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                                            }`}>
                                                                {lf.status === 'completed' ? 'Completo' : 'Pendente'}
                                                            </span>
                                                        </summary>
                                                        {lf.status === 'completed' && (
                                                            <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-3 bg-white dark:bg-[#1E2A36]">
                                                                {lf.answers.map((answer: any) => (
                                                                    <div key={answer.id}>
                                                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{answer.question.question}</p>
                                                                        <p className="text-sm text-graphite-dark dark:text-white mt-1">{answer.answer}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </details>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-3 bg-performance-green dark:bg-emerald-500 text-graphite-dark dark:text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2"
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

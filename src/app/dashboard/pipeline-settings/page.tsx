'use client';

import { useState, useEffect } from "react";
import { getPipelineConfigs, updatePipelineConfig } from "@/app/actions/pipeline-configs";
import { getLeadQuestionnaireTemplates } from "@/app/actions/lead-forms";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import { FloppyDisk, Funnel, ChatCenteredText } from "@phosphor-icons/react";

const PIPELINE_STAGES = [
    { id: 'new', label: 'Novo Lead', emoji: '✨', description: 'Lead acabou de entrar no funil' },
    { id: 'contacted', label: 'Contatado', emoji: '📞', description: 'Primeira interação realizada' },
    { id: 'scheduled', label: 'Reunião Agendada', emoji: '📅', description: 'Consultoria marcada' },
    { id: 'negotiation', label: 'Negociação', emoji: '💬', description: 'Proposta em análise' },
    { id: 'won', label: 'Ganho', emoji: '🎉', description: 'Cliente fechado' },
    { id: 'lost', label: 'Perdido', emoji: '❌', description: 'Oportunidade perdida' },
];

export default function PipelineSettingsPage() {
    const [questionnaires, setQuestionnaires] = useState<any[]>([]);
    const [configs, setConfigs] = useState<Record<string, string | null>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [templatesData, configsData] = await Promise.all([
                getLeadQuestionnaireTemplates(),
                getPipelineConfigs(),
            ]);

            setQuestionnaires(templatesData);

            // Convert configs array to map
            const configMap: Record<string, string | null> = {};
            configsData.forEach(config => {
                configMap[config.pipelineStage] = config.formId;
            });
            setConfigs(configMap);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStageConfigChange = (stage: string, formId: string) => {
        setConfigs(prev => ({
            ...prev,
            [stage]: formId === 'none' ? null : formId
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save all configs
            await Promise.all(
                Object.entries(configs).map(([stage, formId]) =>
                    updatePipelineConfig(stage, formId)
                )
            );
            alert("Configurações salvas com sucesso!");
        } catch (error) {
            console.error("Failed to save configs", error);
            alert("Erro ao salvar configurações");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-soft-gray dark:text-gray-400">Carregando configurações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24">
            <LayoutSidebar />

            <main className="max-w-5xl mx-auto p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight flex items-center gap-3">
                            <Funnel size={32} weight="bold" />
                            Configurações do Pipeline
                        </h1>
                        <p className="text-soft-gray dark:text-gray-400 mt-1">
                            Defina qual questionário será enviado automaticamente em cada etapa
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-performance-green text-graphite-dark font-bold rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <FloppyDisk size={20} weight="bold" />
                        {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                    </button>
                </div>

                {/* Info Banner */}
                {questionnaires.length === 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-600 rounded-3xl p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl">⚠️</div>
                            <div>
                                <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-1">
                                    Nenhum questionário criado
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Você precisa criar pelo menos um questionário antes de configurar o pipeline. 
                                    <a href="/dashboard/questionnaires/new" className="font-bold underline ml-1">
                                        Criar questionário →
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pipeline Stages Config */}
                <div className="space-y-6">
                    {PIPELINE_STAGES.map((stage) => (
                        <div
                            key={stage.id}
                            className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10"
                        >
                            <div className="flex items-start justify-between gap-6">
                                {/* Stage Info */}
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-2xl">
                                        {stage.emoji}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-graphite-dark dark:text-white">
                                            {stage.label}
                                        </h3>
                                        <p className="text-sm text-soft-gray dark:text-gray-400 mt-1">
                                            {stage.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Questionnaire Selector */}
                                <div className="flex-1 max-w-sm">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Questionário Automático
                                    </label>
                                    <select
                                        value={configs[stage.id] || 'none'}
                                        onChange={(e) => handleStageConfigChange(stage.id, e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/20 rounded-xl font-medium text-graphite-dark dark:text-white outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-performance-green/20 transition-all"
                                        disabled={questionnaires.length === 0}
                                    >
                                        <option value="none">Nenhum (envio manual)</option>
                                        {questionnaires.map(q => (
                                            <option key={q.id} value={q.id}>
                                                {q.title}
                                            </option>
                                        ))}
                                    </select>
                                    {configs[stage.id] && configs[stage.id] !== 'none' && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                                            <ChatCenteredText size={14} weight="bold" />
                                            Será enviado automaticamente
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Help Section */}
                <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-3xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="text-3xl">💡</div>
                        <div>
                            <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
                                Como funciona o envio automático?
                            </h3>
                            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                                <li>• Quando você move um lead para uma etapa configurada, o questionário é atribuído automaticamente</li>
                                <li>• O formulário fica disponível no modal do lead para envio via WhatsApp</li>
                                <li>• Se deixar como "Nenhum", você precisará selecionar e enviar manualmente</li>
                                <li>• Você pode alterar essas configurações a qualquer momento</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

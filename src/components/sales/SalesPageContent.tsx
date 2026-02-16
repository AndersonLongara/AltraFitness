'use client';

import { useState } from "react";
import { MagnifyingGlass, Plus, Kanban, ListBullets, Eye, EyeSlash } from "@phosphor-icons/react";
import InviteModal from "@/components/leads/InviteModal";
import PipelineBoard from "./PipelineBoard";
import FunnelList from "./FunnelList";
import SalesAiManager from "./SalesAiManager";
import LeadConversionModal from "./LeadConversionModal";
import LeadDetailsModal from "./LeadDetailsModal";
import SalesMetrics from "./SalesMetrics";
import PlansSetupAlert from "@/components/financial/PlansSetupAlert";
import { convertLeadToStudent } from "@/app/actions/leads";
import { useMemo } from "react";

interface SalesPageContentProps {
    leadsList: any[];
    plansList: any[];
}

export default function SalesPageContent({ leadsList, plansList }: SalesPageContentProps) {
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLead, setSelectedLead] = useState<any | null>(null);

    // Conversion Modal State
    const [conversionModal, setConversionModal] = useState<{ isOpen: boolean; leadId: string; token: string | null; name: string }>({
        isOpen: false,
        leadId: "",
        token: null,
        name: ""
    });

    const [activeFilter, setActiveFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
    const [showFinalized, setShowFinalized] = useState(false); // Default hidden

    const filteredLeads = useMemo(() => {
        return leadsList.filter(l => {
            const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = activeFilter === 'all' || l.temperature === activeFilter;
            return matchesSearch && matchesFilter;
        });
    }, [leadsList, searchTerm, activeFilter]);

    // Metrics Calculation
    const metrics = useMemo(() => {
        const totalValue = leadsList.reduce((sum, lead) => sum + (lead.estimatedValue || 0), 0);
        const activeLeads = leadsList.filter(l => l.pipelineStage !== 'won' && l.pipelineStage !== 'lost').length;
        const wonLeads = leadsList.filter(l => l.pipelineStage === 'won').length;
        const conversionRate = leadsList.length > 0 ? (wonLeads / leadsList.length) * 100 : 0;

        return { totalValue, activeLeads, conversionRate };
    }, [leadsList]);

    const handleConversionTrigger = (leadId: string) => {
        const lead = leadsList.find(l => l.id === leadId);
        if (!lead) return;

        setConversionModal({
            isOpen: true,
            leadId: leadId,
            token: null, // No token yet
            name: lead.name
        });
    };



    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                        Pipeline de Vendas
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                        Gerencie seus leads e aumente sua taxa de conversão.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-[#1E2A36] p-1 rounded-xl soft-shadow flex items-center border border-slate-100 dark:border-white/10">
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-slate-100 dark:bg-white/10 text-graphite-dark dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            title="Visualização Kanban"
                        >
                            <Kanban size={20} weight={viewMode === 'kanban' ? 'fill' : 'regular'} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-white/10 text-graphite-dark dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            title="Visualização em Lista"
                        >
                            <ListBullets size={20} weight={viewMode === 'list' ? 'fill' : 'regular'} />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="px-6 py-4 bg-graphite-dark dark:bg-amber-500 dark:text-white text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg shadow-slate-300 dark:shadow-none"
                    >
                        <Plus size={20} weight="bold" />
                        Novo Lead
                    </button>
                </div>
            </header>

            <PlansSetupAlert hasPlans={plansList.length > 0} />

            <SalesMetrics
                totalValue={metrics.totalValue}
                activeLeads={metrics.activeLeads}
                conversionRate={metrics.conversionRate}
            />

            {/* Smart Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-white dark:bg-[#1E2A36] p-1 rounded-2xl soft-shadow border border-slate-100 dark:border-white/10">
                    {['all', 'hot', 'warm', 'cold'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeFilter === filter
                                ? 'bg-graphite-dark dark:bg-amber-500/20 dark:text-amber-400 text-white shadow-lg dark:shadow-none border dark:border-amber-500/30'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
                                }`}
                        >
                            {filter === 'all' ? 'Todos' : filter === 'hot' ? '🔥 Quentes' : filter === 'warm' ? '☀️ Mornos' : '❄️ Frios'}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFinalized(!showFinalized)}
                        className={`px-4 py-3 rounded-2xl flex items-center gap-2 transition-all font-bold text-xs uppercase tracking-wider soft-shadow border ${showFinalized ? 'bg-graphite-dark dark:bg-white/10 dark:text-white text-white border-slate-800 dark:border-white/20 shadow-slate-200' : 'bg-white dark:bg-[#1E2A36] text-slate-400 dark:text-slate-500 border-slate-100 dark:border-white/10 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        title={showFinalized ? "Ocultar Finalizados" : "Mostrar Finalizados"}
                    >
                        {showFinalized ? <EyeSlash size={16} weight="bold" /> : <Eye size={16} weight="bold" />}
                        <span className="hidden md:inline">{showFinalized ? "Ocultar" : "Mostrar"} Fim</span>
                    </button>

                    <div className="flex-1 w-full md:w-auto md:min-w-[300px] bg-white dark:bg-[#1E2A36] px-4 py-3 rounded-2xl soft-shadow border border-slate-100 dark:border-white/10 flex items-center">
                        <MagnifyingGlass size={20} className="text-slate-400 dark:text-slate-500 mr-2" />
                        <input
                            type="text"
                            placeholder="Buscar lead por nome..."
                            className="bg-transparent outline-none text-sm font-medium text-slate-600 dark:text-slate-200 w-full placeholder:text-slate-300 dark:placeholder:text-slate-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {
                viewMode === 'kanban' ? (
                    <PipelineBoard
                        leads={filteredLeads}
                        onConvert={handleConversionTrigger}
                        onLeadClick={(lead) => setSelectedLead(lead)}
                        showFinalized={showFinalized}
                    />
                ) : (
                    <FunnelList
                        leads={filteredLeads}
                        onLeadClick={(lead) => setSelectedLead(lead)}
                    />
                )
            }

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
            />

            <LeadConversionModal
                isOpen={conversionModal.isOpen}
                onClose={() => setConversionModal(prev => ({ ...prev, isOpen: false }))}
                lead={conversionModal.leadId ? { id: conversionModal.leadId, name: conversionModal.name } : null}
                plans={plansList}
            />

            <LeadDetailsModal
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                lead={selectedLead}
            />
        </div >
    );
}

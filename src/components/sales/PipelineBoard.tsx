'use client';

import { useState, useEffect } from "react";
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import PipelineColumn from "./PipelineColumn";
import LeadCard from "./LeadCard";
import { updateLeadStage, convertLead } from "@/app/actions/leads";
import { assignFormToLeadOnStageChange } from "@/app/actions/lead-forms";
import confetti from "canvas-confetti";
import { CheckCircle, X } from "@phosphor-icons/react";

interface Lead {
    id: string;
    name: string;
    phone: string;
    pipelineStage: string | null;
    estimatedValue: number | null;
    closedValue: number | null;
    temperature: string | null;
    photoUrl?: string | null;
    socialHandle?: string | null;
    stageData?: Record<string, any> | null;
    createdAt?: Date | string | null;
    status?: string | null;
    studentId?: string | null;
}

const COLUMNS = [
    { id: "new", title: "Novos" },
    { id: "contacted", title: "Contato" },
    { id: "scheduled", title: "Agendado" },
    { id: "negotiation", title: "Negociação" },
    { id: "won", title: "Fechado" },
    { id: "lost", title: "Perdido" },
];

interface PipelineBoardProps {
    leads: Lead[];
    onConvert: (leadId: string) => void;
    onLeadClick: (lead: Lead) => void;
    showFinalized?: boolean;
}

export default function PipelineBoard({ leads: initialLeads, onConvert, onLeadClick, showFinalized = true }: PipelineBoardProps) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebratedLeadName, setCelebratedLeadName] = useState("");

    // Sync state with props when filters change
    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);
    
    const triggerConfetti = () => {
        console.log('🎊 Triggering confetti animation!');
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const leadId = active.id as string;
        const newStage = over.id as string;
        const currentLead = leads.find(l => l.id === leadId);
        
        console.log('🔄 Drag end:', { leadId, newStage, currentStage: currentLead?.pipelineStage });

        if (currentLead && currentLead.pipelineStage !== newStage) {
            // Optimistic Update (backend validates if converted leads can move)
            setLeads((prev) => prev.map(l =>
                l.id === leadId ? { ...l, pipelineStage: newStage } : l
            ));

            // Server Action
            try {
                await updateLeadStage(leadId, newStage);
                
                // Auto-assign questionnaires when moving to scheduled
                await assignFormToLeadOnStageChange(leadId, newStage);

                // Trigger conversion if dropped in 'won'
                if (newStage === 'won') {
                    console.log('🎉 Lead moved to won stage!', currentLead.name);
                    // Celebration animation!
                    triggerConfetti();
                    setCelebratedLeadName(currentLead.name);
                    setShowCelebration(true);
                    
                    // Wait a bit before opening conversion modal so confetti is visible
                    setTimeout(() => {
                        setShowCelebration(false);
                        onConvert(leadId);
                    }, 3000);
                }
            } catch (error) {
                console.error("Failed to update stage:", error);
                // Revert on failure
                setLeads((prev) => prev.map(l =>
                    l.id === leadId ? { ...l, pipelineStage: currentLead.pipelineStage } : l
                ));
            }
        }

        setActiveId(null);
    };

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

    const displayedColumns = showFinalized
        ? COLUMNS
        : COLUMNS.filter(col => !['won', 'lost'].includes(col.id));

    return (
        <DndContext
            id="pipeline-dnd-context"
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-3 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[600px] xl:grid xl:grid-cols-6 xl:content-start xl:overflow-hidden">
                {displayedColumns.map((col) => (
                    <PipelineColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        leads={leads.filter(l => (l.pipelineStage || 'new') === col.id)}
                        totalValue={leads
                            .filter(l => (l.pipelineStage || 'new') === col.id)
                            .reduce((sum, l) => {
                                // Use closedValue for won/lost, estimatedValue for other stages
                                const value = ['won', 'lost'].includes(col.id) 
                                    ? (l.closedValue || 0) 
                                    : (l.estimatedValue || 0);
                                return sum + value;
                            }, 0)
                        }
                    >
                        {leads
                            .filter(l => (l.pipelineStage || 'new') === col.id)
                            .map((lead) => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    onClick={() => onLeadClick(lead)}
                                />
                            ))}
                    </PipelineColumn>
                ))}
            </div>

            <DragOverlay>
                {activeLead ? <LeadCard lead={activeLead} /> : null}
            </DragOverlay>
            
            {/* Celebration Toast */}
            {showCelebration && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] animate-in slide-in-from-top duration-500">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-4 max-w-md">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                                <CheckCircle size={32} weight="fill" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">🎉 Parabéns!</h3>
                            <p className="text-sm font-medium opacity-90">
                                Você fechou mais um aluno: <span className="font-bold">{celebratedLeadName}</span>!
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCelebration(false)}
                            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={20} weight="bold" />
                        </button>
                    </div>
                </div>
            )}
        </DndContext>
    );
}

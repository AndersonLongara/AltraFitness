'use client';

import { useState, useEffect } from "react";
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import PipelineColumn from "./PipelineColumn";
import LeadCard from "./LeadCard";
import { updateLeadStage, convertLead } from "@/app/actions/leads";

interface Lead {
    id: string;
    name: string;
    phone: string;
    pipelineStage: string | null;
    estimatedValue: number | null;
    temperature: string | null;
    photoUrl?: string | null;
    socialHandle?: string | null;
    stageData?: Record<string, any> | null;
    createdAt?: Date | string | null;
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

    // Sync state with props when filters change
    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

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

        if (currentLead && currentLead.pipelineStage !== newStage) {
            // Optimistic Update
            setLeads((prev) => prev.map(l =>
                l.id === leadId ? { ...l, pipelineStage: newStage } : l
            ));

            // Server Action
            try {
                await updateLeadStage(leadId, newStage);

                // Trigger conversion if dropped in 'won'
                if (newStage === 'won') {
                    onConvert(leadId);
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
                            .reduce((sum, l) => sum + (l.estimatedValue || 0), 0)
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
        </DndContext>
    );
}

'use client';

import { useDraggable } from "@dnd-kit/core";
import { User, WhatsappLogo, TrendUp, DotsSixVertical, InstagramLogo, CalendarBlank, Phone } from "@phosphor-icons/react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Lead {
    id: string;
    name: string;
    phone: string;
    pipelineStage: string | null;
    estimatedValue: number | null;
    temperature: string | null;
    photoUrl?: string | null;
    socialHandle?: string | null;
    createdAt?: Date | string | null; // Added createdAt
}

interface LeadCardProps {
    lead: Lead;
    onClick?: (lead: Lead) => void;
}

export default function LeadCard({ lead, onClick }: LeadCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: lead.id,
        data: lead,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    // Calculate Lead Age
    const leadAge = lead.createdAt
        ? formatDistanceToNow(new Date(lead.createdAt), { locale: ptBR, addSuffix: false })
        : 'Recente';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={() => !isDragging && onClick?.(lead)}
            className={`
                bg-white p-4 rounded-[20px] border border-slate-100 relative overflow-hidden group touch-none select-none transition-all duration-300
                ${isDragging ? 'opacity-90 z-50 shadow-2xl rotate-2 scale-105 cursor-grabbing' : 'hover:-translate-y-1 hover:shadow-xl hover:border-slate-200 cursor-grab'}
            `}
        >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            {lead.photoUrl ? (
                                <Image
                                    src={lead.photoUrl}
                                    alt={lead.name}
                                    width={42}
                                    height={42}
                                    className="rounded-full object-cover border-2 border-white shadow-sm"
                                />
                            ) : (
                                <div className="w-[42px] h-[42px] rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-sm">
                                    <User weight="bold" size={20} />
                                </div>
                            )}

                            {/* Social Indicator */}
                            {lead.socialHandle && (
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                                    <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full p-[3px]">
                                        <InstagramLogo size={8} weight="bold" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                                {lead.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-1">
                                {lead.temperature === 'hot' && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-rose-100">
                                        <TrendUp weight="fill" size={10} /> Quente
                                    </span>
                                )}
                                {lead.temperature === 'warm' && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-100">
                                        <TrendUp weight="fill" size={10} /> Morno
                                    </span>
                                )}
                                {lead.temperature === 'cold' && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-100">
                                        <TrendUp weight="fill" size={10} /> Frio
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="text-slate-300 group-hover:text-slate-400 transition-colors cursor-grab active:cursor-grabbing">
                        <DotsSixVertical size={24} />
                    </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-4 mb-4 px-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <CalendarBlank size={14} weight="bold" />
                        <span>{leadAge}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        <Phone size={14} weight="bold" />
                        <span>{lead.phone.slice(-4)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valor Estimado</span>
                        <span className="text-sm font-black text-slate-700">
                            R$ {lead.estimatedValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                        </span>
                    </div>

                    <button
                        className="h-9 w-9 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-emerald-200"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá ${lead.name}`, '_blank');
                        }}
                        title="Iniciar coversa no WhatsApp"
                    >
                        <WhatsappLogo size={18} weight="fill" />
                    </button>
                </div>
            </div>
        </div>
    );
}

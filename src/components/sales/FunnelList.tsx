'use client';

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, WhatsappLogo, TrendUp, Clock, Funnel, InstagramLogo } from "@phosphor-icons/react";
import Image from "next/image";

interface Lead {
    id: string;
    name: string;
    phone: string;
    pipelineStage: string | null;
    estimatedValue: number | null;
    temperature: string | null;
    lastContactAt: Date | null;
    createdAt: Date | null;
    photoUrl?: string | null;
    socialHandle?: string | null;
    stageData?: Record<string, any> | null;
}

const stageLabels: Record<string, string> = {
    new: "Novo Lead",
    contacted: "Primeiro Contato",
    scheduled: "Avaliação Agendada",
    negotiation: "Negociação",
    won: "Fechado",
    lost: "Perdido"
};

const stageColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-indigo-100 text-indigo-700",
    scheduled: "bg-purple-100 text-purple-700",
    negotiation: "bg-amber-100 text-amber-700",
    won: "bg-emerald-100 text-emerald-700",
    lost: "bg-slate-100 text-slate-500",
};

export default function FunnelList({ leads, onLeadClick }: { leads: Lead[]; onLeadClick: (lead: Lead) => void }) {
    if (leads.length === 0) {
        return (
            <div className="p-12 text-center text-slate-400 bg-pure-white rounded-[24px] border border-slate-50">
                <Funnel size={48} weight="duotone" className="mx-auto mb-4 opacity-50" />
                <p className="font-bold">Seu funil está vazio.</p>
                <p className="text-sm mt-2">Adicione leads para começar a negociar.</p>
            </div>
        );
    }

    return (
        <div className="bg-pure-white rounded-[24px] border border-slate-50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Lead</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Estágio</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Valor Est.</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Temp.</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Último Contato</th>
                            <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest leading-none text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {leads.map((lead) => (
                            <tr
                                key={lead.id}
                                onClick={() => onLeadClick(lead)}
                                className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                            >
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative shrink-0">
                                            {lead.photoUrl ? (
                                                <Image
                                                    src={lead.photoUrl}
                                                    alt={lead.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full object-cover border border-slate-100"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-50">
                                                    <User size={20} weight="fill" />
                                                </div>
                                            )}

                                            {lead.socialHandle && (
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-50">
                                                    <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white rounded-full p-0.5">
                                                        <InstagramLogo size={10} weight="bold" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm group-hover:text-graphite-dark transition-colors">{lead.name}</p>
                                            <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                                                <WhatsappLogo size={12} weight="fill" className="text-emerald-500" />
                                                {lead.phone}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${stageColors[lead.pipelineStage || 'new']}`}>
                                        {stageLabels[lead.pipelineStage || 'new']}
                                    </span>
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-1 text-slate-600 font-bold text-sm">
                                        <span className="text-xs text-slate-400">R$</span>
                                        {lead.estimatedValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                                    </div>
                                </td>
                                <td className="px-8 py-4">
                                    {lead.temperature === 'hot' && <span className="text-rose-500 font-bold text-xs flex items-center gap-1"><TrendUp weight="bold" /> Quente</span>}
                                    {lead.temperature === 'warm' && <span className="text-amber-500 font-bold text-xs flex items-center gap-1"><TrendUp weight="bold" /> Morno</span>}
                                    {lead.temperature === 'cold' && <span className="text-blue-400 font-bold text-xs flex items-center gap-1"><TrendUp weight="bold" /> Frio</span>}
                                    {!lead.temperature && <span className="text-slate-300 font-bold text-xs">-</span>}
                                </td>
                                <td className="px-8 py-4">
                                    <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                        <Clock size={14} weight="duotone" />
                                        {lead.lastContactAt
                                            ? formatDistanceToNow(new Date(lead.lastContactAt), { addSuffix: true, locale: ptBR })
                                            : 'Nunca'
                                        }
                                    </div>
                                </td>
                                <td className="px-8 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá ${lead.name}`, '_blank');
                                        }}
                                        className="text-slate-400 hover:text-performance-green transition-colors p-2 rounded-lg hover:bg-emerald-50"
                                    >
                                        <WhatsappLogo size={20} weight="fill" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

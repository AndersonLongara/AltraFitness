'use client';

import { useState } from "react";
import { User, Check, Spinner, WhatsappLogo } from "@phosphor-icons/react";
import { convertLead } from "@/app/actions/leads";
import ConversionModal from "@/components/sales/ConversionModal";

interface Lead {
    id: string;
    name: string;
    phone: string;
    status: string | null;
    createdAt: Date | null;
}

export default function LeadsList({ leads }: { leads: Lead[] }) {
    const [convertingId, setConvertingId] = useState<string | null>(null);
    const [modalData, setModalData] = useState<{ isOpen: boolean; token: string; name: string }>({
        isOpen: false,
        token: "",
        name: ""
    });

    const handleConvert = async (lead: Lead) => {
        setConvertingId(lead.id);
        try {
            const token = await convertLead(lead.id);
            if (token) {
                setModalData({
                    isOpen: true,
                    token: token,
                    name: lead.name
                });
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao converter lead.");
        } finally {
            setConvertingId(null);
        }
    };

    if (leads.length === 0) {
        return (
            <div className="p-12 text-center text-slate-400 bg-pure-white rounded-3xl soft-shadow border border-slate-50">
                <p>Nenhum lead encontrado.</p>
                <p className="text-sm mt-2">Adicione prospectos para começar seu funil.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {leads.map((lead) => (
                    <div key={lead.id} className="bg-pure-white p-6 rounded-3xl soft-shadow border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-performance-green transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                                <User size={24} weight="duotone" />
                            </div>
                            <div>
                                <h3 className="font-bold text-graphite-dark text-lg">{lead.name}</h3>
                                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                                    <WhatsappLogo size={16} weight="fill" className="text-emerald-500" />
                                    {lead.phone}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${lead.status === 'converted' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                {lead.status === 'converted' ? 'Matriculado' : 'Novo Lead'}
                            </span>

                            {lead.status !== 'converted' && (
                                <button
                                    onClick={() => handleConvert(lead)}
                                    disabled={convertingId === lead.id}
                                    className="px-4 py-2 bg-performance-green text-graphite-dark font-bold rounded-xl shadow-lg shadow-emerald-200 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
                                >
                                    {convertingId === lead.id ? (
                                        <Spinner size={16} className="animate-spin" />
                                    ) : (
                                        <Check size={16} weight="bold" />
                                    )}
                                    Converter
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ConversionModal
                isOpen={modalData.isOpen}
                onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
                inviteToken={modalData.token}
                studentName={modalData.name}
            />
        </>
    );
}

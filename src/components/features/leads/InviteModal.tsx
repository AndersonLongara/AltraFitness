'use client';

import { useState } from "react";
import Image from "next/image";
import { X, Check, InstagramLogo, User } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { createLead, enrichInstagramProfile } from "@/app/actions/leads";

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [socialHandle, setSocialHandle] = useState("");
    const [isPending, setIsPending] = useState(false);

    // Enrichment State
    const [isEnriching, setIsEnriching] = useState(false);
    const [enrichmentData, setEnrichmentData] = useState<{ name: string; photoUrl: string; bio: string } | null>(null);

    const handleEnrichment = async () => {
        if (!socialHandle || socialHandle.length < 3) return;

        setIsEnriching(true);
        setEnrichmentData(null);

        try {
            const data = await enrichInstagramProfile(socialHandle);
            if (data) {
                setEnrichmentData(data);
                if (!name) setName(data.name || ""); // Auto-fill name if empty, ensure string
            }
        } catch (error) {
            console.error("Enrichment failed", error);
        } finally {
            setIsEnriching(false);
        }
    };

    const handleSubmit = async () => {
        if (!name) return;

        setIsPending(true);
        try {
            await createLead({
                name,
                phone,
                socialHandle,
                photoUrl: enrichmentData?.photoUrl
            });
            onClose();
            // Reset form
            setName("");
            setPhone("");
            setSocialHandle("");
            setEnrichmentData(null);
        } catch (error) {
            console.error("Failed to create lead", error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-ice-white rounded-[32px] p-2 shadow-2xl z-50 animate-scale-in outline-none">
                    <Dialog.Title className="sr-only">Cadastrar Novo Lead</Dialog.Title>
                    <div className="bg-pure-white rounded-[24px] p-6 md:p-8">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-graphite-dark tracking-tight">Novo Lead</h2>
                                <p className="text-slate-400 font-medium text-sm">Adicione um prospecto ao seu funil.</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={24} weight="bold" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Instagram Input with Enrichment */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Instagram (Opcional)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <InstagramLogo size={24} weight="duotone" />
                                    </span>
                                    <input
                                        type="text"
                                        value={socialHandle}
                                        onChange={e => setSocialHandle(e.target.value)}
                                        onBlur={handleEnrichment}
                                        className="w-full p-4 pl-12 bg-slate-50 rounded-[12px] font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 transition-all border border-transparent focus:border-emerald-200 placeholder:text-slate-300"
                                        placeholder="@seu.perfil"
                                    />
                                    {isEnriching && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 border-2 border-slate-200 border-t-performance-green rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Enrichment Result / Skeleton */}
                                {(isEnriching || enrichmentData) && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-[16px] flex items-center gap-3 animate-fade-in border border-slate-100">
                                        {isEnriching ? (
                                            <>
                                                <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                                                    <div className="h-3 w-1/2 bg-slate-200 rounded animate-pulse" />
                                                </div>
                                            </>
                                        ) : enrichmentData ? (
                                            <>
                                                <div className="relative">
                                                    <Image
                                                        src={enrichmentData.photoUrl}
                                                        alt={enrichmentData.name}
                                                        width={48}
                                                        height={48}
                                                        className="rounded-full border-[2px] border-performance-green object-cover"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 bg-performance-green text-white p-0.5 rounded-full border-2 border-white">
                                                        <Check size={10} weight="bold" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-graphite-dark">{enrichmentData.name}</p>
                                                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{enrichmentData.bio}</p>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <User size={24} weight="duotone" />
                                    </span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full p-4 pl-12 bg-slate-50 rounded-[12px] font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 transition-all border border-transparent focus:border-emerald-200 placeholder:text-slate-300"
                                        placeholder="Ex: Ana Silva"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full p-4 bg-slate-50 rounded-[12px] font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 transition-all border border-transparent focus:border-emerald-200 placeholder:text-slate-300"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!name || isPending}
                                    className="flex-1 py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isPending ? 'Criando...' : 'Adicionar Lead'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

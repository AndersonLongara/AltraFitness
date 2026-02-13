'use client';

import { useState, useEffect } from "react";
import { X, Check, Copy, WhatsappLogo } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";

interface ConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    inviteToken: string | null; // Null if not yet converted
    studentName: string;
    onConfirmConversion: (types: string[]) => Promise<void>; // Function to actually convert
}

export default function ConversionModal({ isOpen, onClose, inviteToken, studentName, onConfirmConversion }: ConversionModalProps) {
    const [step, setStep] = useState<'access' | 'success'>('access');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [origin, setOrigin] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setOrigin(window.location.origin);
        if (inviteToken) {
            setStep('success'); // If token exists, we are already converted
        } else {
            setStep('access'); // otherwise, start at access selection
        }
    }, [inviteToken, isOpen]);

    const toggleType = (type: 'workout' | 'nutrition') => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleConfirm = async () => {
        setIsConverting(true);
        try {
            await onConfirmConversion(selectedTypes);
            // Parent should update inviteToken, triggering effect to switch to success?
            // Or parent will re-render this modal with token.
        } catch (error) {
            console.error(error);
        } finally {
            setIsConverting(false);
        }
    };

    const inviteLink = `${origin}/join/${inviteToken}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWhatsapp = () => {
        const message = `Olá ${studentName}! Aqui está o seu link de acesso ao AltraHub: ${inviteLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-ice-white rounded-[32px] p-2 shadow-2xl z-50 animate-scale-in outline-none">
                    <Dialog.Title className="sr-only">Converter Lead</Dialog.Title>

                    {step === 'access' ? (
                        <div className="bg-pure-white rounded-[24px] p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-graphite-dark tracking-tight">Confirmar Venda</h2>
                                    <p className="text-slate-400 font-medium text-sm">O que <strong>{studentName}</strong> contratou?</p>
                                </div>
                                <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                                    <X size={24} weight="bold" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => toggleType('workout')}
                                    className={`w-full p-4 rounded-2xl text-left transition-all border-2 group relative overflow-hidden ${selectedTypes.includes('workout') ? 'border-performance-green bg-emerald-50/50' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}
                                >
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div>
                                            <h3 className={`font-bold ${selectedTypes.includes('workout') ? 'text-emerald-700' : 'text-slate-600'}`}>Treinos</h3>
                                            <p className="text-xs text-slate-400 font-medium">Prescrições</p>
                                        </div>
                                        {selectedTypes.includes('workout') && <Check size={20} weight="bold" className="text-performance-green" />}
                                    </div>
                                </button>

                                <button
                                    onClick={() => toggleType('nutrition')}
                                    className={`w-full p-4 rounded-2xl text-left transition-all border-2 group relative overflow-hidden ${selectedTypes.includes('nutrition') ? 'border-performance-green bg-emerald-50/50' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}
                                >
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div>
                                            <h3 className={`font-bold ${selectedTypes.includes('nutrition') ? 'text-emerald-700' : 'text-slate-600'}`}>Nutrição</h3>
                                            <p className="text-xs text-slate-400 font-medium">Dietas</p>
                                        </div>
                                        {selectedTypes.includes('nutrition') && <Check size={20} weight="bold" className="text-performance-green" />}
                                    </div>
                                </button>

                                <button
                                    onClick={handleConfirm}
                                    disabled={selectedTypes.length === 0 || isConverting}
                                    className="w-full py-4 mt-4 bg-graphite-dark text-white font-bold rounded-2xl shadow-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {isConverting ? 'Processando...' : 'Gerar Acesso'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-pure-white rounded-[24px] p-6 md:p-8 text-center">
                            <div className="w-16 h-16 bg-emerald-50 text-performance-green rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={32} weight="bold" />
                            </div>

                            <h2 className="text-2xl font-bold text-graphite-dark tracking-tight mb-2">Venda Realizada!</h2>
                            <p className="text-slate-500 font-medium text-sm mb-6">
                                O aluno <strong className="text-slate-700">{studentName}</strong> foi matriculado.
                            </p>

                            <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 mb-6 border border-slate-100">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1 text-left">Link de Convite</p>
                                    <p className="text-sm font-medium text-slate-600 truncate text-left">{inviteLink}</p>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-slate-400 hover:text-performance-green hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Copiar"
                                >
                                    {copied ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleWhatsapp}
                                    className="w-full py-4 bg-[#25D366] text-white font-bold rounded-2xl shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <WhatsappLogo size={24} weight="fill" />
                                    Enviar no WhatsApp
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

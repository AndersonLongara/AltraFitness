"use client";

import { X, LinkSimple, CheckCircle, Calendar, Copy, WhatsappLogo, Check } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { createStudentWithInvite } from "@/app/actions/students";

interface Plan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    active?: boolean;
}

interface StudentInviteFormProps {
    isOpen: boolean;
    onClose: () => void;
    plans: Plan[];
}

export default function StudentInviteForm({ isOpen, onClose, plans }: StudentInviteFormProps) {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [copied, setCopied] = useState(false);

    const activePlans = plans.filter(p => p.active !== false);
    const selectedPlan = activePlans.find(p => p.id === selectedPlanId);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setName("");
            setEmail("");
            setPhone("");
            setSelectedPlanId("");
            setStartDate(new Date().toISOString().split('T')[0]);
            setInviteLink("");
            setCopied(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlanId || !name) return;

        setIsSubmitting(true);
        try {
            const result = await createStudentWithInvite({
                name,
                planId: selectedPlanId,
                startDate,
                email: email || undefined,
                phone: phone || undefined,
            });
            setInviteLink(result.inviteLink);
            setStep('success');
        } catch (error: any) {
            alert(error.message || "Erro ao criar convite.");
            console.error("Failed to create invite:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const input = document.createElement('input');
            input.value = inviteLink;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWhatsApp = () => {
        const message = encodeURIComponent(
            `Olá ${name}! 🏋️\n\nVocê foi convidado(a) para se cadastrar na plataforma. Acesse o link abaixo para completar seu cadastro:\n\n${inviteLink}`
        );
        const whatsappUrl = phone
            ? `https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`
            : `https://wa.me/?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-dark/60 dark:bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-pure-white dark:bg-[#1E2A36] w-full max-w-lg rounded-3xl soft-shadow overflow-hidden my-auto border border-slate-100 dark:border-white/10">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#1E2A36] sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-graphite-dark dark:text-white">
                            {step === 'form' ? 'Enviar Link de Convite' : 'Convite Criado!'}
                        </h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                            {step === 'form'
                                ? 'O aluno preencherá seus dados ao acessar o link'
                                : 'Compartilhe o link com seu aluno'
                            }
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 dark:hover:text-white hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} weight="bold" />
                    </button>
                </div>

                {step === 'form' ? (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome do Aluno</label>
                            <input
                                autoFocus
                                type="text"
                                required
                                className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                placeholder="Ex: João da Silva"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        {/* Optional contact info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Telefone (Opcional)</label>
                                <input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email (Opcional)</label>
                                <input
                                    type="email"
                                    placeholder="email@exemplo.com"
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Plan Selection */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Plano Contratado *</label>
                            {activePlans.length === 0 ? (
                                <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 text-sm font-medium border border-amber-100 dark:border-amber-500/30">
                                    Nenhum plano cadastrado. Crie planos na aba <strong>Financeiro</strong>.
                                </div>
                            ) : (
                                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
                                    {activePlans.map(plan => (
                                        <label
                                            key={plan.id}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group
                                                ${selectedPlanId === plan.id
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/50 ring-1 ring-emerald-400 dark:ring-emerald-500'
                                                    : 'bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="invitePlan"
                                                    value={plan.id}
                                                    checked={selectedPlanId === plan.id}
                                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                                    className="hidden"
                                                />
                                                <div>
                                                    <div className="font-bold text-graphite-dark dark:text-white">{plan.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                        {plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    {(plan.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </div>
                                                {selectedPlanId === plan.id && (
                                                    <CheckCircle size={20} weight="fill" className="text-emerald-500" />
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Start Date */}
                        {selectedPlanId && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Início da Vigência</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                                        <Calendar size={20} weight="duotone" />
                                    </span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-4 pl-12 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 border border-transparent dark:border-white/10"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        {selectedPlan && (
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-white/10">
                                <div className="text-xs font-bold text-slate-400 uppercase">Valor do Plano</div>
                                <div className="text-xl font-extrabold text-graphite-dark dark:text-white">
                                    {(selectedPlan.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                            </div>
                        )}

                        <div className="pt-4 flex justify-end gap-4 border-t border-slate-100 dark:border-white/10 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedPlanId || !name || isSubmitting}
                                className="px-6 py-4 bg-performance-green dark:bg-emerald-500 text-graphite-dark dark:text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <LinkSimple size={20} weight="bold" />
                                {isSubmitting ? 'Gerando...' : 'Gerar Link'}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Success Step - Show invite link */
                    <div className="p-6 space-y-6">
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={40} weight="fill" className="text-emerald-500" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 font-medium">
                                O aluno <strong className="text-graphite-dark dark:text-white">{name}</strong> foi pré-cadastrado com o plano <strong className="text-emerald-600 dark:text-emerald-400">{selectedPlan?.name}</strong>.
                            </p>
                            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                                Envie o link abaixo para que ele complete o cadastro com seus dados pessoais.
                            </p>
                        </div>

                        {/* Invite Link */}
                        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/10">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Link de Convite</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={inviteLink}
                                    className="flex-1 p-3 bg-white dark:bg-white/10 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 outline-none"
                                />
                                <button
                                    onClick={handleCopy}
                                    className={`p-3 rounded-xl transition-all font-bold text-sm flex items-center gap-2 ${
                                        copied
                                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20'
                                    }`}
                                >
                                    {copied ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}
                                </button>
                            </div>
                        </div>

                        {/* Share buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleWhatsApp}
                                className="flex-1 py-4 bg-[#25D366] text-white font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200 dark:shadow-none"
                            >
                                <WhatsappLogo size={22} weight="fill" />
                                Enviar via WhatsApp
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                            <button
                                onClick={onClose}
                                className="w-full py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

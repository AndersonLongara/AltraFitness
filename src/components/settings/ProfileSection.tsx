"use client";

import { useState, useTransition } from "react";
import { PencilSimple, Check, X, Envelope, CalendarBlank, IdentificationCard, Phone, UsersFour, WifiHigh, Copy, Users } from "@phosphor-icons/react";
import type { TrainerProfile } from "@/app/actions/settings";
import { updateTrainerProfile } from "@/app/actions/settings";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileSectionProps {
    profile: TrainerProfile;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(profile.name);
    const [isPending, startTransition] = useTransition();
    const [codeCopied, setCodeCopied] = useState(false);

    function handleCopyCode() {
        if (profile.teamCode) {
            navigator.clipboard.writeText(profile.teamCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    }

    function handleSave() {
        startTransition(async () => {
            await updateTrainerProfile({ name });
            setIsEditing(false);
        });
    }

    function handleCancel() {
        setName(profile.name);
        setIsEditing(false);
    }

    return (
        <div className="space-y-8">
            {/* Profile Header Card */}
            <div className="bg-white rounded-[32px] p-8 soft-shadow border border-slate-100">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100">
                            {profile.imageUrl ? (
                                <img
                                    src={profile.imageUrl}
                                    alt={profile.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-performance-green/10 flex items-center justify-center">
                                    <span className="text-3xl font-black text-performance-green">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-performance-green rounded-full border-2 border-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-2xl font-extrabold text-graphite-dark bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-performance-green/50 focus:border-performance-green"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSave}
                                    disabled={isPending}
                                    className="p-2 bg-performance-green text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                >
                                    <Check size={20} weight="bold" />
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    <X size={20} weight="bold" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-extrabold text-graphite-dark">
                                    {profile.name}
                                </h2>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 text-slate-400 hover:text-performance-green hover:bg-slate-50 rounded-lg transition-all"
                                >
                                    <PencilSimple size={18} weight="duotone" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 text-slate-500">
                            <Envelope size={16} weight="duotone" />
                            <span className="text-sm font-medium">{profile.email}</span>
                        </div>

                        {profile.createdAt && (
                            <div className="flex items-center gap-2 mt-1 text-slate-400">
                                <CalendarBlank size={16} weight="duotone" />
                                <span className="text-xs font-medium">
                                    Membro desde {format(profile.createdAt, "MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Info */}
                <div className="bg-white rounded-[24px] p-6 soft-shadow border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                        Informações da Conta
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400">Nome</label>
                            <p className="text-base font-bold text-graphite-dark">{profile.name}</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400">E-mail</label>
                            <p className="text-base font-bold text-graphite-dark">{profile.email}</p>
                        </div>
                        {profile.cpf && (
                            <div>
                                <label className="text-xs font-semibold text-slate-400">CPF</label>
                                <p className="text-base font-bold text-graphite-dark">{profile.cpf}</p>
                            </div>
                        )}
                        {profile.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={14} weight="duotone" className="text-slate-400" />
                                <div>
                                    <label className="text-xs font-semibold text-slate-400">Telefone</label>
                                    <p className="text-sm font-bold text-graphite-dark">{profile.phone}</p>
                                </div>
                            </div>
                        )}
                        {profile.birthDate && (
                            <div>
                                <label className="text-xs font-semibold text-slate-400">Data de Nascimento</label>
                                <p className="text-sm font-bold text-graphite-dark">
                                    {format(profile.birthDate, "dd/MM/yyyy")}
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-semibold text-slate-400">ID do Trainer</label>
                            <p className="text-xs font-mono text-slate-400 mt-0.5">{profile.id}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Team Code */}
                    {profile.teamCode && (
                        <div className="bg-graphite-dark rounded-[24px] p-6 soft-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                                    Código do Time
                                </h3>
                                <Users size={20} weight="duotone" className="text-slate-500" />
                            </div>
                            <p className="text-xs text-slate-400 font-medium mb-4">
                                Compartilhe este código com seus alunos para que eles entrem no seu time pelo app.
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center">
                                    <span className="text-2xl font-black text-white tracking-[0.3em]">
                                        {profile.teamCode}
                                    </span>
                                </div>
                                <button
                                    onClick={handleCopyCode}
                                    className="p-3 bg-performance-green/10 text-performance-green rounded-xl hover:bg-performance-green/20 transition-colors"
                                    title="Copiar código"
                                >
                                    {codeCopied ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}
                                </button>
                            </div>
                            {codeCopied && (
                                <p className="text-xs text-performance-green font-semibold mt-2 text-center">
                                    Código copiado!
                                </p>
                            )}
                        </div>
                    )}

                    {/* Student Counts */}
                    <div className="bg-white rounded-[24px] p-6 soft-shadow border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Alunos Informados
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4 text-center">
                                <UsersFour size={24} weight="duotone" className="text-performance-green mx-auto mb-2" />
                                <p className="text-2xl font-extrabold text-graphite-dark">{profile.presentialStudents}</p>
                                <p className="text-xs font-semibold text-slate-400">Presenciais</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 text-center">
                                <WifiHigh size={24} weight="duotone" className="text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-extrabold text-graphite-dark">{profile.onlineStudents}</p>
                                <p className="text-xs font-semibold text-slate-400">Online</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Quick View */}
                    <div className="bg-white rounded-[24px] p-6 soft-shadow border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Plano Atual
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    profile.subscriptionPlan === "free_5" || profile.subscriptionPlan === "free"
                                        ? "bg-slate-100"
                                        : profile.subscriptionPlan === "free_trial"
                                            ? "bg-purple-50"
                                            : profile.subscriptionPlan === "annual"
                                                ? "bg-amber-50"
                                                : "bg-emerald-50"
                                }`}>
                                    <IdentificationCard
                                        size={22}
                                        weight="duotone"
                                        className={
                                            profile.subscriptionPlan === "free_5" || profile.subscriptionPlan === "free"
                                                ? "text-slate-500"
                                                : profile.subscriptionPlan === "free_trial"
                                                    ? "text-purple-500"
                                                    : profile.subscriptionPlan === "annual"
                                                        ? "text-amber-500"
                                                        : "text-performance-green"
                                        }
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-graphite-dark">
                                        {profile.subscriptionPlan === "free_5" || profile.subscriptionPlan === "free"
                                            ? "Free Starter"
                                            : profile.subscriptionPlan === "free_trial"
                                                ? "Free Trial Pro"
                                                : profile.subscriptionPlan === "monthly"
                                                    ? "Mensal"
                                                    : "Anual"}
                                    </p>
                                    <p className="text-xs font-medium text-slate-400">
                                        Status: <span className={
                                            profile.subscriptionStatus === "active" || profile.subscriptionStatus === "trial"
                                                ? "text-performance-green"
                                                : "text-red-500"
                                        }>
                                            {profile.subscriptionStatus === "active" ? "Ativo" : profile.subscriptionStatus === "trial" ? "Trial" : "Inativo"}
                                        </span>
                                    </p>
                                    {profile.trialEndsAt && (
                                        <p className="text-xs font-medium text-purple-500 mt-0.5">
                                            Trial expira em {format(profile.trialEndsAt, "dd/MM/yyyy")}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

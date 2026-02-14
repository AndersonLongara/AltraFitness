"use client";

import { useState, useTransition } from "react";
import { Check, Lightning, Crown, Star, ArrowRight, SpinnerGap, Rocket, Timer } from "@phosphor-icons/react";
import type { SubscriptionInfo, UsageStats } from "@/app/actions/settings";
import { changeSubscriptionPlan } from "@/app/actions/settings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SubscriptionSectionProps {
    subscription: SubscriptionInfo;
    usage: UsageStats;
}

const planCards = [
    {
        id: "free_5" as const,
        name: "Free Starter",
        price: "R$ 0",
        period: "/mês",
        badge: "PARA SEMPRE",
        highlight: false,
        color: "slate",
        features: [
            { text: "Até 5 alunos", included: true },
            { text: "Dashboard Básico", included: true },
            { text: "Gestão de treinos", included: true },
            { text: "IA Manager", included: false },
            { text: "Suporte prioritário", included: false },
        ],
    },
    {
        id: "free_trial" as const,
        name: "Free Trial Pro",
        price: "R$ 0",
        period: "/30 dias",
        badge: "30 DIAS GRÁTIS",
        highlight: false,
        color: "purple",
        features: [
            { text: "Alunos Ilimitados", included: true },
            { text: "IA Manager Completo", included: true },
            { text: "Todos recursos desbloqueados", included: true },
            { text: "Válido por 30 dias", included: true },
        ],
    },
    {
        id: "monthly" as const,
        name: "Mensal",
        price: "R$ 109,90",
        period: "/mês",
        extra: "+ R$ 1,99 por aluno/mês",
        badge: "RECOMENDADO",
        highlight: true,
        color: "green",
        features: [
            { text: "Alunos Ilimitados", included: true },
            { text: "IA Manager Completo", included: true },
            { text: "Criação de treinos com IA", included: true },
            { text: "Relatórios avançados", included: true },
            { text: "Suporte padrão", included: true },
        ],
    },
    {
        id: "annual" as const,
        name: "Anual",
        price: "R$ 959,90",
        period: "/ano",
        extra: "+ R$ 1,99 por aluno/mês",
        badge: "ECONOMIZE 27%",
        highlight: false,
        color: "gold",
        features: [
            { text: "Todos recursos do Mensal", included: true },
            { text: "Prioridade no Suporte", included: true },
            { text: "Badge Pro Trainer", included: true },
            { text: "Economia de 27%", included: true },
        ],
    },
];

export default function SubscriptionSection({ subscription, usage }: SubscriptionSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [changingTo, setChangingTo] = useState<string | null>(null);

    function handleChangePlan(planId: "free_5" | "free_trial" | "monthly" | "annual") {
        if (planId === subscription.plan) return;
        setChangingTo(planId);
        startTransition(async () => {
            await changeSubscriptionPlan(planId);
            setChangingTo(null);
        });
    }

    const usagePercent = subscription.limits.maxStudents
        ? Math.min((usage.totalStudents / subscription.limits.maxStudents) * 100, 100)
        : null;

    const isFree = subscription.plan === "free_5";

    return (
        <div className="space-y-8">
            {/* Trial Banner */}
            {subscription.plan === "free_trial" && subscription.trialEndsAt && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
                    <Timer size={24} weight="duotone" className="text-purple-600 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-purple-800">
                            Você está no período de teste gratuito
                        </p>
                        <p className="text-xs text-purple-600 font-medium">
                            Seu trial expira em {format(subscription.trialEndsAt, "dd/MM/yyyy")}. Assine para continuar com todos os recursos.
                        </p>
                    </div>
                </div>
            )}

            {/* Current Plan Summary */}
            <div className="bg-white rounded-[32px] p-8 soft-shadow border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center",
                            subscription.plan === "annual"
                                ? "bg-gradient-to-br from-amber-400 to-amber-500"
                                : subscription.plan === "monthly"
                                    ? "bg-gradient-to-br from-performance-green to-emerald-600"
                                    : subscription.plan === "free_trial"
                                        ? "bg-gradient-to-br from-purple-500 to-purple-600"
                                        : "bg-gradient-to-br from-slate-400 to-slate-500"
                        )}>
                            {subscription.plan === "annual" ? (
                                <Crown size={28} weight="fill" className="text-white" />
                            ) : subscription.plan === "monthly" ? (
                                <Lightning size={28} weight="fill" className="text-white" />
                            ) : subscription.plan === "free_trial" ? (
                                <Rocket size={28} weight="fill" className="text-white" />
                            ) : (
                                <Star size={28} weight="fill" className="text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-graphite-dark">
                                Plano {subscription.displayName}
                            </h2>
                            <p className="text-sm font-medium text-slate-400">
                                {subscription.price} · Status: {" "}
                                <span className={cn(
                                    "font-bold",
                                    subscription.status === "active" ? "text-performance-green" : subscription.status === "trial" ? "text-purple-500" : "text-red-500"
                                )}>
                                    {subscription.status === "active" ? "Ativo" : subscription.status === "trial" ? "Trial" : "Inativo"}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-extrabold text-graphite-dark">{usage.totalStudents}</p>
                            <p className="text-xs font-semibold text-slate-400">Alunos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-extrabold text-graphite-dark">{usage.totalPlans}</p>
                            <p className="text-xs font-semibold text-slate-400">Planos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-extrabold text-graphite-dark">
                                {(usage.revenueThisMonth / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">Receita Total</p>
                        </div>
                    </div>
                </div>

                {/* Usage Bar (only for free plan) */}
                {usagePercent !== null && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-graphite-dark">Uso de Alunos</span>
                            <span className="text-sm font-bold text-slate-400">
                                {usage.totalStudents}/{subscription.limits.maxStudents}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    usagePercent >= 80 ? "bg-red-500" : usagePercent >= 60 ? "bg-amber-500" : "bg-performance-green"
                                )}
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                        {usagePercent >= 80 && (
                            <p className="text-xs font-semibold text-amber-600 mt-2">
                                ⚠️ Você está próximo do limite. Considere fazer upgrade para desbloquear alunos ilimitados.
                            </p>
                        )}
                    </div>
                )}

                {/* Features list */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recursos Incluídos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subscription.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-performance-green/10 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} weight="bold" className="text-performance-green" />
                                </div>
                                <span className="text-sm font-medium text-graphite-dark">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Plan Comparison */}
            <div>
                <h3 className="text-lg font-extrabold text-graphite-dark mb-4">Alterar Plano</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {planCards.map((plan) => {
                        const isCurrent = subscription.plan === plan.id;
                        const isChanging = changingTo === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "rounded-[24px] p-6 border-2 transition-all duration-200 relative",
                                    isCurrent
                                        ? plan.color === "green"
                                            ? "border-performance-green bg-emerald-50/50"
                                            : plan.color === "gold"
                                                ? "border-amber-400 bg-amber-50/50"
                                                : plan.color === "purple"
                                                    ? "border-purple-400 bg-purple-50/50"
                                                    : "border-slate-300 bg-slate-50/50"
                                        : "border-slate-100 bg-white hover:border-slate-200",
                                    "soft-shadow"
                                )}
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <div className={cn(
                                        "absolute -top-3 left-6 text-[10px] font-extrabold px-3 py-1 rounded-full",
                                        plan.color === "green"
                                            ? "bg-performance-green text-white"
                                            : plan.color === "purple"
                                                ? "bg-purple-500 text-white"
                                                : plan.color === "gold"
                                                    ? "bg-amber-400 text-amber-900"
                                                    : "bg-slate-400 text-white"
                                    )}>
                                        {plan.badge}
                                    </div>
                                )}

                                {isCurrent && (
                                    <div className="absolute -top-3 right-6 text-[10px] font-extrabold px-3 py-1 rounded-full bg-graphite-dark text-white">
                                        PLANO ATUAL
                                    </div>
                                )}

                                <h4 className="text-lg font-extrabold text-graphite-dark mt-2">{plan.name}</h4>
                                <div className="mt-2 mb-1">
                                    <span className="text-3xl font-black text-graphite-dark">{plan.price}</span>
                                    <span className="text-slate-400 font-medium text-sm">{plan.period}</span>
                                </div>
                                {plan.extra && (
                                    <p className={cn(
                                        "text-xs font-semibold mb-4",
                                        plan.color === "green" ? "text-performance-green" : plan.color === "purple" ? "text-purple-500" : "text-amber-500"
                                    )}>
                                        {plan.extra}
                                    </p>
                                )}

                                <ul className="space-y-2.5 my-6">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm">
                                            {f.included ? (
                                                <div className="w-4 h-4 rounded-full bg-performance-green/15 flex items-center justify-center">
                                                    <Check size={10} weight="bold" className="text-performance-green" />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <span className="text-[8px] text-slate-400">✕</span>
                                                </div>
                                            )}
                                            <span className={f.included ? "text-graphite-dark font-medium" : "text-slate-400 line-through font-medium"}>
                                                {f.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleChangePlan(plan.id)}
                                    disabled={isCurrent || isPending}
                                    className={cn(
                                        "w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                                        isCurrent
                                            ? "bg-slate-100 text-slate-400 cursor-default"
                                            : plan.color === "green"
                                                ? "bg-performance-green text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                                                : plan.color === "purple"
                                                    ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-200"
                                                    : plan.color === "gold"
                                                        ? "bg-amber-400 text-amber-900 hover:bg-amber-500"
                                                        : "bg-slate-200 text-graphite-dark hover:bg-slate-300",
                                        "disabled:opacity-50"
                                    )}
                                >
                                    {isChanging ? (
                                        <>
                                            <SpinnerGap size={18} className="animate-spin" />
                                            Alterando...
                                        </>
                                    ) : isCurrent ? (
                                        "Plano Atual"
                                    ) : (
                                        <>
                                            Mudar para {plan.name}
                                            <ArrowRight size={16} weight="bold" />
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

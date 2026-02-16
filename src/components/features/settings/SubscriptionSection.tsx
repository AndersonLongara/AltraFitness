"use client";

import { useState, useTransition } from "react";
import { Check, Lightning, Crown, Star, ArrowRight, SpinnerGap, Rocket, Timer } from "@phosphor-icons/react";
import type { SubscriptionInfo, UsageStats, PlatformPlanForSettings } from "@/app/actions/settings";
import { changeSubscriptionPlan } from "@/app/actions/settings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SubscriptionSectionProps {
    subscription: SubscriptionInfo;
    usage: UsageStats;
    platformPlans: PlatformPlanForSettings[];
}

function getPlanCardStyle(plan: PlatformPlanForSettings): { color: "slate" | "purple" | "green" | "gold"; badge: string } {
    if (plan.priceCents === 0 && !plan.trialDays) return { color: "slate", badge: "PARA SEMPRE" };
    if (plan.trialDays && plan.trialDays > 0) return { color: "purple", badge: `${plan.trialDays} DIAS GRÁTIS` };
    if (plan.durationMonths >= 12) return { color: "gold", badge: "ECONOMIZE" };
    return { color: "green", badge: "RECOMENDADO" };
}

export default function SubscriptionSection({ subscription, usage, platformPlans }: SubscriptionSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [changingTo, setChangingTo] = useState<string | null>(null);

    function handleChangePlan(planSlug: string) {
        if (planSlug === subscription.plan) return;
        setChangingTo(planSlug);
        startTransition(async () => {
            await changeSubscriptionPlan(planSlug);
            setChangingTo(null);
        });
    }

    const usagePercent = subscription.limits.maxStudents
        ? Math.min((usage.totalStudents / subscription.limits.maxStudents) * 100, 100)
        : null;

    const isFree = subscription.plan === "free" || subscription.plan === "free_5";

    return (
        <div className="space-y-8">
            {/* Trial Banner */}
            {(subscription.plan === "free_trial" || subscription.status === "trial") && subscription.trialEndsAt && (
                <div className="bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-4 flex items-center gap-3">
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
            <div className="bg-white dark:bg-[#1E2A36] rounded-[32px] p-8 soft-shadow border border-slate-100 dark:border-white/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center",
                            subscription.limits.hasPriority
                                ? "bg-gradient-to-br from-amber-400 to-amber-500"
                                : subscription.limits.hasAI
                                    ? "bg-gradient-to-br from-performance-green to-emerald-600"
                                    : subscription.status === "trial"
                                        ? "bg-gradient-to-br from-purple-500 to-purple-600"
                                        : "bg-gradient-to-br from-slate-400 to-slate-500"
                        )}>
                            {subscription.limits.hasPriority ? (
                                <Crown size={28} weight="fill" className="text-white" />
                            ) : subscription.limits.hasAI ? (
                                <Lightning size={28} weight="fill" className="text-white" />
                            ) : subscription.status === "trial" ? (
                                <Rocket size={28} weight="fill" className="text-white" />
                            ) : (
                                <Star size={28} weight="fill" className="text-white" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-graphite-dark dark:text-white">
                                Plano {subscription.displayName}
                            </h2>
                            <p className="text-sm font-medium text-slate-400">
                                {subscription.price}
                                {subscription.pricePerStudentCents != null && subscription.pricePerStudentCents > 0 && (
                                    <span className="text-slate-500"> · + {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(subscription.pricePerStudentCents / 100)} por aluno/mês</span>
                                )}
                                {" · Status: "}
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
                            <p className="text-2xl font-extrabold text-graphite-dark dark:text-white">{usage.totalStudents}</p>
                            <p className="text-xs font-semibold text-slate-400">Alunos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-extrabold text-graphite-dark dark:text-white">{usage.totalPlans}</p>
                            <p className="text-xs font-semibold text-slate-400">Planos</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-extrabold text-graphite-dark dark:text-white">
                                {(usage.revenueThisMonth / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                            <p className="text-xs font-semibold text-slate-400">Receita Total</p>
                        </div>
                    </div>
                </div>

                {/* Usage Bar (only for free plan) */}
                {usagePercent !== null && (
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-graphite-dark dark:text-white">Uso de Alunos</span>
                            <span className="text-sm font-bold text-slate-400">
                                {usage.totalStudents}/{subscription.limits.maxStudents}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-3 overflow-hidden">
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
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recursos Incluídos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {subscription.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-performance-green/10 flex items-center justify-center flex-shrink-0">
                                    <Check size={12} weight="bold" className="text-performance-green" />
                                </div>
                                <span className="text-sm font-medium text-graphite-dark dark:text-white">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Plan Comparison */}
            <div>
                <h3 className="text-lg font-extrabold text-graphite-dark dark:text-white mb-4">Alterar Plano</h3>
                <div
                    className="grid gap-6"
                    style={{
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                    }}
                >
                    {platformPlans.map((plan) => {
                        const isCurrent = subscription.plan === plan.slug;
                        const isChanging = changingTo === plan.slug;
                        const { color, badge } = getPlanCardStyle(plan);
                        const priceStr =
                            plan.priceCents === 0
                                ? "R$ 0"
                                : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(plan.priceCents / 100);
                        const periodStr =
                            plan.trialDays && plan.trialDays > 0
                                ? `/30 dias`
                                : plan.durationMonths >= 12
                                    ? "/ano"
                                    : "/mês";
                        const extraStr =
                            plan.pricePerStudentCents && plan.pricePerStudentCents > 0
                                ? `+ ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(plan.pricePerStudentCents / 100)} por aluno/mês`
                                : null;

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "rounded-[24px] p-6 border-2 transition-all duration-200 relative flex flex-col",
                                    isCurrent
                                        ? color === "green"
                                            ? "border-performance-green bg-emerald-50/50 dark:bg-emerald-500/10"
                                            : color === "gold"
                                                ? "border-amber-400 bg-amber-50/50 dark:bg-amber-400/10"
                                                : color === "purple"
                                                    ? "border-purple-400 bg-purple-50/50 dark:bg-purple-400/10"
                                                    : "border-slate-300 bg-slate-50/50 dark:bg-slate-300/10"
                                        : "border-slate-100 bg-white hover:border-slate-200 dark:border-white/10 dark:bg-[#1E2A36] dark:hover:border-white/20",
                                    "soft-shadow"
                                )}
                            >
                                {/* Badge */}
                                {badge && (
                                    <div
                                        className={cn(
                                            "absolute -top-3 left-6 text-[10px] font-extrabold px-3 py-1 rounded-full",
                                            color === "green"
                                                ? "bg-performance-green text-white"
                                                : color === "purple"
                                                    ? "bg-purple-500 text-white"
                                                    : color === "gold"
                                                        ? "bg-amber-400 text-amber-900"
                                                        : "bg-slate-400 text-white"
                                        )}
                                    >
                                        {badge}
                                    </div>
                                )}

                                {isCurrent && (
                                    <div className="absolute -top-3 right-6 text-[10px] font-extrabold px-3 py-1 rounded-full bg-graphite-dark text-white">
                                        PLANO ATUAL
                                    </div>
                                )}

                                <h4 className="text-lg font-extrabold text-graphite-dark dark:text-white mt-2">{plan.name}</h4>
                                <div className="mt-2 mb-1">
                                    <span className="text-3xl font-black text-graphite-dark dark:text-white">{priceStr}</span>
                                    <span className="text-slate-400 font-medium text-sm">{periodStr}</span>
                                </div>
                                {extraStr && (
                                    <p
                                        className={cn(
                                            "text-xs font-semibold mb-4",
                                            color === "green"
                                                ? "text-performance-green"
                                                : color === "purple"
                                                    ? "text-purple-500"
                                                    : "text-amber-500"
                                        )}
                                    >
                                        {extraStr}
                                    </p>
                                )}

                                <ul className="space-y-2.5 my-6 flex-1">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm">
                                            <div className="w-4 h-4 rounded-full bg-performance-green/15 flex items-center justify-center flex-shrink-0">
                                                <Check size={10} weight="bold" className="text-performance-green" />
                                            </div>
                                            <span className="text-graphite-dark dark:text-white font-medium">{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleChangePlan(plan.slug)}
                                    disabled={isCurrent || isPending}
                                    className={cn(
                                        "w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-auto",
                                        isCurrent
                                            ? "bg-slate-100 dark:bg-white/10 text-slate-400 cursor-default"
                                            : color === "green"
                                                ? "bg-performance-green text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                                                : color === "purple"
                                                    ? "bg-purple-500 text-white hover:bg-purple-600 shadow-lg shadow-purple-200"
                                                    : color === "gold"
                                                        ? "bg-amber-400 text-amber-900 hover:bg-amber-500"
                                                    : "bg-slate-200 dark:bg-white/10 text-graphite-dark dark:text-white hover:bg-slate-300 dark:hover:bg-white/20",
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

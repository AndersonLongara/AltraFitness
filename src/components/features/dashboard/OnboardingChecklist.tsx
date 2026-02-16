"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretDown, CaretUp, CheckCircle, Circle, ArrowRight } from "@phosphor-icons/react";

type OnboardingChecklistProps = {
    hasAsaasKey: boolean;
    plansCount: number;
    studentsCount: number;
};

const steps = [
    {
        id: "asaas",
        label: "Configurar Asaas (opcional)",
        description: "Para cobrar via PIX/Boleto/Cartão. Se cobrar por fora, pode pular.",
        href: "/dashboard/settings?tab=account",
        check: (p: OnboardingChecklistProps) => p.hasAsaasKey,
    },
    {
        id: "plans",
        label: "Criar planos para alunos",
        description: "Ex: Mensal R$ 150, Trimestral R$ 400.",
        href: "/dashboard/financial",
        check: (p: OnboardingChecklistProps) => p.plansCount > 0,
    },
    {
        id: "students",
        label: "Convidar ou cadastrar alunos",
        description: "Use o código de time ou cadastre manualmente.",
        href: "/dashboard/students",
        check: (p: OnboardingChecklistProps) => p.studentsCount > 0,
    },
];

export default function OnboardingChecklist(props: OnboardingChecklistProps) {
    const [collapsed, setCollapsed] = useState(false);
    const completed = steps.filter((s) => s.check(props)).length;
    const total = steps.length;
    const allDone = completed === total;

    // Ocultar se já completou tudo (ou pelo menos planos + alunos)
    const hasPlansAndStudents = props.plansCount > 0 && props.studentsCount > 0;
    if (hasPlansAndStudents && (props.hasAsaasKey || completed >= 2)) {
        return null;
    }

    return (
        <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-[#1E2A36] dark:to-[#131B23] rounded-[24px] p-6 border border-slate-100 dark:border-white/10">
            <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-performance-green/10 dark:bg-emerald-500/20 text-performance-green dark:text-emerald-300 flex items-center justify-center font-bold">
                        {allDone ? (
                            <CheckCircle size={24} weight="fill" />
                        ) : (
                            <span>{completed}/{total}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-graphite-dark dark:text-white">Configure sua plataforma</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-300">Passo a passo para começar a usar</p>
                    </div>
                </div>
                {collapsed ? <CaretDown size={20} className="text-slate-400 dark:text-slate-400" /> : <CaretUp size={20} className="text-slate-400 dark:text-slate-400" />}
            </button>
            {!collapsed && (
                <div className="mt-4 space-y-3 pt-4 border-t border-slate-100 dark:border-white/10">
                    {steps.map((step) => {
                        const done = step.check(props);
                        return (
                            <div
                                key={step.id}
                                className={`flex items-start gap-3 p-3 rounded-xl ${done ? "bg-white/60 dark:bg-white/5" : "bg-white dark:bg-[#1E2A36]"}`}
                            >
                                {done ? (
                                    <CheckCircle size={22} weight="fill" className="text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                    <Circle size={22} className="text-slate-300 dark:text-slate-400 shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium ${done ? "text-slate-500 dark:text-slate-400 line-through" : "text-graphite-dark dark:text-white"}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">{step.description}</p>
                                </div>
                                {!done && (
                                    <Link
                                        href={step.href}
                                        className="shrink-0 flex items-center gap-1 text-sm font-bold text-performance-green dark:text-emerald-400 hover:underline"
                                    >
                                        Fazer <ArrowRight size={14} weight="bold" />
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-2">
                        Cobrando fora da plataforma? Use &quot;Registrar pagamento recebido&quot; em Financeiro.
                    </p>
                </div>
            )}
        </div>
    );
}

'use client';

import { Warning, ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";

interface PlansSetupAlertProps {
    hasPlans: boolean;
}

export default function PlansSetupAlert({ hasPlans }: PlansSetupAlertProps) {
    if (hasPlans) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-2">
            <div className="flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-600 shrink-0">
                    <Warning size={24} weight="fill" />
                </div>
                <div>
                    <h3 className="text-graphite-dark font-bold">Configure seus Planos e Valores</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        Para converter leads em alunos, você precisa cadastrar os planos disponíveis (Menal, Trimestral, etc).
                    </p>
                </div>
            </div>

            <Link
                href="/dashboard/financial"
                className="bg-amber-100 text-amber-900 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-200 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
                Cadastrar Planos <ArrowRight weight="bold" />
            </Link>
        </div>
    );
}

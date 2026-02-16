"use client";

import { HandCoins } from "@phosphor-icons/react";

export default function FinancialHeader() {
    return (
        <header>
            <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight flex items-center gap-4">
                <HandCoins size={32} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
                Financeiro
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                Gerencie planos, mensalidades e fluxo de caixa.
            </p>
        </header>
    );
}

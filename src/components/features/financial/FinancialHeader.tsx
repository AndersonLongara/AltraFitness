"use client";

import { HandCoins } from "@phosphor-icons/react";

export default function FinancialHeader() {
    return (
        <header>
            <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight flex items-center gap-4">
                <HandCoins size={32} weight="fill" className="text-emerald-600" />
                Financeiro
            </h1>
            <p className="text-slate-500 font-medium mt-2">
                Gerencie planos, mensalidades e fluxo de caixa.
            </p>
        </header>
    );
}

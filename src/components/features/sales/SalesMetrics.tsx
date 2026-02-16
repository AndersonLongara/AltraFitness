'use client';

import { TrendUp, Users, CurrencyDollar, Lightning } from "@phosphor-icons/react";

interface SalesMetricsProps {
    totalValue: number;
    activeLeads: number;
    conversionRate: number;
    insight?: string;
}

export default function SalesMetrics({ totalValue, activeLeads, conversionRate, insight }: SalesMetricsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
            {/* Total Value Card */}
            <div className="bg-graphite-dark rounded-[24px] p-6 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CurrencyDollar size={80} weight="fill" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-slate-300">
                        <div className="p-1.5 bg-white/10 rounded-lg">
                            <CurrencyDollar size={16} weight="bold" className="text-performance-green" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">Valor em Pipeline</span>
                    </div>
                    <h3 className="text-3xl font-black tracking-tight mt-2">
                        R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                        Potencial de receita atual
                    </p>
                </div>
            </div>

            {/* Active Leads Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 soft-shadow group hover:border-performance-green/30 transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                                <Users size={16} weight="bold" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Leads Ativos</span>
                        </div>
                        <h3 className="text-3xl font-black text-graphite-dark tracking-tight mt-2">
                            {activeLeads}
                        </h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <TrendUp size={20} weight="bold" />
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    Em negociação ou contato
                </p>
            </div>

            {/* Conversion Rate Card */}
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 soft-shadow group hover:border-performance-green/30 transition-all">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-slate-500">
                            <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg">
                                <Lightning size={16} weight="fill" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Conversão</span>
                        </div>
                        <h3 className="text-3xl font-black text-graphite-dark tracking-tight mt-2">
                            {conversionRate.toFixed(1)}%
                        </h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:rotate-12 transition-transform">
                        <Lightning size={20} weight="duotone" />
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    Taxa de fechamento global
                </p>
            </div>

            {/* AI Insight Card (Mocked) */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] p-6 text-white flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-20">
                    <Lightning size={100} weight="fill" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                            AI Insight
                        </span>
                    </div>
                    <p className="font-bold text-lg leading-tight">
                        {insight || "Foque nos leads 'Mornos' hoje. Eles têm 2x mais chance de fechar."}
                    </p>
                    <button className="mt-3 text-xs font-bold underline opacity-80 hover:opacity-100 transition-opacity text-left">
                        Ver sugestões →
                    </button>
                </div>
            </div>
        </div>
    );
}

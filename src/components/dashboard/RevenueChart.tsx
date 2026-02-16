"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ChartLineUp } from "@phosphor-icons/react";

interface RevenueChartProps {
    data: { name: string; value: number }[];
    hasRevenue?: boolean;
}

export default function RevenueChart({ data, hasRevenue }: RevenueChartProps) {
    const isEmpty = !hasRevenue && data.every((d) => d.value === 0);

    return (
        <div className="bg-white dark:bg-[#1E2A36] p-8 rounded-[32px] soft-shadow h-full flex flex-col relative overflow-hidden border border-slate-100 dark:border-white/10">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-extrabold text-graphite-dark dark:text-white tracking-tight">Faturamento</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Últimos 6 Meses</p>
                </div>
            </div>

            {isEmpty ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[280px] text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                        <ChartLineUp size={32} weight="duotone" className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-semibold">Nenhuma receita ainda</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                        Quando você registrar pagamentos em Financeiro, o gráfico será preenchido aqui.
                    </p>
                </div>
            ) : (
                <div className="flex-1 w-full min-h-[300px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                            />
                            <Tooltip
                                cursor={{ stroke: '#10B981', strokeWidth: 2, strokeDasharray: '4 4' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#059669', fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#10B981"
                                strokeWidth={5}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

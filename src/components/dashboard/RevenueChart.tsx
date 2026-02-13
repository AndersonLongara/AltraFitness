"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CurrencyDollar } from "@phosphor-icons/react";

interface RevenueChartProps {
    data: { name: string; value: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="bg-white p-8 rounded-[32px] soft-shadow h-full flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div>
                    <h3 className="text-xl font-extrabold text-graphite-dark tracking-tight">Faturamento</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Últimos 6 Meses</p>
                </div>
                {/* Optional: Add icon/button if needed */}
            </div>

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
        </div>
    );
}

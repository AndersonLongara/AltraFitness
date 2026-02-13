"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendUp } from "@phosphor-icons/react";

const data = [
    { name: "Mon", value: 30 },
    { name: "Tue", value: 45 },
    { name: "Wed", value: 35 },
    { name: "Thu", value: 60 },
    { name: "Fri", value: 55 },
    { name: "Sat", value: 85 },
    { name: "Sun", value: 70 },
];

export default function PerformanceChart() {
    return (
        <div className="bg-pure-white p-4 md:p-6 rounded-3xl soft-shadow h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-graphite-dark">Volume de Atividade</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Carga Semanal</p>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <TrendUp size={20} weight="duotone" />
                </div>
            </div>

            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip
                            cursor={{ stroke: '#F1F5F9', strokeWidth: 2 }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#2ECC71"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

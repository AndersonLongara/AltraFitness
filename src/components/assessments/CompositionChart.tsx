'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CompositionChartProps {
    data: {
        date: Date;
        leanMass: number | null;
        fatMass: number | null;
        weight: number;
    }[];
}

export default function CompositionChart({ data }: CompositionChartProps) {
    // Reverse data to show oldest to newest
    const chartData = [...data].reverse().map(d => ({
        ...d,
        dateFormatted: format(new Date(d.date), 'dd/MMM', { locale: ptBR }),
    }));

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorLean" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="dateFormatted"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="leanMass"
                        name="Massa Magra (kg)"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorLean)"
                    />
                    <Area
                        type="monotone"
                        dataKey="fatMass"
                        name="Massa Gorda (kg)"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorFat)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

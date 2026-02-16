'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeightEvolutionChartProps {
    data: {
        date: string; // ISO string
        weight: number;
    }[];
}

export default function WeightEvolutionChart({ data }: WeightEvolutionChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[250px] flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <span className="text-3xl mb-2">⚖️</span>
                <p className="text-slate-400 text-sm font-medium">Sem dados de peso suficientes</p>
            </div>
        );
    }

    // Sort data by date just in case
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'dd/MM', { locale: ptBR });
        } catch {
            return "";
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatTooltipDate = (label: any) => {
        try {
            return format(new Date(String(label)), "dd 'de' MMMM, yyyy", { locale: ptBR });
        } catch {
            return "";
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl soft-shadow h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-700 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                Evolução de Peso
            </h3>

            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            domain={['dataMin - 2', 'dataMax + 2']}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px 16px',
                                fontFamily: 'var(--font-primary, sans-serif)'
                            }}
                            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}
                            itemStyle={{ color: '#10b981', fontWeight: 700, fontSize: '14px' }}
                            formatter={(value: number | undefined) => [`${value ?? 0} kg`, 'Peso']}
                            labelFormatter={formatTooltipDate}
                            cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorWeight)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#059669' }}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

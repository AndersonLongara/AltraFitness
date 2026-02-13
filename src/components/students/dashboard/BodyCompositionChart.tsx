'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BodyCompositionChartProps {
    data: {
        date: string;
        leanMass: number | null;
        fatMass: number | null;
    }[];
}

export default function BodyCompositionChart({ data }: BodyCompositionChartProps) {
    if (!data || data.length === 0 || data.every(d => !d.leanMass && !d.fatMass)) {
        return (
            <div className="h-[250px] flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <span className="text-3xl mb-2">💪</span>
                <p className="text-slate-400 text-sm font-medium">Sem dados de composição corporal</p>
            </div>
        );
    }

    // Sort and Filter valid data
    const validData = [...data]
        .filter(d => d.leanMass !== null || d.fatMass !== null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-6); // Show last 6 assessments to avoid overcrowding

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'dd/MM', { locale: ptBR });
        } catch {
            return "";
        }
    };

    const formatTooltipDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd 'de' MMMM, yyyy", { locale: ptBR });
        } catch {
            return "";
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl soft-shadow h-full flex flex-col">
            <h3 className="text-base font-bold text-slate-700 mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                Composição Corporal
            </h3>

            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={validData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{
                                borderRadius: '16px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                padding: '12px 16px',
                                fontFamily: 'var(--font-primary, sans-serif)'
                            }}
                            labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '8px', fontWeight: 600 }}
                            labelFormatter={formatTooltipDate}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '20px' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="leanMass"
                            name="Massa Magra (kg)"
                            stackId="a"
                            fill="#3b82f6"
                            radius={[0, 0, 4, 4]}
                            animationDuration={1500}
                        />
                        <Bar
                            dataKey="fatMass"
                            name="Massa Gorda (kg)"
                            stackId="a"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

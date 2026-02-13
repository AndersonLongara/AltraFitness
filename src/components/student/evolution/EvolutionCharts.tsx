'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvolutionChartsProps {
    data: {
        date: string;
        weight: number;
        bodyFat: number | null;
        leanMass: number | null;
        fatMass: number | null;
    }[];
}

export default function EvolutionCharts({ data }: EvolutionChartsProps) {
    const [activeTab, setActiveTab] = useState<'weight' | 'bodyFat' | 'composition'>('weight');

    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl soft-shadow flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-3xl">
                    📊
                </div>
                <h3 className="text-lg font-bold text-slate-700">Sem dados suficientes</h3>
                <p className="text-slate-400 max-w-xs">
                    Realize sua primeira avaliação física para visualizar sua evolução aqui.
                </p>
            </div>
        );
    }

    const formatDate = (dateStr: string | number) => {
        return format(parseISO(String(dateStr)), 'dd/MM', { locale: ptBR });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const labelFormatDate = (label: any) => formatDate(String(label));

    const ChartContainer = ({ children }: { children: React.ReactNode }) => (
        <div className="h-[300px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    );

    return (
        <div className="bg-surface-grey border border-white/5 p-6 rounded-[32px] overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-widest">
                    <span className="w-1.5 h-4 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                    Evolução Corporal
                </h3>

                {/* Tabs */}
                <div className="flex bg-deep-black p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setActiveTab('weight')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'weight' ? 'bg-acid-lime text-black shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Peso
                    </button>
                    <button
                        onClick={() => setActiveTab('bodyFat')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'bodyFat' ? 'bg-acid-lime text-black shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        % Gordura
                    </button>
                    <button
                        onClick={() => setActiveTab('composition')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === 'composition' ? 'bg-acid-lime text-black shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        Composição
                    </button>
                </div>
            </div>

            {/* Charts */}
            {activeTab === 'weight' && (
                <ChartContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#BDFF00" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#BDFF00" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1C1C1E', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                            itemStyle={{ color: '#BDFF00', fontWeight: 'bold' }}
                            labelStyle={{ color: '#fff', marginBottom: '4px', fontWeight: 'bold' }}
                            labelFormatter={labelFormatDate}
                        />
                        <Area
                            type="monotone"
                            dataKey="weight"
                            stroke="#BDFF00"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorWeight)"
                            name="Peso (kg)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ChartContainer>
            )}

            {activeTab === 'bodyFat' && (
                <ChartContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBodyFat" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            domain={[0, 'auto']}
                            tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1C1C1E', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                            itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                            labelStyle={{ color: '#fff', marginBottom: '4px', fontWeight: 'bold' }}
                            labelFormatter={labelFormatDate}
                        />
                        <Area
                            type="monotone"
                            dataKey="bodyFat"
                            stroke="#f59e0b"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorBodyFat)"
                            name="Gordura (%)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ChartContainer>
            )}

            {activeTab === 'composition' && (
                <ChartContainer>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            tick={{ fontSize: 9, fill: '#52525b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ backgroundColor: '#1C1C1E', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                            labelStyle={{ color: '#fff', marginBottom: '4px', fontWeight: 'bold' }}
                            labelFormatter={labelFormatDate}
                        />
                        <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                        <Bar dataKey="leanMass" name="Massa Magra" stackId="a" fill="#BDFF00" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="fatMass" name="Massa Gorda" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            )}
        </div>
    );
}

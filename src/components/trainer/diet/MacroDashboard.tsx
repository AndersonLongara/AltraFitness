
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { User, Warning, CheckCircle, Fire, PersonSimpleRun, Target, ChartPie as PieChartIcon } from "@phosphor-icons/react";
import Image from "next/image";

interface MacroDashboardProps {
    student?: {
        name: string;
        photoUrl?: string | null;
        age?: number | null;
        weight?: number | null;
        height?: number | null;
        bmr?: number | null;
    } | null;
    targets: {
        kcal: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    current: {
        kcal: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
    };
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export default function MacroDashboard({ student, targets, current }: MacroDashboardProps) {

    // Data for Donut Chart
    const macroData = [
        { name: 'Proteínas', value: current.protein * 4, color: '#10b981' }, // Emerald-500
        { name: 'Gorduras', value: current.fat * 9, color: '#f59e0b' },   // Amber-500
        { name: 'Carboidratos', value: current.carbs * 4, color: '#3b82f6' }, // Blue-500
    ].filter(d => d.value > 0);

    const emptyData = [{ name: 'Vazio', value: 1, color: '#e2e8f0' }];

    // Progress Calculation
    const kcalProgress = Math.min(100, (current.kcal / (targets.kcal || 1)) * 100);
    const proteinProgress = Math.min(100, (current.protein / (targets.protein || 1)) * 100);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Card 1: Student Bio */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2">
                            <User size={16} weight="duotone" className="text-slate-400" />
                            Sobre o aluno
                        </div>
                        {student ? (
                            <>
                                <h3 className="text-lg font-bold text-slate-800 line-clamp-1" title={student.name}>{student.name}</h3>
                                <div className="text-sm font-medium text-slate-500 mt-1">
                                    {student.age ? `${student.age} anos` : '-'} • {student.weight ? `${student.weight}kg` : '-'}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-slate-400 italic mt-2">Dados do aluno não disponíveis</div>
                        )}
                    </div>
                    {student?.photoUrl ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100">
                            <Image src={student.photoUrl} alt={student.name} width={48} height={48} className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User size={24} />
                        </div>
                    )}
                </div>

                {/* BMR Badge */}
                {student?.bmr && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-xs font-bold w-fit">
                        <PersonSimpleRun size={16} weight="duotone" />
                        TMB: {student.bmr} kcal
                    </div>
                )}

                {/* Decorative BG Icon */}
                <div className="absolute -bottom-4 -right-4 text-slate-50 opacity-50 group-hover:scale-110 transition-transform">
                    <User size={100} weight="fill" />
                </div>
            </div>

            {/* Card 2: Goal Progress */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-center gap-6 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Target size={100} className="text-slate-900" />
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-[-10px]">
                    <Target size={16} weight="duotone" className="text-rose-500" />
                    Progresso das metas
                </div>

                {/* Calories Bar */}
                <div>
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                        <span>Calorias</span>
                        <span className={current.kcal > targets.kcal ? "text-rose-500" : "text-emerald-500"}>
                            {current.kcal} / {targets.kcal} <span className="text-[10px] text-slate-400">kcal</span>
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${current.kcal > targets.kcal ? 'bg-rose-500' : 'bg-slate-800'}`}
                            style={{ width: `${Math.min(100, (current.kcal / targets.kcal) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Protein Bar */}
                <div>
                    <div className="flex justify-between text-sm font-bold text-slate-600 mb-1">
                        <span>Proteínas</span>
                        <span className={current.protein > targets.protein ? "text-emerald-600" : "text-slate-400"}>
                            {current.protein} / {targets.protein} <span className="text-[10px] text-slate-400">g</span>
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (current.protein / targets.protein) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Card 3: Nutrient List */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                        <PieChartIcon size={16} weight="duotone" className="text-orange-500" />
                        Análise de nutrientes
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-bold text-slate-600">Proteínas</span>
                        </div>
                        <span className="font-bold text-slate-800">{current.protein} g</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="font-bold text-slate-600">Carboidratos</span>
                        </div>
                        <span className="font-bold text-slate-800">{current.carbs} g</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="font-bold text-slate-600">Gorduras</span>
                        </div>
                        <span className="font-bold text-slate-800">{current.fat} g</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                            <span className="font-medium text-slate-500">Fibras</span>
                        </div>
                        <span className="font-medium text-slate-500">{current.fiber || 0} g</span>
                    </div>
                </div>
            </div>

            {/* Card 4: Donut Chart */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-4 left-6 text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <PieChartIcon size={16} weight="duotone" className="text-slate-400" />
                    Distribuição
                </div>

                <div className="w-full h-32 flex items-center justify-center mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={macroData.length > 0 ? macroData : emptyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {macroData.length > 0 ? (
                                    macroData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))
                                ) : (
                                    <Cell fill="#f1f5f9" />
                                )}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                formatter={(value: number) => `${Math.round(value)} kcal`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Center Label (Total Kcal) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-2 text-center pointer-events-none">
                    <span className="block text-xs font-bold text-slate-400">Total</span>
                    <span className="block text-lg font-black text-slate-800">{current.kcal}</span>
                </div>
            </div>

        </div>
    );
}

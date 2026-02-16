"use client";

import Link from "next/link";
import {
    Scales,
    Percent,
    Calculator,
    Fire,
    Barbell,
    CalendarCheck,
    ChartLineUp
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import WeightEvolutionChart from "./WeightEvolutionChart";
import BodyCompositionChart from "./BodyCompositionChart";

interface DashboardOverviewProps {
    student: any;
    assessments: any[];
    lastWorkout: any;
    onNewAssessment: () => void;
}

export default function DashboardOverview({ student, assessments, lastWorkout, onNewAssessment }: DashboardOverviewProps) {
    // Get latest assessment for current stats
    const lastAssessment = assessments && assessments.length > 0 ? assessments[0] : null;

    // Prepare chart data
    const chartData = assessments?.map(a => ({
        date: a.date,
        weight: a.weight ? Number(a.weight) : 0,
        leanMass: a.leanMass ? Number(a.leanMass) : null,
        fatMass: a.fatMass ? Number(a.fatMass) : null,
    })).reverse() || [];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl flex flex-col justify-between h-32 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group border border-transparent dark:border-white/10">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Peso Atual</span>
                        <Scales size={24} weight="duotone" className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div>
                        <span className="text-3xl font-extrabold text-slate-700 dark:text-white">
                            {lastAssessment?.weight ? lastAssessment.weight.toFixed(1) : "--"}
                        </span>
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1">kg</span>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl flex flex-col justify-between h-32 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group border border-transparent dark:border-white/10">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gordura Corporal</span>
                        <div className="p-1 bg-white dark:bg-white/10 rounded-lg shadow-sm">
                            <ChartLineUp size={20} weight="bold" className="text-amber-500" />
                        </div>
                    </div>
                    <div>
                        <span className="text-3xl font-extrabold text-slate-700 dark:text-white">
                            {lastAssessment?.bodyFat ? lastAssessment.bodyFat.toFixed(1) : "--"}
                        </span>
                        <span className="text-sm font-bold text-slate-400 dark:text-slate-500 ml-1">%</span>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl flex flex-col justify-between h-32 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group border border-transparent dark:border-white/10">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">IMC</span>
                        <Calculator size={24} weight="duotone" className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                        <span className="text-3xl font-extrabold text-slate-700 dark:text-white">
                            {lastAssessment?.bmi ? lastAssessment.bmi.toFixed(1) : "--"}
                        </span>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-500/10 p-6 rounded-3xl flex flex-col justify-between h-32 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors group border border-amber-100 dark:border-amber-500/30">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-amber-600/70 uppercase tracking-wider">Frequência</span>
                        <Fire size={24} weight="fill" className="text-amber-500" />
                    </div>
                    <div>
                        <span className="text-3xl font-extrabold text-amber-600">
                            0
                        </span>
                        <span className="text-sm font-bold text-amber-600/70 ml-1">dias seguidos</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <WeightEvolutionChart data={chartData} />
                <BodyCompositionChart data={chartData} />
            </div>

            {/* Bottom Grid: Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <CalendarCheck size={18} />
                        Última Atividade
                    </h3>

                    {lastWorkout ? (
                        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-6 rounded-3xl flex items-center justify-between hover:shadow-md dark:hover:shadow-none transition-all group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center font-bold">
                                    <Barbell size={24} weight="duotone" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-lg">{lastWorkout.workout.name}</h4>
                                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                                        Finalizado em {format(new Date(lastWorkout.endedAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                                <CalendarCheck size={20} weight="bold" />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 p-8 rounded-3xl text-center">
                            <p className="text-slate-400 dark:text-slate-500 font-medium">Nenhuma atividade recente registrada.</p>
                        </div>
                    )}

                    {/* XP / Level Placeholder */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-50/50 dark:bg-emerald-500/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/30">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">XP Total</span>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">0 XP</div>
                        </div>
                        <div className="bg-purple-50/50 dark:bg-purple-500/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-500/30">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Nível</span>
                            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">Lvl 1</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <ChartLineUp size={18} />
                        Ações Rápidas
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={onNewAssessment}
                            className="w-full p-4 bg-slate-800 dark:bg-[#1E2A36] text-white rounded-2xl font-bold flex items-center justify-between hover:bg-slate-900 dark:hover:bg-white/10 shadow-lg shadow-slate-200 dark:shadow-none transition-all group dark:border dark:border-white/10"
                        >
                            <div className="flex items-center gap-3">
                                <Scales size={24} weight="duotone" className="text-emerald-400" />
                                <span>Nova Avaliação Física</span>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                ➔
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

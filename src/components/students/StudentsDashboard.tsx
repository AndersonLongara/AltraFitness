'use client';

import { Users, UserCheck, UserMinus, ClipboardText, TrendUp, Lightning } from "@phosphor-icons/react";

interface StudentsDashboardProps {
    studentsList: any[];
    studentForms?: any[];
}

export default function StudentsDashboard({ studentsList, studentForms = [] }: StudentsDashboardProps) {
    // Calculate metrics
    const totalStudents = studentsList.length;
    const activeStudents = studentsList.filter(s => s.active).length;
    const inactiveStudents = studentsList.filter(s => !s.active).length;
    
    // Students with pending forms (forms not completed)
    const pendingForms = studentForms.filter(f => f.status === 'sent' || f.status === 'pending').length;
    const studentsWithPendingForms = new Set(
        studentForms
            .filter(f => f.status === 'sent' || f.status === 'pending')
            .map(f => f.studentId)
    ).size;
    
    // Students active in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentlyActiveStudents = studentsList.filter(s => {
        if (!s.lastActivityDate) return false;
        return new Date(s.lastActivityDate) >= sevenDaysAgo;
    }).length;
    
    const engagementRate = totalStudents > 0 
        ? Math.round((recentlyActiveStudents / totalStudents) * 100) 
        : 0;

    const stats = [
        {
            label: 'Total de Alunos',
            value: totalStudents,
            icon: Users,
            color: 'text-blue-500 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-500/10',
            border: 'border-blue-100 dark:border-blue-500/20',
        },
        {
            label: 'Alunos Ativos',
            value: activeStudents,
            icon: UserCheck,
            color: 'text-emerald-500 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10',
            border: 'border-emerald-100 dark:border-emerald-500/20',
        },
        {
            label: 'Alunos Inativos',
            value: inactiveStudents,
            icon: UserMinus,
            color: 'text-rose-500 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-500/10',
            border: 'border-rose-100 dark:border-rose-500/20',
        },
        {
            label: 'Formulários Pendentes',
            value: studentsWithPendingForms,
            subValue: `${pendingForms} ${pendingForms === 1 ? 'formulário' : 'formulários'}`,
            icon: ClipboardText,
            color: 'text-amber-500 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-500/10',
            border: 'border-amber-100 dark:border-amber-500/20',
        },
        {
            label: 'Ativos (7 dias)',
            value: recentlyActiveStudents,
            subValue: `${engagementRate}% dos alunos`,
            icon: Lightning,
            color: 'text-purple-500 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-500/10',
            border: 'border-purple-100 dark:border-purple-500/20',
        },
        {
            label: 'Taxa de Engajamento',
            value: `${engagementRate}%`,
            icon: TrendUp,
            color: 'text-orange-500 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-500/10',
            border: 'border-orange-100 dark:border-orange-500/20',
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className={`bg-white dark:bg-[#1E2A36] rounded-2xl p-5 border ${stat.border} hover:shadow-lg transition-all group`}
                >
                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <stat.icon size={24} className={stat.color} weight="fill" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                        {stat.label}
                    </h3>
                    <p className="text-2xl font-extrabold text-graphite-dark dark:text-white">
                        {stat.value}
                    </p>
                    {stat.subValue && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            {stat.subValue}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}

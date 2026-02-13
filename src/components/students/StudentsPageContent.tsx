'use client';

import { useState } from "react";
import { MagnifyingGlass, User, CaretRight, Plus, Lightning, Trophy, Fire } from "@phosphor-icons/react";
import StudentFormTrigger from "@/components/students/StudentFormTrigger";
import Link from "next/link";
import { format } from "date-fns";

interface StudentsPageContentProps {
    studentsList: any[];
}

export default function StudentsPageContent({ studentsList }: StudentsPageContentProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredStudents = studentsList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getMoodEmoji = (mood: string) => {
        switch (mood) {
            case 'motivated': return '🔥';
            case 'happy': return '😄';
            case 'neutral': return '😐';
            case 'tired': return '😫';
            case 'sore': return '🤕';
            case 'sad': return '😢';
            default: return '😶';
        }
    };

    const getMoodLabel = (mood: string) => {
        switch (mood) {
            case 'motivated': return 'Motivado';
            case 'happy': return 'Feliz';
            case 'neutral': return 'Neutro';
            case 'tired': return 'Cansado';
            case 'sore': return 'Dolorido';
            case 'sad': return 'Triste';
            default: return 'Sem registro';
        }
    };

    const getLastActivityStatus = (lastActivityDate: string | null) => {
        if (!lastActivityDate) return { label: 'Inativo', color: 'text-slate-400', bg: 'bg-slate-100' };
        const days = Math.floor((new Date().getTime() - new Date(lastActivityDate).getTime()) / (1000 * 3600 * 24));
        if (days < 3) return { label: 'Em chamas', color: 'text-orange-500', bg: 'bg-orange-50' };
        if (days < 7) return { label: 'Ativo', color: 'text-emerald-500', bg: 'bg-emerald-50' };
        return { label: 'Frio', color: 'text-blue-400', bg: 'bg-blue-50' };
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                        Gestão de Alunos
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">
                        {studentsList.length} {studentsList.length === 1 ? 'aluno matriculado' : 'alunos matriculados'} no seu estúdio.
                    </p>
                </div>

                <StudentFormTrigger />
            </header>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-pure-white px-4 py-4 rounded-2xl soft-shadow border border-slate-100 flex items-center">
                    <MagnifyingGlass size={20} className="text-slate-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Buscar aluno por nome ou e-mail..."
                        className="bg-transparent outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredStudents.map((student) => {
                    const lastMood = student.moodLogs?.[0];
                    const activityStatus = getLastActivityStatus(student.lastActivityDate);

                    return (
                        <div key={student.id} className="bg-pure-white p-6 rounded-3xl soft-shadow border border-slate-50 hover:border-emerald-100 transition-all group relative overflow-hidden">
                            {/* Status Badge */}
                            <div className="absolute top-6 right-6">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${student.active ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                    {student.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden mb-4 shadow-md ring-4 ring-slate-50 group-hover:ring-emerald-50 transition-all">
                                    {student.photoUrl ? (
                                        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={40} weight="fill" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-1">{student.name}</h3>
                                <p className="text-xs text-slate-400 font-medium">{student.plan?.name || 'Sem plano'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center">
                                    <span className="text-2xl mb-1">
                                        {lastMood ? getMoodEmoji(lastMood.mood) : '😶'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Humor</span>
                                    <span className="text-xs font-bold text-slate-600">{lastMood ? getMoodLabel(lastMood.mood) : '-'}</span>
                                </div>
                                <div className={`${activityStatus.bg} rounded-2xl p-3 flex flex-col items-center justify-center`}>
                                    <span className={`text-2xl mb-1 ${activityStatus.color}`}>
                                        <Lightning size={24} weight="fill" />
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                                    <span className={`text-xs font-bold ${activityStatus.color}`}>{activityStatus.label}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Trophy size={16} className="text-amber-400" weight="fill" />
                                        <span className="font-medium">Nível {student.level || 1}</span>
                                    </div>
                                    <span className="font-bold text-slate-700">{student.xp || 0} XP</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                        style={{ width: `${Math.min(((student.currentXp || 0) / 1000) * 100, 100)}%` }} // Assuming 1000xp per level roughly for viz
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                                    <div className="flex items-center gap-1">
                                        <Fire size={14} className={student.currentStreak > 0 ? "text-orange-500" : "text-slate-300"} weight="fill" />
                                        <span>{student.currentStreak || 0} dias seguidos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link href={`/dashboard/students/${student.id}`} className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-slate-200">
                                    Ver Perfil
                                    <CaretRight size={16} weight="bold" />
                                </Link>
                                <div className="w-12">
                                    <StudentFormTrigger student={student} mode="edit" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredStudents.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    <p>Nenhum aluno encontrado.</p>
                </div>
            )}
        </div>
    );
}

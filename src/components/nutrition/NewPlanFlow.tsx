
'use client';

import { useState } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import SmartMealBuilder from "@/components/trainer/diet/SmartMealBuilder";
import BackButton from "@/components/ui/BackButton";
import { User, MagnifyingGlass, CaretRight } from "@phosphor-icons/react";

// We need to fetch students server-side but this component needs to be client-side for state 
// or use a wrapper. Let's make this a client component that accepts students as props?
// Actually, the previous page was a server component. 
// I will rewrite this file effectively, but I need to handle Server/Client split.
// I'll make the page.tsx fetch data and render a client component "NewPlanFlow".

export default function NewNutritionPlanPageWrapper({ studentsList }: { studentsList: any[] }) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredStudents = studentsList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedStudentId) {
        return (
            <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
                <Sidebar />
                <div className="max-w-[1600px] mx-auto p-6 md:p-8">
                    {/* SmartMealBuilder has its own layout/container, but we might want to wrap it slightly for the sidebar margin */}
                    <SmartMealBuilder
                        studentId={selectedStudentId}
                        students={studentsList}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
                <header className="flex items-center gap-4">
                    <BackButton href="/dashboard/nutrition" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight text-left">
                            Novo Plano Nutricional
                        </h1>
                        <p className="text-slate-500 font-medium mt-2 text-left">
                            Selecione um aluno para iniciar a prescrição.
                        </p>
                    </div>
                </header>

                <div className="bg-pure-white p-6 rounded-3xl soft-shadow space-y-6">
                    <div className="relative">
                        <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar aluno..."
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => setSelectedStudentId(student.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                            {student.photoUrl ? (
                                                <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} weight="fill" className="text-slate-400 m-auto mt-3" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-700 group-hover:text-graphite-dark">{student.name}</h3>
                                            <p className="text-xs text-slate-400">{student.active ? 'Ativo' : 'Inativo'}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                        <CaretRight size={20} weight="bold" />
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <p>Nenhum aluno encontrado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

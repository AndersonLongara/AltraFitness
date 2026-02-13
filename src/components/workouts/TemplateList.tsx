"use client";

import { useState } from "react";
import { Copy, User, Plus, CaretRight, X, Check } from "@phosphor-icons/react";
import { applyWorkoutPlanTemplate } from "@/app/actions/workout-plans";
import { format } from "date-fns";
import Link from "next/link";

interface Template {
    id: string;
    name: string;
    createdAt: Date | null;
    workouts: { id: string }[];
}

interface Student {
    id: string;
    name: string;
}

interface TemplateListProps {
    templates: Template[];
    students: Student[];
}

export default function TemplateList({ templates, students }: TemplateListProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [isApplying, setIsApplying] = useState(false);

    const handleApply = async () => {
        if (!selectedTemplate || !selectedStudentId) return;
        setIsApplying(true);
        try {
            await applyWorkoutPlanTemplate(selectedTemplate.id, selectedStudentId);
            setSelectedTemplate(null);
            setSelectedStudentId("");
            alert("Modelo aplicado com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao aplicar modelo.");
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="bg-pure-white p-6 rounded-3xl soft-shadow border border-slate-50 group hover:border-amber-400 transition-all block"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:bg-amber-400 group-hover:text-graphite-dark transition-colors">
                                <Copy size={28} weight="duotone" />
                            </div>
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-600">
                                Modelo
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-graphite-dark mb-1 group-hover:text-amber-600 transition-colors line-clamp-1">
                            {template.name}
                        </h3>

                        <p className="text-sm text-slate-400 font-medium mb-6">
                            {template.workouts.length} treinos definidos
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedTemplate(template)}
                                className="flex-1 py-3 bg-amber-50 text-amber-600 font-bold rounded-xl hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <User size={18} weight="bold" />
                                Aplicar a Aluno
                            </button>
                            <Link
                                href={`/dashboard/workouts/${template.id}/edit?from=/dashboard/workouts/templates`}
                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <CaretRight size={18} weight="bold" />
                            </Link>
                        </div>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4 soft-shadow">
                            <Copy size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-400">Nenhum modelo criado</h3>
                        <Link href="/dashboard/workouts/new" className="text-amber-600 font-bold text-sm mt-2 inline-block hover:underline">
                            Criar primeiro modelo
                        </Link>
                    </div>
                )}
            </div>

            {/* Apply Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[32px] soft-shadow w-full max-w-md p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-extrabold text-graphite-dark">Aplicar Modelo</h2>
                                <p className="text-slate-500 font-medium text-sm">{selectedTemplate.name}</p>
                            </div>
                            <button onClick={() => setSelectedTemplate(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={24} weight="bold" className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Selecione o Aluno</label>
                                <select
                                    className="w-full p-4 bg-slate-50 rounded-2xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-amber-100 transition-all cursor-pointer"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                >
                                    <option value="">Selecione...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleApply}
                                disabled={!selectedStudentId || isApplying}
                                className="w-full py-4 bg-amber-400 text-graphite-dark font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isApplying ? (
                                    "Aplicando..."
                                ) : (
                                    <>
                                        <Check size={20} weight="bold" />
                                        Confirmar Aplicação
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

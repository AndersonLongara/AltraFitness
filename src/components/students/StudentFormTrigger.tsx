"use client";

import { useState } from "react";
import StudentForm from "./StudentForm";
import StudentInviteForm from "./StudentInviteForm";
import { createStudent, updateStudent } from "@/app/actions/students";
import { Plus as PlusIcon, PencilSimple, UserPlus, LinkSimple, X } from "@phosphor-icons/react";

interface Plan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    active?: boolean;
}

interface StudentFormTriggerProps {
    student?: any;
    mode?: 'create' | 'edit';
    plans?: Plan[];
}

export default function StudentFormTrigger({ student, mode = 'create', plans = [] }: StudentFormTriggerProps) {
    const [isChoiceOpen, setIsChoiceOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            if (mode === 'edit' && student?.id) {
                await updateStudent(student.id, {
                    ...data,
                    planEnd: data.planEnd ? new Date(data.planEnd) : undefined
                });
            } else {
                await createStudent({
                    ...data,
                    planEnd: data.planEnd ? new Date(data.planEnd) : undefined
                });
            }
        } catch (error: any) {
            alert(error.message);
            console.error("Failed to process student:", error);
        }
    };

    const openManualForm = () => {
        setIsChoiceOpen(false);
        setIsFormOpen(true);
    };

    const openInviteForm = () => {
        setIsChoiceOpen(false);
        setIsInviteOpen(true);
    };

    if (mode === 'edit') {
        return (
            <>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsFormOpen(true);
                    }}
                    className="p-2 text-slate-400 dark:hover:text-emerald-400 hover:text-performance-green hover:bg-emerald-50 dark:hover:bg-white/10 rounded-xl transition-all"
                    title="Editar Aluno"
                >
                    <PencilSimple size={20} weight="bold" />
                </button>
                <StudentForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSubmit={handleSubmit}
                    plans={plans}
                    initialData={student ? {
                        id: student.id,
                        name: student.name,
                        email: student.email || "",
                        cpf: student.cpf || "",
                        phone: student.phone || "",
                        planEnd: student.planEnd ? new Date(student.planEnd).toISOString().split('T')[0] : "",
                        planId: student.planId || "",
                    } : null}
                />
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsChoiceOpen(true)}
                className="px-6 py-4 bg-graphite-dark dark:bg-[#1E2A36] dark:text-white text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-white/10 dark:border dark:border-white/10 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"
            >
                <PlusIcon size={20} weight="bold" />
                Novo Aluno
            </button>

            {/* Choice Modal */}
            {isChoiceOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-dark/60 dark:bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-pure-white dark:bg-[#1E2A36] w-full max-w-md rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-graphite-dark dark:text-white">Novo Aluno</h3>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Como você quer cadastrar?</p>
                            </div>
                            <button onClick={() => setIsChoiceOpen(false)} className="p-2 text-slate-400 dark:hover:text-white hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors">
                                <X size={24} weight="bold" />
                            </button>
                        </div>

                        {/* Options */}
                        <div className="p-6 space-y-3">
                            <button
                                onClick={openManualForm}
                                className="w-full p-5 bg-slate-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border border-slate-100 dark:border-white/10 hover:border-emerald-200 dark:hover:border-emerald-500/30 rounded-2xl transition-all text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <UserPlus size={24} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-graphite-dark dark:text-white text-base">Cadastro Manual</h4>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                            Preencha todos os dados do aluno e escolha o plano. Ideal quando você tem as informações em mãos.
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={openInviteForm}
                                className="w-full p-5 bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-slate-100 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 rounded-2xl transition-all text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <LinkSimple size={24} weight="duotone" className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-graphite-dark dark:text-white text-base">Enviar Link de Convite</h4>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                                            Escolha o plano e envie um link para o aluno preencher seus dados pessoais. Perfeito via WhatsApp.
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Form */}
            <StudentForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmit}
                plans={plans}
            />

            {/* Invite Form */}
            <StudentInviteForm
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                plans={plans}
            />
        </>
    );
}

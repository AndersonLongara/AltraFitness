"use client";

import { useState } from "react";
import StudentForm from "./StudentForm";
import { createStudent, updateStudent } from "@/app/actions/students";
import { Plus as PlusIcon, PencilSimple } from "@phosphor-icons/react";

interface StudentFormTriggerProps {
    student?: any;
    mode?: 'create' | 'edit';
}

export default function StudentFormTrigger({ student, mode = 'create' }: StudentFormTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);

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
            alert(error.message); // Simple error feedback
            console.error("Failed to process student:", error);
        }
    };

    if (mode === 'edit') {
        return (
            <>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-performance-green hover:bg-emerald-50 rounded-xl transition-all"
                    title="Editar Aluno"
                >
                    <PencilSimple size={20} weight="bold" />
                </button>
                <StudentForm
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onSubmit={handleSubmit}
                    initialData={student ? {
                        id: student.id,
                        name: student.name,
                        email: student.email || "",
                        cpf: student.cpf || "",
                        phone: student.phone || "",
                        planEnd: student.planEnd ? new Date(student.planEnd).toISOString().split('T')[0] : ""
                    } : null}
                />
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-6 py-4 bg-graphite-dark text-white font-bold rounded-2xl hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-200"
            >
                <PlusIcon size={20} weight="bold" />
                Novo Aluno
            </button>
            <StudentForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={handleSubmit}
            />
        </>
    );
}

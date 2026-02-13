"use client";

import { useState } from "react";
import { User, CalendarCheck, FileText, ChartLineUp, Play, PencilSimple, Trash, Plus, Copy, ForkKnife, Scales, ClipboardText, PaperPlaneRight } from "@phosphor-icons/react";
import Link from "next/link";
import { format } from "date-fns";
import StudentForm from "@/components/students/StudentForm";
import { useRouter } from "next/navigation";
import { updateStudent, deleteStudent } from "@/app/actions/students";
import { deleteNutritionalPlan } from "@/app/actions/nutrition";
import PlanSelectionModal from "./PlanSelectionModal";
import DashboardOverview from "./dashboard/DashboardOverview";
import AssessmentList from "./assessments/AssessmentList";
import AssessmentFormModal from "./assessments/AssessmentFormModal";

import { assignFormToStudent } from "@/app/actions/forms";

interface StudentProfileTabsProps {
    student: any;
    plans: any[];
    diets?: any[];
    availablePlans?: any[];
    assessments?: any[];
    lastWorkout?: any;
    forms?: any[];
    assignedForms?: any[];
}

export default function StudentProfileTabs({
    student,
    plans,
    diets = [],
    availablePlans = [],
    assessments = [],
    lastWorkout,
    forms = [],
    assignedForms = []
}: StudentProfileTabsProps) {
    const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "diet" | "assessments" | "forms">("dashboard");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [isAssignFormOpen, setIsAssignFormOpen] = useState(false);
    const [selectedFormId, setSelectedFormId] = useState("");
    const [dietToDelete, setDietToDelete] = useState<any>(null);
    const router = useRouter();

    const handleAssignForm = async () => {
        if (!selectedFormId) return;
        try {
            await assignFormToStudent(selectedFormId, student.id);
            setIsAssignFormOpen(false);
            setSelectedFormId("");
            // Router refresh happens in server action but we can force it here too if needed
        } catch (error: any) {
            alert("Erro ao enviar formulário");
        }
    };

    const handleEdit = async (data: any) => {
        try {
            await updateStudent(student.id, {
                ...data,
                planEnd: data.planEnd ? new Date(data.planEnd) : undefined
            });
            setIsEditOpen(false);
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteStudent(student.id);
            router.push("/dashboard/students");
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleDeleteDiet = async () => {
        if (!dietToDelete) return;
        try {
            await deleteNutritionalPlan(dietToDelete.id, student.id);
            setDietToDelete(null);
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <>
            <div className="bg-pure-white rounded-3xl soft-shadow overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
                <div className="px-8 pb-8">
                    <div className="-mt-20 mb-6">
                        <div className="w-40 h-40 rounded-full bg-white p-1.5 shadow-xl">
                            <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                                {student.photoUrl ? (
                                    <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} weight="fill" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-extrabold text-graphite-dark">{student.name}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${student.active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {student.active ? 'Ativo' : 'Inativo'}
                                </span>
                                <span className="text-slate-400 text-sm">• {student.email || 'Sem e-mail'}</span>
                                {student.plan && (
                                    <button
                                        onClick={() => setIsPlanModalOpen(true)}
                                        className="text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg ml-2 transition-colors"
                                    >
                                        {student.plan.name}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                            >
                                <PencilSimple size={18} weight="bold" />
                                Editar
                            </button>
                            <button
                                onClick={() => setIsDeleteOpen(true)}
                                className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-2"
                                title="Excluir Aluno"
                            >
                                <Trash size={18} weight="bold" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-8 pt-4 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'border-performance-green text-performance-green' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'history' ? 'border-performance-green text-performance-green' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Treinos
                    </button>
                    <button
                        onClick={() => setActiveTab("diet")}
                        className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'diet' ? 'border-performance-green text-performance-green' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Nutrição
                    </button>
                    <button
                        onClick={() => setActiveTab("assessments")}
                        className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'assessments' ? 'border-performance-green text-performance-green' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Avaliações
                    </button>
                    <button
                        onClick={() => setActiveTab("forms")}
                        className={`pb-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'forms' ? 'border-performance-green text-performance-green' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Formulários
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                    {activeTab === 'dashboard' && (
                        <DashboardOverview
                            student={student}
                            assessments={assessments}
                            lastWorkout={lastWorkout}
                            onNewAssessment={() => setIsAssessmentModalOpen(true)}
                        />
                    )}

                    {activeTab === 'assessments' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsAssessmentModalOpen(true)}
                                    className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 shadow-lg shadow-slate-200 transition-all"
                                >
                                    <Plus size={20} weight="bold" />
                                    Nova Avaliação
                                </button>
                            </div>
                            <AssessmentList
                                assessments={assessments}
                                onSelect={(assessment) => {
                                    // Navigate to details or open modal (future)
                                    console.log("View assessment", assessment.id);
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex gap-3">
                                <Link
                                    href={`/dashboard/workouts/new?studentId=${student.id}`}
                                    className="flex-1 py-4 bg-graphite-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                                >
                                    <Plus size={20} weight="bold" />
                                    Nova Ficha
                                </Link>
                                <Link
                                    href={`/dashboard/workouts/templates`}
                                    className="flex-1 py-4 bg-amber-50 text-amber-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-amber-100 transition-all border border-amber-100"
                                    title="Aplicar Modelo de Treino"
                                >
                                    <Copy size={20} weight="bold" />
                                    Aplicar Modelo
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {plans.length > 0 ? (
                                    plans.map((plan) => (
                                        <Link
                                            key={plan.id}
                                            href={`/dashboard/workouts/${plan.id}/edit`}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-performance-green shadow-sm group-hover:bg-performance-green group-hover:text-white transition-colors">
                                                    <CalendarCheck size={24} weight="duotone" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-700">{plan.name}</h4>
                                                    <p className="text-xs text-slate-400">
                                                        {plan.active ? 'Ativa' : 'Inativa'} • {plan.createdAt ? format(new Date(plan.createdAt), "dd/MM/yyyy") : '--'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="p-2 text-slate-300 group-hover:text-performance-green group-hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Editar Ficha"
                                                >
                                                    <PencilSimple size={20} weight="bold" />
                                                </div>
                                                <CaretRight size={20} className="text-slate-300" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <p>Nenhuma ficha registrada.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'diet' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex gap-3">
                                <Link
                                    href={`/dashboard/students/${student.id}/diet/new`}
                                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                                >
                                    <Plus size={20} weight="bold" />
                                    Nova Dieta
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {diets && diets.length > 0 ? (
                                    diets.map((diet: any) => (
                                        <Link
                                            key={diet.id}
                                            href={`/dashboard/students/${student.id}/diet/${diet.id}/edit`}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                                    <ForkKnife size={24} weight="duotone" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-700">{diet.title}</h4>
                                                    <p className="text-xs text-slate-400">
                                                        {diet.active ? 'Ativa' : 'Inativa'} • {diet.dailyKcal} kcal • {diet.createdAt ? format(new Date(diet.createdAt), "dd/MM/yyyy") : '--'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="p-2 text-slate-300 group-hover:text-emerald-500 group-hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Editar Dieta"
                                                >
                                                    <PencilSimple size={20} weight="bold" />
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setDietToDelete(diet);
                                                    }}
                                                    className="p-2 text-slate-300 group-hover:text-rose-500 group-hover:bg-rose-50 rounded-lg transition-colors z-10"
                                                    title="Excluir Dieta"
                                                >
                                                    <Trash size={20} weight="bold" />
                                                </button>
                                                <CaretRight size={20} className="text-slate-300" />
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <p>Nenhuma dieta registrada.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'forms' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsAssignFormOpen(true)}
                                    className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 shadow-lg shadow-slate-200 transition-all"
                                >
                                    <PaperPlaneRight size={20} weight="bold" />
                                    Enviar Formulário
                                </button>
                            </div>

                            <div className="space-y-4">
                                {assignedForms && assignedForms.length > 0 ? (
                                    assignedForms.map((assignment: any) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors ${assignment.status === 'completed'
                                                        ? 'bg-white text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white'
                                                        : 'bg-white text-slate-400'
                                                    }`}>
                                                    <ClipboardText size={24} weight="duotone" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-700">{assignment.form.title}</h4>
                                                    <p className="text-xs text-slate-400">
                                                        {assignment.status === 'completed'
                                                            ? `Respondido em ${format(new Date(assignment.completedAt), "dd/MM/yyyy")}`
                                                            : `Enviado em ${format(new Date(assignment.assignedAt), "dd/MM/yyyy")}`
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${assignment.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-600'
                                                        : assignment.status === 'viewed'
                                                            ? 'bg-amber-100 text-amber-600'
                                                            : 'bg-slate-200 text-slate-500'
                                                    }`}>
                                                    {assignment.status === 'completed' ? 'Respondido' : assignment.status === 'viewed' ? 'Visto' : 'Pendente'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-400">
                                        <p>Nenhum formulário enviado.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <StudentForm
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleEdit}
                initialData={student}
            />

            {/* Assessment Modal */}
            <AssessmentFormModal
                isOpen={isAssessmentModalOpen}
                onClose={() => setIsAssessmentModalOpen(false)}
                studentId={student.id}
                onSuccess={() => {
                    router.refresh();
                    // Optionally switch to assessments tab if not there, or show toast
                }}
            />

            {/* Delete Confirmation Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-dark/60 backdrop-blur-sm p-4">
                    <div className="bg-pure-white w-full max-w-sm rounded-3xl soft-shadow overflow-hidden p-6 space-y-4">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
                                <Trash size={32} weight="duotone" />
                            </div>
                            <h3 className="text-xl font-bold text-graphite-dark mb-2">Excluir Aluno?</h3>
                            <p className="text-slate-500 text-sm">
                                Tem certeza que deseja excluir <strong>{student.name}</strong>? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Diet Confirmation Modal */}
            {dietToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-dark/60 backdrop-blur-sm p-4">
                    <div className="bg-pure-white w-full max-w-sm rounded-3xl soft-shadow overflow-hidden p-6 space-y-4">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4">
                                <Trash size={32} weight="duotone" />
                            </div>
                            <h3 className="text-xl font-bold text-graphite-dark mb-2">Excluir Dieta?</h3>
                            <p className="text-slate-500 text-sm">
                                Tem certeza que deseja excluir a dieta <strong>{dietToDelete.title}</strong>? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDietToDelete(null)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteDiet}
                                className="flex-1 px-4 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Plan Selection Modal */}
            {/* Assign Form Modal */}
            {isAssignFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-dark/60 backdrop-blur-sm p-4">
                    <div className="bg-pure-white w-full max-w-sm rounded-3xl soft-shadow overflow-hidden p-6 space-y-4">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-4">
                                <PaperPlaneRight size={32} weight="duotone" />
                            </div>
                            <h3 className="text-xl font-bold text-graphite-dark mb-2">Enviar Formulário</h3>
                            <p className="text-slate-500 text-sm">
                                Selecione um formulário para enviar para <strong>{student.name}</strong>.
                            </p>
                        </div>

                        <div className="py-2">
                            <select
                                value={selectedFormId}
                                onChange={(e) => setSelectedFormId(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 font-bold focus:border-emerald-500 focus:ring-emerald-500 outline-none"
                            >
                                <option value="">Selecione um modelo...</option>
                                {forms.map((form: any) => (
                                    <option key={form.id} value={form.id}>{form.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsAssignFormOpen(false)}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAssignForm}
                                disabled={!selectedFormId}
                                className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PlanSelectionModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                studentId={student.id}
                currentPlanId={student.planId}
                plans={availablePlans}
                onUpdate={() => router.refresh()}
            />
        </>
    );
}

function CaretRight({ size, className, weight = "bold" }: any) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 256 256"
            className={className}
            fill="currentColor"
        >
            <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
        </svg>
    );
}

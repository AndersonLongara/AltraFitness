"use client";

import { useState } from "react";
import { Plus, Trash, FloppyDisk } from "@phosphor-icons/react";
import ExerciseSelector from "./ExerciseSelector";
import { createWorkout, updateWorkout } from "@/app/actions/workouts";
import { useRouter } from "next/navigation";

interface WorkoutItem {
    id: string; // temp id for UI
    exerciseId: string;
    name: string;
    sets: number;
    reps: string;
    rpe?: number;
    restSeconds?: number;
    notes?: string;
    order?: number;
}

interface WorkoutBuilderProps {
    students: { id: string, name: string }[];
    exercises: { id: string, name: string, muscleGroup: string }[];
    trainerId: string;
    initialData?: {
        id: string;
        title: string;
        studentId: string;
        items: any[];
    };
    returnTo?: string;
}

export default function WorkoutBuilder({ students, exercises, trainerId, initialData, returnTo }: WorkoutBuilderProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || "");
    const [studentId, setStudentId] = useState(initialData?.studentId || "");
    const [items, setItems] = useState<WorkoutItem[]>(initialData?.items ? initialData.items.map(item => ({
        id: crypto.randomUUID(), // Always generate new temp IDs for UI state to avoid key conflicts or confusion
        exerciseId: item.exerciseId || item.exercise.id, // Handle potential nested exercise object from DB fetch
        name: item.exercise?.name || "Exercício",
        sets: item.sets,
        reps: item.reps,
        rpe: item.rpe,
        restSeconds: item.restSeconds,
        notes: item.notes,
        order: item.order
    })) : []);
    const [isPending, setIsPending] = useState(false);

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const addExercise = (exercise: { id: string, name: string }) => {
        const newItem: WorkoutItem = {
            id: crypto.randomUUID(),
            exerciseId: exercise.id,
            name: exercise.name,
            sets: 3,
            reps: "10-12",
            rpe: 8,
            restSeconds: 60,
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof WorkoutItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSave = async () => {
        if (!title || !studentId || items.length === 0) {
            alert("Preencha o título, selecione um aluno e adicione exercícios.");
            return;
        }

        setIsPending(true);
        try {
            const workoutData = {
                title,
                studentId,
                trainerId,
                items: items.map((item, index) => ({
                    exerciseId: item.exerciseId,
                    sets: item.sets,
                    reps: item.reps,
                    rpe: item.rpe,
                    restSeconds: item.restSeconds,
                    notes: item.notes,
                    order: index,
                })),
            };

            if (initialData?.id) {
                await updateWorkout(initialData.id, workoutData);
                router.push(returnTo || `/dashboard/students/${studentId}`);
            } else {
                await createWorkout(workoutData);
                // createWorkout handles redirect
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar treino.");
            setIsPending(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* Meta Info */}
            <div className="bg-pure-white p-6 rounded-3xl soft-shadow space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Título do Treino</label>
                    <input
                        type="text"
                        placeholder="Ex: Hipertrofia A - Peito e Tríceps"
                        className="w-full text-xl font-bold text-graphite-dark border-b-2 border-slate-100 pb-2 outline-none focus:border-performance-green transition-colors placeholder:text-slate-300"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        disabled={isPending}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Aluno</label>
                    <select
                        className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100"
                        value={studentId}
                        onChange={e => setStudentId(e.target.value)}
                        disabled={isPending}
                    >
                        <option value="">Selecione um aluno...</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Exercises List */}
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={item.id} className="bg-pure-white p-6 rounded-3xl soft-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                    {index + 1}
                                </span>
                                <h4 className="font-bold text-lg text-graphite-dark">{item.name}</h4>
                            </div>
                            <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                                <Trash size={20} weight="bold" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Séries</label>
                                <input
                                    type="number"
                                    className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-center text-graphite-dark focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    value={item.sets}
                                    onChange={e => updateItem(item.id, 'sets', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Reps</label>
                                <input
                                    type="text"
                                    className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-center text-graphite-dark focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    value={item.reps}
                                    onChange={e => updateItem(item.id, 'reps', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">RPE (0-10)</label>
                                <input
                                    type="number"
                                    className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-center text-graphite-dark focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    value={item.rpe || ''}
                                    onChange={e => updateItem(item.id, 'rpe', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Descanso (s)</label>
                                <input
                                    type="number"
                                    className="w-full mt-2 p-2 bg-slate-50 rounded-xl font-bold text-center text-graphite-dark focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                                    value={item.restSeconds || ''}
                                    onChange={e => updateItem(item.id, 'restSeconds', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => setIsSelectorOpen(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-3xl text-slate-400 font-bold hover:border-performance-green hover:text-performance-green hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={20} weight="bold" />
                    Adicionar Exercício
                </button>
            </div>

            {/* Actions */}
            <div className="fixed bottom-6 right-6 md:right-10 flex gap-4 z-40">
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="px-8 py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FloppyDisk size={24} weight="bold" />
                    {isPending ? 'Salvando...' : (initialData ? 'Atualizar Treino' : 'Salvar Treino')}
                </button>
            </div>

            <ExerciseSelector
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onSelect={addExercise}
                exercises={exercises}
            />
        </div>
    );
}

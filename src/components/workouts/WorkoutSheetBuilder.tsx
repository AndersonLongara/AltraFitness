"use client";

import { useState } from "react";
import { Plus, Trash, FloppyDisk, Barbell, Heart, Note, CaretRight, X, User, CheckCircle } from "@phosphor-icons/react";
import ExerciseSelector from "./ExerciseSelector";
import { createWorkoutPlan, updateWorkoutPlan, deleteWorkoutPlan } from "@/app/actions/workout-plans";
import { useRouter } from "next/navigation";
import ConfirmationModal, { ConfirmationVariant } from "../ui/ConfirmationModal";

// Types matching the server action input
interface ExerciseItem {
    id: string; // temp id
    exerciseId: string;
    name: string;
    sets: number; // working sets
    warmupSets: number;
    preparatorySets: number;
    reps: string;
    rpe: number;
    restSeconds: number;
    isSuperset: boolean;
    advancedTechniques: { type: string, notes: string }[];
    notes?: string;
    order: number;
}

const ADVANCED_TECHNIQUES = [
    "Drop Set",
    "Rest-Pause",
    "Pausa-Descanso",
    "Cluster Set",
    "Myo-reps",
    "Série Negativa",
    "Repetições Parciais",
    "Pico de Contração",
    "FST-7",
    "GVT (German Volume Training)",
    "Ponto Zero",
    "Isometria",
];

const WEEK_DAYS = [
    { id: 'Segunda', label: 'Segunda' },
    { id: 'Terça', label: 'Terça' },
    { id: 'Quarta', label: 'Quarta' },
    { id: 'Quinta', label: 'Quinta' },
    { id: 'Sexta', label: 'Sexta' },
    { id: 'Sábado', label: 'Sábado' },
    { id: 'Domingo', label: 'Domingo' },
];

interface SplitWorkout {
    id: string; // temp id
    title: string;
    items: ExerciseItem[];
}

interface WorkoutSheetBuilderProps {
    students: { id: string, name: string }[];
    exercises: { id: string, name: string, muscleGroup: string }[];
    trainerId: string;
    initialData?: {
        id: string;
        name: string;
        studentId: string | null;
        cardio: any;
        observations: string | null;
        isTemplate: boolean;
        workouts: {
            id: string;
            title: string;
            items: {
                id: string;
                exerciseId: string;
                name: string;
                sets: number;
                warmupSets: number;
                preparatorySets: number;
                reps: string;
                rpe: number;
                restSeconds: number;
                isSuperset: boolean;
                advancedTechniques: string | null;
                notes?: string;
                order: number;
            }[];
        }[];
    };
    returnTo?: string;
}


export default function WorkoutSheetBuilder({ students, exercises, trainerId, initialData, returnTo }: WorkoutSheetBuilderProps) {
    const router = useRouter();

    // Header State
    const [sheetName, setSheetName] = useState(initialData?.name || "Nova ficha de treino");
    const [studentId, setStudentId] = useState(initialData?.studentId || "");

    // Cardio State
    const [cardio, setCardio] = useState({
        frequency: initialData?.cardio?.frequency || 'daily' as 'weekly' | 'daily',
        unit: initialData?.cardio?.unit || 'hours' as 'minutes' | 'hours',
        mode: initialData?.cardio?.mode || 'equal' as 'equal' | 'individual',
        duration: initialData?.cardio?.duration?.toString() || '',
        days: initialData?.cardio?.days || [] as string[],
        individualTimes: initialData?.cardio?.individualTimes || {} as Record<string, string>,
        observations: initialData?.cardio?.notes || ''
    });

    // Splits State
    const [splits, setSplits] = useState<SplitWorkout[]>(initialData?.workouts?.map(w => ({
        id: w.id,
        title: w.title,
        items: w.items.map((item: any) => ({
            ...item,
            warmupSets: item.warmupSets || 0,
            preparatorySets: item.preparatorySets || 0,
            isSuperset: item.isSuperset || false,
            advancedTechniques: item.advancedTechniques ? JSON.parse(item.advancedTechniques) : [],
            rpe: item.rpe || 0,
            restSeconds: item.restSeconds || 0,
        }))
    })) || []);
    const [activeSplitId, setActiveSplitId] = useState<string | null>(splits[0]?.id || null);

    // Observations
    const [observations, setObservations] = useState(initialData?.observations || "");

    // UI State
    const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isTemplate, setIsTemplate] = useState(initialData?.isTemplate || false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

    // Confirmation Modal State
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        variant?: ConfirmationVariant;
        confirmText?: string;
        cancelText?: string | null;
        onConfirm: () => void;
        isLoading?: boolean;
    } | null>(null);

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedExerciseIds([]);
    };

    const toggleExerciseSelection = (id: string) => {
        setSelectedExerciseIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAllExercises = () => {
        const activeSplit = splits.find(s => s.id === activeSplitId);
        if (!activeSplit) return;

        const allIds = activeSplit.items.map(i => i.id);
        const allSelected = allIds.every(id => selectedExerciseIds.includes(id));

        if (allSelected) {
            setSelectedExerciseIds(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            setSelectedExerciseIds(prev => Array.from(new Set([...prev, ...allIds])));
        }
    };

    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [bulkEditValues, setBulkEditValues] = useState({
        sets: '',
        warmupSets: '',
        preparatorySets: '',
        reps: '',
        restSeconds: '',
        rpe: ''
    });

    // Actions
    const handleAddSplit = () => {
        const newSplit: SplitWorkout = {
            id: crypto.randomUUID(),
            title: `Treino ${String.fromCharCode(65 + splits.length)}`, // A, B, C...
            items: []
        };
        setSplits([...splits, newSplit]);
        setActiveSplitId(newSplit.id);
    };

    const handleRemoveSplit = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSplits = splits.filter(s => s.id !== id);
        setSplits(newSplits);
        if (activeSplitId === id) {
            setActiveSplitId(newSplits[0]?.id || null);
        }
    };

    const handleAddExercises = (newExercises: { id: string, name: string }[]) => {
        if (!activeSplitId) return;

        setSplits(prev => prev.map(split => {
            if (split.id !== activeSplitId) return split;

            const newItems = newExercises.map((exercise, index) => ({
                id: crypto.randomUUID(),
                exerciseId: exercise.id,
                name: exercise.name,
                sets: 3,
                warmupSets: 0,
                preparatorySets: 0,
                reps: "10-12",
                rpe: 8,
                restSeconds: 60,
                isSuperset: false,
                advancedTechniques: [],
                order: split.items.length + index
            }));

            return {
                ...split,
                items: [...split.items, ...newItems]
            };
        }));
    };

    const updateExercise = (splitId: string, itemId: string, field: keyof ExerciseItem, value: any) => {
        setSplits(splits.map(s => {
            if (s.id !== splitId) return s;
            return {
                ...s,
                items: s.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
            };
        }));
    };

    const removeExercise = (splitId: string, itemId: string) => {
        setSplits(splits.map(s => {
            if (s.id !== splitId) return s;
            return { ...s, items: s.items.filter(i => i.id !== itemId) };
        }));
    };

    const handleBulkDelete = () => {
        setSplits(prev => prev.map(split => ({
            ...split,
            items: split.items.filter(item => !selectedExerciseIds.includes(item.id))
        })));
        setSelectedExerciseIds([]);
        setIsSelectionMode(false);
        setIsBulkDeleteModalOpen(false);
    };

    const handleBulkMove = (targetSplitId: string) => {
        const exercisesToMove: ExerciseItem[] = [];

        // Collect exercises to move
        splits.forEach(split => {
            split.items.forEach(item => {
                if (selectedExerciseIds.includes(item.id)) {
                    exercisesToMove.push(item);
                }
            });
        });

        setSplits(prev => prev.map(split => {
            // Remove from current splits
            const filteredItems = split.items.filter(item => !selectedExerciseIds.includes(item.id));

            // Add to target split
            if (split.id === targetSplitId) {
                return {
                    ...split,
                    items: [...filteredItems, ...exercisesToMove]
                };
            }
            return { ...split, items: filteredItems };
        }));

        setSelectedExerciseIds([]);
        setIsSelectionMode(false);
    };

    const handleBulkEdit = (updates: Partial<ExerciseItem>) => {
        setSplits(prev => prev.map(split => ({
            ...split,
            items: split.items.map(item =>
                selectedExerciseIds.includes(item.id)
                    ? { ...item, ...updates }
                    : item
            )
        })));
        setSelectedExerciseIds([]);
        setIsSelectionMode(false);
    };

    const addTechnique = (splitId: string, itemId: string) => {
        setSplits(splits.map(s => {
            if (s.id !== splitId) return s;
            return {
                ...s,
                items: s.items.map(i => i.id === itemId ? {
                    ...i,
                    advancedTechniques: [...i.advancedTechniques, { type: ADVANCED_TECHNIQUES[0], notes: "" }]
                } : i)
            };
        }));
    };

    const updateTechnique = (splitId: string, itemId: string, techIndex: number, field: 'type' | 'notes', value: string) => {
        setSplits(splits.map(s => {
            if (s.id !== splitId) return s;
            return {
                ...s,
                items: s.items.map(i => i.id === itemId ? {
                    ...i,
                    advancedTechniques: i.advancedTechniques.map((t, idx) => idx === techIndex ? { ...t, [field]: value } : t)
                } : i)
            };
        }));
    };

    const removeTechnique = (splitId: string, itemId: string, techIndex: number) => {
        setSplits(splits.map(s => {
            if (s.id !== splitId) return s;
            return {
                ...s,
                items: s.items.map(i => i.id === itemId ? {
                    ...i,
                    advancedTechniques: i.advancedTechniques.filter((_, idx) => idx !== techIndex)
                } : i)
            };
        }));
    };

    const toggleDay = (dayId: string) => {
        setCardio(prev => {
            const exists = prev.days.includes(dayId);
            const nextDays = exists
                ? prev.days.filter(d => d !== dayId)
                : [...prev.days, dayId];

            let nextFrequency = prev.frequency;
            if (exists && prev.frequency === 'weekly') {
                nextFrequency = 'daily';
            } else if (!exists && nextDays.length === 7) {
                nextFrequency = 'weekly';
            }

            return {
                ...prev,
                days: nextDays,
                frequency: nextFrequency
            };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = {
                studentId: isTemplate ? undefined : studentId,
                isTemplate,
                name: sheetName,
                cardio: {
                    ...cardio,
                    type: 'time' as const,
                    duration: cardio.mode === 'equal' ? (Number(cardio.duration) || 0) : 0,
                    notes: cardio.observations
                },
                observations,
                workouts: splits.map(split => ({
                    id: initialData ? split.id : undefined, // Keep IDs if editing
                    title: split.title,
                    items: split.items.map(item => ({
                        ...item,
                        advancedTechniques: JSON.stringify(item.advancedTechniques)
                    }))
                }))
            };

            let result;
            if (initialData) {
                result = await updateWorkoutPlan(initialData.id, data);
            } else {
                result = await createWorkoutPlan(data);
            }

            if (result && result.success) {
                if (isTemplate) {
                    router.push(`/dashboard/workouts/templates`);
                } else if (studentId) {
                    router.push(`/dashboard/students/${studentId}`);
                } else {
                    router.push(`/dashboard/workouts`);
                }
            }
        } catch (err) {
            console.error(err);
            setConfirmationModal({
                isOpen: true,
                title: "Erro ao Salvar",
                description: "Ocorreu um erro ao tentar salvar a ficha de treino. Tente novamente.",
                variant: "danger",
                confirmText: "Entendi",
                cancelText: null,
                onConfirm: () => setConfirmationModal(null)
            });
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;

        setConfirmationModal({
            isOpen: true,
            title: "Excluir Ficha",
            description: "Tem certeza que deseja excluir esta ficha de treino? Esta ação não pode ser desfeita.",
            variant: "danger",
            confirmText: "Sim, excluir",
            cancelText: "Cancelar",
            onConfirm: async () => {
                setConfirmationModal(prev => prev ? { ...prev, isLoading: true } : null);
                try {
                    await deleteWorkoutPlan(initialData.id);
                    if (initialData.isTemplate) {
                        router.push('/dashboard/workouts/templates');
                    } else if (initialData.studentId) {
                        router.push(`/dashboard/students/${initialData.studentId}`);
                    } else {
                        router.push('/dashboard/workouts');
                    }
                } catch (error) {
                    console.error(error);
                    setConfirmationModal({
                        isOpen: true,
                        title: "Erro ao Excluir",
                        description: "Não foi possível excluir a ficha de treino.",
                        variant: "danger",
                        confirmText: "Entendi",
                        cancelText: null,
                        onConfirm: () => setConfirmationModal(null)
                    });
                }
            }
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {isEditingTitle ? (
                        <input
                            autoFocus
                            className="text-3xl font-extrabold text-graphite-dark bg-transparent border-b-2 border-performance-green outline-none"
                            value={sheetName}
                            onChange={(e) => setSheetName(e.target.value)}
                            onBlur={() => setIsEditingTitle(false)}
                            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                        />
                    ) : (
                        <h1
                            className="text-3xl font-extrabold text-graphite-dark tracking-tight cursor-pointer hover:text-slate-600 transition-colors flex items-center gap-2"
                            onClick={() => setIsEditingTitle(true)}
                        >
                            {sheetName}
                            <span className="text-slate-300 text-lg">✎</span>
                        </h1>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {initialData && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting || isSaving}
                            className="p-3 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-colors disabled:opacity-50"
                            title="Excluir Ficha"
                        >
                            <Trash size={24} weight="bold" />
                        </button>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-slate-100 soft-shadow">
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-performance-green rounded-lg"
                            checked={isTemplate}
                            onChange={(e) => setIsTemplate(e.target.checked)}
                        />
                        <span className="font-bold text-slate-600 text-sm">Salvar como Modelo</span>
                    </label>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-6 py-3 text-graphite-dark font-bold rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 ${isTemplate ? 'bg-amber-400' : 'bg-performance-green'}`}
                    >
                        <FloppyDisk size={24} weight="bold" />
                        {isSaving ? "Salvando..." : isTemplate ? "Salvar Modelo" : "Salvar Ficha"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Workouts (Takes 2/3 space) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Workouts (Splits) Section */}
                    <div className="bg-slate-50/50 p-1 rounded-[32px] border border-slate-100 h-full">
                        <div className="bg-pure-white rounded-[28px] soft-shadow p-6 min-h-[600px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="flex items-center gap-2 text-xl font-bold text-graphite-dark">
                                    <Barbell size={24} className="text-performance-green" weight="duotone" />
                                    Treinos
                                </h3>
                                {splits.length === 0 && (
                                    <button
                                        onClick={handleAddSplit}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
                                    >
                                        Criar periodização semanal
                                    </button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                                {splits.map(split => (
                                    <div
                                        key={split.id}
                                        onClick={() => setActiveSplitId(split.id)}
                                        className={`
                                            relative flex items-center gap-3 px-5 py-3 rounded-2xl cursor-pointer transition-all border
                                            ${activeSplitId === split.id
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        <span className="font-bold whitespace-nowrap">{split.title}</span>
                                        <button
                                            onClick={(e) => handleRemoveSplit(split.id, e)}
                                            className={`p-1 rounded-full transition-colors ${activeSplitId === split.id ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                                        >
                                            <X size={12} weight="bold" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddSplit}
                                    className="px-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-performance-green hover:text-performance-green transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} weight="bold" />
                                    Novo Treino
                                </button>
                            </div>

                            {activeSplitId ? (
                                <div className="animate-fade-in space-y-4">
                                    {/* Selection Toggle */}
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <Heart size={20} weight="fill" className="text-performance-green" />
                                            <h3 className="font-extrabold text-graphite-dark text-xl uppercase tracking-tighter italic">Exercícios</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={toggleSelectionMode}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isSelectionMode ? 'bg-performance-green text-white shadow-lg shadow-performance-green/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                <CheckCircle size={16} weight={isSelectionMode ? "fill" : "bold"} />
                                                {isSelectionMode ? 'Modo Seleção Ativo' : 'Selecionar Vários'}
                                            </button>

                                            {isSelectionMode && (
                                                <button
                                                    onClick={selectAllExercises}
                                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all flex items-center gap-2"
                                                >
                                                    <CheckCircle size={16} weight="bold" className="text-performance-green" />
                                                    Selecionar Todos
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {splits.find(s => s.id === activeSplitId)?.items.map((item, index) => (
                                        <div key={item.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:border-performance-green/30 transition-all">
                                            {/* Card Header */}
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-3">
                                                    {isSelectionMode && (
                                                        <button
                                                            onClick={() => toggleExerciseSelection(item.id)}
                                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedExerciseIds.includes(item.id) ? 'bg-performance-green border-performance-green text-white' : 'border-slate-200 bg-white'}`}
                                                        >
                                                            {selectedExerciseIds.includes(item.id) && <CheckCircle size={14} weight="fill" />}
                                                        </button>
                                                    )}
                                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100">
                                                        {index + 1}
                                                    </div>
                                                    <h4 className="font-extrabold text-graphite-dark text-lg">{item.name}</h4>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    {/* Superset Toggle */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Superset</span>
                                                        <button
                                                            onClick={() => updateExercise(activeSplitId, item.id, 'isSuperset', !item.isSuperset)}
                                                            className={`w-10 h-6 rounded-full p-1 transition-all ${item.isSuperset ? 'bg-amber-400' : 'bg-slate-200'}`}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${item.isSuperset ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </button>
                                                    </div>

                                                    <button onClick={() => removeExercise(activeSplitId, item.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                        <Trash size={20} weight="bold" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sets & Reps Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-performance-green" />
                                                        Séries Válidas
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-slate-700 outline-none focus:border-performance-green focus:bg-white transition-all"
                                                        value={item.sets}
                                                        onChange={(e) => updateExercise(activeSplitId, item.id, 'sets', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                        Aquecimento
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-slate-700 outline-none focus:border-performance-green focus:bg-white transition-all"
                                                        value={item.warmupSets}
                                                        onChange={(e) => updateExercise(activeSplitId, item.id, 'warmupSets', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                        Preparatórias
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-slate-700 outline-none focus:border-performance-green focus:bg-white transition-all"
                                                        value={item.preparatorySets}
                                                        onChange={(e) => updateExercise(activeSplitId, item.id, 'preparatorySets', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Repetições</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-slate-700 outline-none focus:border-performance-green focus:bg-white transition-all"
                                                        value={item.reps}
                                                        placeholder="Ex: 8-12"
                                                        onChange={(e) => updateExercise(activeSplitId, item.id, 'reps', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descanso (s)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-slate-700 outline-none focus:border-performance-green focus:bg-white transition-all"
                                                        value={item.restSeconds}
                                                        onChange={(e) => updateExercise(activeSplitId, item.id, 'restSeconds', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Advanced Techniques Section */}
                                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Técnicas Avançadas</h5>
                                                    <button
                                                        onClick={() => addTechnique(activeSplitId, item.id)}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-performance-green hover:underline transition-all"
                                                    >
                                                        <Plus size={14} weight="bold" />
                                                        Adicionar técnica
                                                    </button>
                                                </div>

                                                <div className="space-y-3">
                                                    {item.advancedTechniques.map((tech, tIdx) => (
                                                        <div key={tIdx} className="flex gap-3 items-start animate-in slide-in-from-top-2 duration-300">
                                                            <div className="w-1/3">
                                                                <select
                                                                    className="w-full bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 outline-none focus:border-performance-green shadow-sm"
                                                                    value={tech.type}
                                                                    onChange={(e) => updateTechnique(activeSplitId, item.id, tIdx, 'type', e.target.value)}
                                                                >
                                                                    {ADVANCED_TECHNIQUES.map(at => (
                                                                        <option key={at} value={at}>{at}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="flex-1">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Observações da técnica..."
                                                                    className="w-full bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 outline-none focus:border-performance-green shadow-sm"
                                                                    value={tech.notes}
                                                                    onChange={(e) => updateTechnique(activeSplitId, item.id, tIdx, 'notes', e.target.value)}
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => removeTechnique(activeSplitId, item.id, tIdx)}
                                                                className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors"
                                                            >
                                                                <Trash size={16} weight="bold" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {item.advancedTechniques.length === 0 && (
                                                        <p className="text-[10px] text-slate-300 font-bold italic text-center py-2">Nenhuma técnica selecionada</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* General Observations */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Observações do Exercício</label>
                                                <textarea
                                                    className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-medium text-slate-600 outline-none focus:border-performance-green focus:bg-white transition-all resize-none h-20"
                                                    placeholder="Dicas de execução, cadência, etc..."
                                                    value={item.notes}
                                                    onChange={(e) => updateExercise(activeSplitId, item.id, 'notes', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => setIsExerciseSelectorOpen(true)}
                                        className="w-full py-4 rounded-2xl bg-performance-green/10 text-performance-green-dark font-bold hover:bg-performance-green/20 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={20} weight="bold" />
                                        Adicionar Exercício
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    Selecione ou crie um treino p/ começar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Meta Info & Cardio (Takes 1/3 space) */}
                <div className="space-y-6">
                    {/* Info Box */}
                    <div className="bg-pure-white p-6 rounded-[24px] soft-shadow border border-slate-50">
                        <h3 className="flex items-center gap-2 text-md font-bold text-graphite-dark mb-4">
                            <User size={20} className="text-performance-green" weight="duotone" />
                            Informações
                        </h3>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Aluno</label>
                            <select
                                className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 transition-all cursor-pointer hover:bg-slate-100"
                                value={studentId}
                                onChange={e => setStudentId(e.target.value)}
                            >
                                <option value="">Selecione o aluno</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cardio Section */}
                    <div className="bg-pure-white p-6 rounded-[24px] soft-shadow border border-slate-50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="flex items-center gap-2 text-md font-bold text-graphite-dark">
                                <Heart size={20} className="text-rose-500" weight="duotone" />
                                Cardio
                            </h3>
                            <button className="text-slate-300 hover:text-performance-green transition-colors">
                                <Note size={18} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Período</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cardio.frequency === 'weekly' ? 'border-performance-green' : 'border-slate-300'}`}>
                                                {cardio.frequency === 'weekly' && <div className="w-2.5 h-2.5 rounded-full bg-performance-green anim-in fade-in" />}
                                            </div>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                checked={cardio.frequency === 'weekly'}
                                                onChange={() => setCardio({
                                                    ...cardio,
                                                    frequency: 'weekly',
                                                    days: WEEK_DAYS.map(d => d.id)
                                                })}
                                            />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">Semanal</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cardio.frequency === 'daily' ? 'border-performance-green' : 'border-slate-300'}`}>
                                                {cardio.frequency === 'daily' && <div className="w-2.5 h-2.5 rounded-full bg-performance-green anim-in fade-in" />}
                                            </div>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                checked={cardio.frequency === 'daily'}
                                                onChange={() => setCardio({ ...cardio, frequency: 'daily' })}
                                            />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">Diário</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-right">Unidade de tempo</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cardio.unit === 'minutes' ? 'border-performance-green' : 'border-slate-300'}`}>
                                                {cardio.unit === 'minutes' && <div className="w-2.5 h-2.5 rounded-full bg-performance-green anim-in fade-in" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={cardio.unit === 'minutes'} onChange={() => setCardio({ ...cardio, unit: 'minutes' })} />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">Minutos</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cardio.unit === 'hours' ? 'border-performance-green' : 'border-slate-300'}`}>
                                                {cardio.unit === 'hours' && <div className="w-2.5 h-2.5 rounded-full bg-performance-green anim-in fade-in" />}
                                            </div>
                                            <input type="radio" className="hidden" checked={cardio.unit === 'hours'} onChange={() => setCardio({ ...cardio, unit: 'hours' })} />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">Horas</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Dias da semana</label>
                                <div className="flex flex-wrap gap-2">
                                    {WEEK_DAYS.map(day => {
                                        const isSelected = cardio.days.includes(day.id);
                                        return (
                                            <button
                                                key={day.id}
                                                onClick={() => toggleDay(day.id)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isSelected ? 'bg-performance-green text-graphite-dark border-performance-green shadow-sm shadow-emerald-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                            >
                                                {day.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cardio.mode === 'equal' ? 'border-performance-green' : 'border-slate-300'}`}>
                                            {cardio.mode === 'equal' && <div className="w-2.5 h-2.5 rounded-full bg-performance-green anim-in fade-in" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={cardio.mode === 'equal'} onChange={() => setCardio({ ...cardio, mode: 'equal' })} />
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Mesmo tempo para todos os dias</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${cardio.mode === 'individual' ? 'border-performance-green' : 'border-slate-300'}`}>
                                            {cardio.mode === 'individual' && <div className="w-2.5 h-2.5 rounded-full bg-performance-green anim-in fade-in" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={cardio.mode === 'individual'} onChange={() => setCardio({ ...cardio, mode: 'individual' })} />
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Tempo individual por dia</span>
                                    </label>
                                </div>
                            </div>

                            {cardio.mode === 'equal' ? (
                                <div className="animate-in fade-in duration-300">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Tempo {cardio.frequency === 'weekly' ? 'Semanal' : 'Diário'} ({cardio.unit === 'minutes' ? 'minutos' : 'horas'})
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="00:00"
                                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-performance-green focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-200"
                                        value={cardio.duration}
                                        onChange={(e) => setCardio({ ...cardio, duration: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tempo por dia ({cardio.unit === 'minutes' ? 'minutos' : 'horas'}):</label>
                                    {WEEK_DAYS.filter(d => cardio.days.includes(d.id)).map(day => (
                                        <div key={day.id} className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                                            <span className="text-xs font-bold text-slate-500">{day.label}:</span>
                                            <input
                                                type="number"
                                                placeholder="00:00"
                                                className="w-24 bg-white p-2 rounded-xl border border-slate-100 font-bold text-right outline-none focus:border-performance-green transition-all"
                                                value={cardio.individualTimes[day.id] || ''}
                                                onChange={(e) => setCardio({
                                                    ...cardio,
                                                    individualTimes: { ...cardio.individualTimes, [day.id]: e.target.value }
                                                })}
                                            />
                                        </div>
                                    ))}
                                    {cardio.days.length === 0 && (
                                        <p className="text-[10px] text-slate-300 font-bold italic text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">Selecione os dias acima p/ definir os tempos</p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Observações</label>
                                <textarea
                                    className="w-full min-h-[80px] p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-performance-green focus:bg-white transition-all resize-none text-sm font-medium text-slate-600 placeholder:text-slate-300"
                                    placeholder="Digite observações sobre o cardio (opcional)"
                                    value={cardio.observations}
                                    onChange={(e) => setCardio({ ...cardio, observations: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Observations */}
                    <div className="bg-pure-white p-6 rounded-[24px] soft-shadow border border-slate-50">
                        <h3 className="flex items-center gap-2 text-md font-bold text-graphite-dark mb-4">
                            <Note size={20} className="text-amber-500" weight="duotone" />
                            Observações Gerais
                        </h3>
                        <textarea
                            className="w-full min-h-[120px] p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:border-performance-green focus:bg-white transition-all resize-y text-slate-600"
                            placeholder="Orientações gerais sobre o treino, aguecimento, etc..."
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <ExerciseSelector
                isOpen={isExerciseSelectorOpen}
                onClose={() => setIsExerciseSelectorOpen(false)}
                onSelectExercises={handleAddExercises}
                exercises={exercises}
            />

            {/* Bulk Action Bar */}
            {isSelectionMode && selectedExerciseIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-2 pl-6 rounded-[32px] shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-performance-green flex items-center justify-center text-xs font-black text-white shadow-lg shadow-performance-green/30">
                            {selectedExerciseIds.length}
                        </div>
                        <span className="text-[12px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">itens selecionados</span>
                    </div>

                    <div className="h-8 w-[1px] bg-slate-800" />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsBulkEditModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-2xl transition-all text-sm font-bold text-white group"
                        >
                            <Note size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" weight="fill" />
                            Editar
                        </button>

                        <div className="relative group/move">
                            <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-2xl transition-all text-sm font-bold text-white group">
                                <Plus size={18} className="text-performance-green group-hover:scale-110 transition-transform" weight="bold" />
                                Mover
                            </button>
                            <div className="absolute bottom-full left-0 mb-4 bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-2xl opacity-0 invisible group-hover/move:opacity-100 group-hover/move:visible transition-all flex flex-col gap-1 min-w-[160px]">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1">Mover para:</span>
                                {splits.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleBulkMove(s.id)}
                                        className="text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-performance-green/10 hover:text-performance-green transition-all"
                                    >
                                        {s.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsBulkDeleteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-rose-500/10 rounded-2xl transition-all text-sm font-bold text-rose-500 group"
                        >
                            <Trash size={18} className="group-hover:shake transition-transform" weight="bold" />
                            Excluir
                        </button>
                    </div>

                    <div className="h-8 w-[1px] bg-slate-800 ml-2" />

                    <button
                        onClick={() => setSelectedExerciseIds([])}
                        className="p-3 text-slate-500 hover:text-white transition-colors"
                        title="Deselecionar todos"
                    >
                        <X size={20} weight="bold" />
                    </button>
                </div>
            )}
            {/* Bulk Edit Modal */}
            {isBulkEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Editar em massa</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Alterando {selectedExerciseIds.length} itens selecionados
                                </p>
                            </div>
                            <button
                                onClick={() => setIsBulkEditModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                            >
                                <X size={20} weight="bold" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Sets Grid */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Séries Válidas</label>
                                    <input
                                        type="number"
                                        placeholder="Manter"
                                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-performance-green focus:bg-white transition-all"
                                        value={bulkEditValues.sets}
                                        onChange={e => setBulkEditValues({ ...bulkEditValues, sets: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aquecimento</label>
                                    <input
                                        type="number"
                                        placeholder="Manter"
                                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-performance-green focus:bg-white transition-all"
                                        value={bulkEditValues.warmupSets}
                                        onChange={e => setBulkEditValues({ ...bulkEditValues, warmupSets: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preparatórias</label>
                                    <input
                                        type="number"
                                        placeholder="Manter"
                                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-performance-green focus:bg-white transition-all"
                                        value={bulkEditValues.preparatorySets}
                                        onChange={e => setBulkEditValues({ ...bulkEditValues, preparatorySets: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Other Grid */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repetições</label>
                                    <input
                                        placeholder="Manter"
                                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-performance-green focus:bg-white transition-all"
                                        value={bulkEditValues.reps}
                                        onChange={e => setBulkEditValues({ ...bulkEditValues, reps: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descanso (s)</label>
                                    <input
                                        type="number"
                                        placeholder="Manter"
                                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-performance-green focus:bg-white transition-all"
                                        value={bulkEditValues.restSeconds}
                                        onChange={e => setBulkEditValues({ ...bulkEditValues, restSeconds: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RPE (1-10)</label>
                                    <input
                                        type="number"
                                        placeholder="Manter"
                                        className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold outline-none focus:border-performance-green focus:bg-white transition-all"
                                        value={bulkEditValues.rpe}
                                        onChange={e => setBulkEditValues({ ...bulkEditValues, rpe: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const updates: any = {};
                                    if (bulkEditValues.sets) updates.sets = Number(bulkEditValues.sets);
                                    if (bulkEditValues.warmupSets) updates.warmupSets = Number(bulkEditValues.warmupSets);
                                    if (bulkEditValues.preparatorySets) updates.preparatorySets = Number(bulkEditValues.preparatorySets);
                                    if (bulkEditValues.reps) updates.reps = bulkEditValues.reps;
                                    if (bulkEditValues.restSeconds) updates.restSeconds = Number(bulkEditValues.restSeconds);
                                    if (bulkEditValues.rpe) updates.rpe = Number(bulkEditValues.rpe);
                                    handleBulkEdit(updates);
                                    setIsBulkEditModalOpen(false);
                                    setBulkEditValues({ sets: '', warmupSets: '', preparatorySets: '', reps: '', restSeconds: '', rpe: '' });
                                }}
                                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black shadow-xl hover:bg-black transition-all active:scale-95"
                            >
                                Aplicar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {isBulkDeleteModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-6 text-rose-500">
                            <Trash size={40} weight="duotone" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Confirmar Exclusão</h3>
                        <p className="text-slate-500 font-medium mb-8">
                            Deseja realmente excluir os <span className="text-rose-500 font-black">{selectedExerciseIds.length}</span> exercícios selecionados? Esta ação não pode ser desfeita.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsBulkDeleteModalOpen(false)}
                                className="py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="py-4 rounded-2xl bg-rose-500 text-white font-black shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {confirmationModal && (
                <ConfirmationModal
                    isOpen={confirmationModal.isOpen}
                    onClose={() => setConfirmationModal(null)}
                    onConfirm={confirmationModal.onConfirm}
                    title={confirmationModal.title}
                    description={confirmationModal.description}
                    variant={confirmationModal.variant}
                    confirmText={confirmationModal.confirmText}
                    cancelText={confirmationModal.cancelText}
                    isLoading={confirmationModal.isLoading}
                />
            )}
        </div>
    );
}

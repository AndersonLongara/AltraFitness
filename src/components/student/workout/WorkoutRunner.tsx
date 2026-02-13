'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Timer, VideoCamera, Info, X } from "@phosphor-icons/react";
import { logSet, finishWorkout } from "@/app/actions/workout-execution";

interface WorkoutRunnerProps {
    logId: string;
    workout: {
        id: string;
        title: string;
        items: {
            id: string;
            exerciseId: string;
            exercise: { name: string; videoUrl?: string | null };
            sets: number;
            reps: string;
            restSeconds?: number | null;
            notes?: string | null;
            [key: string]: unknown;
        }[];
        [key: string]: unknown;
    };
    initialLogSets?: {
        exerciseId: string;
        setNumber: number;
        weight: number | null;
        completed: boolean | null;
        reps: number;
        [key: string]: unknown;
    }[];
}

export default function WorkoutRunner({ logId, workout, initialLogSets = [] }: WorkoutRunnerProps) {
    const router = useRouter();
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [setsData, setSetsData] = useState<Record<string, { weight: number | string, reps: number | string, completed: boolean }[]>>({});
    const [isResting, setIsResting] = useState(false);
    const [restTimeLeft, setRestTimeLeft] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const currentItem = workout.items[currentExerciseIndex];

    // Initialize state with rehydration logic
    useEffect(() => {
        const initialData: typeof setsData = {};

        workout.items.forEach(item => {
            const itemSets = Array(item.sets).fill(null).map((_, index) => {
                const setNumber = index + 1;
                // Find existing log for this exercise and set number
                const loggedSet = initialLogSets.find(s => s.exerciseId === item.exerciseId && s.setNumber === setNumber);

                if (loggedSet) {
                    return {
                        weight: loggedSet.weight || '',
                        reps: loggedSet.reps || '',
                        completed: loggedSet.completed || false
                    };
                }

                return { weight: '', reps: '', completed: false };
            });
            initialData[item.id] = itemSets;
        });

        setSetsData(initialData);

        // Optional: Jump to first incomplete exercise
        const firstIncompleteIndex = workout.items.findIndex(item => {
            const itemSets = initialLogSets.filter(s => s.exerciseId === item.exerciseId);
            return itemSets.length < item.sets || itemSets.some(s => !s.completed);
        });

        if (firstIncompleteIndex !== -1) {
            setCurrentExerciseIndex(firstIncompleteIndex);
        }

    }, [workout, initialLogSets]);

    // Timer Logic
    useEffect(() => {
        if (isResting && restTimeLeft > 0) {
            timerRef.current = setTimeout(() => setRestTimeLeft(prev => prev - 1), 1000);
        } else if (restTimeLeft === 0 && isResting) {
            setIsResting(false);
            // Play sound?
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isResting, restTimeLeft]);

    const handleSetUpdate = (itemId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
        setSetsData(prev => ({
            ...prev,
            [itemId]: prev[itemId].map((s, i) => i === setIndex ? { ...s, [field]: value } : s)
        }));
    };

    const handleCompleteSet = async (itemId: string, setIndex: number) => {
        const set = setsData[itemId][setIndex];
        // Optimistic update
        setSetsData(prev => ({
            ...prev,
            [itemId]: prev[itemId].map((s, i) => i === setIndex ? { ...s, completed: true } : s)
        }));

        // Start Rest Timer
        if (currentItem.restSeconds) {
            setRestTimeLeft(currentItem.restSeconds);
            setIsResting(true);
        }

        // Server Action
        await logSet(logId, currentItem.exerciseId, setIndex + 1, {
            weight: Number(set.weight) || 0,
            reps: Number(set.reps) || 0
        });

        // Auto Advance? Maybe not, keep user in control.
    };

    const handleFinish = async () => {
        if (!confirm("Tem certeza que deseja finalizar o treino?")) return;
        setIsFinishing(true);
        await finishWorkout(logId);
        router.push('/student'); // Or a summary page
    };

    const progress = ((currentExerciseIndex) / workout.items.length) * 100;

    return (
        <div className="min-h-screen bg-deep-black flex flex-col text-white font-primary">
            {/* Header */}
            <div className="bg-surface-grey/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-white/5 z-20 sticky top-0">
                <button onClick={() => router.back()} className="text-zinc-400 hover:text-white">
                    <X size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-acid-lime uppercase tracking-widest shadow-[0_0_10px_rgba(189,255,0,0.2)]">Treino em Andamento</span>
                    <span className="font-bold text-white text-sm">{workout.title}</span>
                </div>
                <button
                    onClick={handleFinish}
                    className="bg-acid-lime/10 text-acid-lime border border-acid-lime/20 px-3 py-1 rounded-lg text-xs font-bold hover:bg-acid-lime/20 transition-colors"
                    disabled={isFinishing}
                >
                    {isFinishing ? '...' : 'Finalizar'}
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-white/5 w-full">
                <div className="h-full bg-acid-lime shadow-[0_0_10px_rgba(189,255,0,0.5)] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {/* Active Exercise */}
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-2xl font-black text-white leading-tight">
                            {currentItem?.exercise.name}
                        </h1>
                        <div className="text-right">
                            <div className="text-3xl font-black text-zinc-700">
                                {currentExerciseIndex + 1}<span className="text-lg text-zinc-800">/{workout.items.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex gap-2 mb-8">
                        {currentItem?.exercise.videoUrl && (
                            <button
                                onClick={() => window.open(currentItem.exercise.videoUrl ?? undefined, '_blank')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors"
                            >
                                <VideoCamera weight="fill" /> Vídeo
                            </button>
                        )}
                        {currentItem?.notes && (
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs font-bold">
                                <Info weight="fill" /> Notas
                            </button>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-grey text-zinc-400 border border-white/5 rounded-lg text-xs font-bold ml-auto">
                            <Timer weight="bold" /> {currentItem?.restSeconds}s
                        </div>
                    </div>

                    {/* Sets */}
                    <div className="space-y-3">
                        {setsData[currentItem?.id]?.map((set, index) => (
                            <div key={index} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${set.completed ? 'bg-acid-lime/5 border-acid-lime/30' : 'bg-surface-grey border-white/5'}`}>
                                <div className="w-8 h-8 flex items-center justify-center font-bold text-zinc-600 text-sm">
                                    {index + 1}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="kg"
                                            value={set.weight}
                                            onChange={(e) => handleSetUpdate(currentItem.id, index, 'weight', e.target.value)}
                                            disabled={set.completed}
                                            className="w-full bg-deep-black border border-white/10 rounded-xl py-3 px-3 text-center font-bold text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-acid-lime focus:border-acid-lime outline-none transition-all"
                                        />
                                        <span className="absolute right-2 top-3.5 text-[10px] font-bold text-zinc-600">KG</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder={currentItem.reps} // Suggest target reps
                                            value={set.reps}
                                            onChange={(e) => handleSetUpdate(currentItem.id, index, 'reps', e.target.value)}
                                            disabled={set.completed}
                                            className="w-full bg-deep-black border border-white/10 rounded-xl py-3 px-3 text-center font-bold text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-acid-lime focus:border-acid-lime outline-none transition-all"
                                        />
                                        <span className="absolute right-2 top-3.5 text-[10px] font-bold text-zinc-600">REPS</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !set.completed && handleCompleteSet(currentItem.id, index)}
                                    disabled={set.completed}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${set.completed ? 'bg-acid-lime text-black border-acid-lime shadow-[0_0_15px_rgba(189,255,0,0.4)]' : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <Check weight="bold" size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="bg-deep-black/80 backdrop-blur-xl border-t border-white/5 p-6 pb-12 flex items-center justify-between gap-6 fixed bottom-0 left-0 right-0 z-30">
                <button
                    onClick={() => setCurrentExerciseIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentExerciseIndex === 0}
                    className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 disabled:opacity-20 hover:bg-white/5 hover:text-white transition-all"
                >
                    Anterior
                </button>

                {/* Rest Timer Overlay */}
                {isResting && (
                    <div className="fixed inset-0 bg-deep-black/95 z-50 flex flex-col items-center justify-center backdrop-blur-2xl animate-in fade-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-acid-lime/20 blur-[100px] rounded-full animate-pulse" />
                            <div className="relative flex flex-col items-center">
                                <span className="text-acid-lime text-xs font-black uppercase tracking-[0.3em] mb-8 drop-shadow-[0_0_10px_rgba(189,255,0,0.5)]">Descanso Ativo</span>
                                <div className="text-[120px] font-black text-white font-mono leading-none tracking-tighter mb-12">
                                    {restTimeLeft.toString().padStart(2, '0')}<span className="text-4xl text-zinc-700 ml-2">s</span>
                                </div>
                                <button
                                    onClick={() => setIsResting(false)}
                                    className="bg-white/5 text-white border border-white/10 px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all hover:scale-110 active:scale-95 shadow-2xl"
                                >
                                    Pular Descanso
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setCurrentExerciseIndex(prev => Math.min(workout.items.length - 1, prev + 1))}
                    disabled={currentExerciseIndex === workout.items.length - 1}
                    className="flex-1 bg-acid-lime text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(189,255,0,0.2)] hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                >
                    Próximo Exercício
                </button>
            </div>
        </div>
    );
}

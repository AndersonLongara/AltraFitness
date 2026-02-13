"use client";

import { Check, VideoCamera } from "@phosphor-icons/react";
import { useState } from "react";

interface SetData {
    id: number;
    reps: string;
    weight?: number;
    completed: boolean;
}

interface ExerciseCardProps {
    exercise: {
        id: string;
        name: string;
        muscleGroup: string;
        videoUrl?: string | null;
        sets: number;
        reps: string; // target reps
        restSeconds?: number;
    };
    onSetComplete: (restSeconds: number) => void;
}

export default function ExerciseCard({ exercise, onSetComplete }: ExerciseCardProps) {
    // Initialize sets state
    const [sets, setSets] = useState<SetData[]>(
        Array.from({ length: exercise.sets }).map((_, i) => ({
            id: i + 1,
            reps: exercise.reps, // Default to target
            weight: 0,
            completed: false
        }))
    );

    const toggleSet = (index: number) => {
        const newSets = [...sets];
        const isCompleting = !newSets[index].completed;

        newSets[index].completed = isCompleting;
        setSets(newSets);

        if (isCompleting && exercise.restSeconds) {
            onSetComplete(exercise.restSeconds);
        }
    };

    const updateWeight = (index: number, weight: string) => {
        const newSets = [...sets];
        newSets[index].weight = parseFloat(weight) || 0;
        setSets(newSets);
    };

    return (
        <div className="bg-pure-white rounded-3xl soft-shadow overflow-hidden mb-6">
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
                <div>
                    <span className="text-xs font-bold text-performance-green uppercase tracking-widest bg-emerald-50 px-2 py-2 rounded-xl">
                        {exercise.muscleGroup}
                    </span>
                    <h3 className="text-xl font-extrabold text-graphite-dark mt-2 leading-tight">
                        {exercise.name}
                    </h3>
                </div>
                {exercise.videoUrl && (
                    <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-4 bg-slate-50 text-performance-green rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <VideoCamera size={24} weight="duotone" />
                    </a>
                )}
            </div>

            {/* Sets Header */}
            <div className="grid grid-cols-10 gap-2 px-6 py-4 bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                <div className="col-span-2">Set</div>
                <div className="col-span-3">Kg</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-2">Feito</div>
            </div>

            {/* Sets List */}
            <div className="divide-y divide-slate-50">
                {sets.map((set, index) => (
                    <div
                        key={set.id}
                        className={`grid grid-cols-10 gap-4 px-6 py-4 items-center transition-colors ${set.completed ? 'bg-emerald-50/30' : ''}`}
                    >
                        <div className="col-span-2 text-center">
                            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 font-bold text-sm">
                                {set.id}
                            </span>
                        </div>

                        <div className="col-span-3">
                            <input
                                type="number"
                                placeholder="0"
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-center font-bold text-slate-700 outline-none focus:border-performance-green transition-colors"
                                value={set.weight || ''}
                                onChange={(e) => updateWeight(index, e.target.value)}
                            />
                        </div>

                        <div className="col-span-3 text-center">
                            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-center font-bold text-slate-500 text-sm">
                                {set.reps}
                            </div>
                        </div>

                        <div className="col-span-2 flex justify-center">
                            <button
                                onClick={() => toggleSet(index)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${set.completed
                                    ? 'bg-performance-green text-white shadow-emerald-200 scale-105'
                                    : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                    }`}
                            >
                                <Check size={20} weight="bold" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

"use client";

import { useState, useTransition } from "react";
import { X, FloppyDisk, Trash, Image as ImageIcon, VideoCamera, Barbell } from "@phosphor-icons/react";
import { createExercise, updateExercise, deleteExercise } from "@/app/actions/exercises";
import { MUSCLE_GROUPS } from "@/lib/exercise-categories";

interface Exercise {
    id: string;
    trainerId: string | null;
    name: string;
    muscleGroup: string;
    videoUrl: string | null;
    imageUrl?: string | null;
    description: string | null;
}

interface ExerciseModalProps {
    exercise?: Exercise | null;
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

export default function ExerciseModal({ exercise, isOpen, onClose, onSaved }: ExerciseModalProps) {
    const isEditing = !!exercise;
    const isSystemExercise = exercise ? !exercise.trainerId : false;

    const [name, setName] = useState(exercise?.name || '');
    const [muscleGroup, setMuscleGroup] = useState(exercise?.muscleGroup || 'Peito');
    const [videoUrl, setVideoUrl] = useState(exercise?.videoUrl || '');
    const [imageUrl, setImageUrl] = useState(exercise?.imageUrl || '');
    const [description, setDescription] = useState(exercise?.description || '');
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) {
            setError('O nome é obrigatório.');
            return;
        }
        setError('');

        startTransition(async () => {
            try {
                if (isEditing && exercise) {
                    await updateExercise(exercise.id, {
                        name: name.trim(),
                        muscleGroup,
                        videoUrl: videoUrl.trim() || null,
                        imageUrl: imageUrl.trim() || null,
                        description: description.trim() || null,
                    });
                } else {
                    await createExercise({
                        name: name.trim(),
                        muscleGroup,
                        videoUrl: videoUrl.trim() || null,
                        imageUrl: imageUrl.trim() || null,
                        description: description.trim() || null,
                    });
                }
                onSaved?.();
                onClose();
            } catch (err: any) {
                setError(err.message || 'Erro ao salvar exercício.');
            }
        });
    };

    const handleDelete = () => {
        if (!exercise) return;
        startTransition(async () => {
            try {
                await deleteExercise(exercise.id);
                onSaved?.();
                onClose();
            } catch (err: any) {
                setError(err.message || 'Erro ao excluir exercício.');
                setShowDeleteConfirm(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#1E2A36] rounded-3xl shadow-2xl dark:shadow-none border border-slate-200 dark:border-white/10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Barbell size={22} weight="bold" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-graphite-dark dark:text-white">
                                {isEditing ? 'Editar Exercício' : 'Novo Exercício'}
                            </h2>
                            {isSystemExercise && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    Exercício do sistema — será salva uma cópia personalizada
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <X size={22} weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            Nome do Exercício *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Supino Reto com Barra"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {/* Muscle Group */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            Grupo Muscular *
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {MUSCLE_GROUPS.map((group) => (
                                <button
                                    key={group}
                                    type="button"
                                    onClick={() => setMuscleGroup(group)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                                        muscleGroup === group
                                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30'
                                            : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {group}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Video URL */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            <span className="flex items-center gap-2">
                                <VideoCamera size={16} weight="bold" />
                                Link do Vídeo
                            </span>
                        </label>
                        <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            <span className="flex items-center gap-2">
                                <ImageIcon size={16} weight="bold" />
                                URL da Foto
                            </span>
                        </label>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://exemplo.com/foto.jpg"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 transition-colors"
                        />
                        {imageUrl && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="w-full h-32 object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">
                            Descrição / Instruções
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva a execução do exercício..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-400 dark:focus:border-emerald-500/50 transition-colors resize-none"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-rose-500 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-xl">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                    {/* Delete button (only for own exercises, not system) */}
                    {isEditing && !isSystemExercise ? (
                        showDeleteConfirm ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tem certeza?</span>
                                <button
                                    onClick={handleDelete}
                                    disabled={isPending}
                                    className="px-3 py-2 text-xs font-bold text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
                                >
                                    Excluir
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                title="Excluir exercício"
                            >
                                <Trash size={20} weight="bold" />
                            </button>
                        )
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isPending || !name.trim()}
                            className="px-6 py-2.5 bg-emerald-500 dark:bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 dark:shadow-none"
                        >
                            <FloppyDisk size={18} weight="bold" />
                            {isPending ? 'Salvando...' : isEditing ? (isSystemExercise ? 'Salvar Cópia' : 'Salvar') : 'Criar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, ReactNode } from "react";
import { PlayCircle, PencilSimple, Image as ImageIcon } from "@phosphor-icons/react";

interface ExerciseCardProps {
    name: string;
    muscleGroup: string;
    videoUrl?: string | null;
    imageUrl?: string | null;
    icon: ReactNode;
    accentColor: string;
    bgColor: string;
    onEdit?: () => void;
}

function isValidUrl(url: string): boolean {
    try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

export default function ExerciseCard({ name, muscleGroup, videoUrl, imageUrl, icon, accentColor, bgColor, onEdit }: ExerciseCardProps) {
    const [imgError, setImgError] = useState(false);
    const showImage = imageUrl && isValidUrl(imageUrl) && !imgError;

    return (
        <div className="bg-pure-white dark:bg-[#1E2A36] rounded-2xl soft-shadow border border-slate-100 dark:border-white/10 hover:border-emerald-100 dark:hover:border-emerald-500/30 transition-colors overflow-hidden group">
            {/* Image preview */}
            {showImage && (
                <div className="relative h-32 w-full bg-slate-100 dark:bg-white/5">
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                </div>
            )}

            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors ${bgColor} ${accentColor}`}>
                        {icon}
                    </div>
                    <div className="min-w-0">
                        <h4 className="font-bold text-graphite-dark dark:text-white truncate">{name}</h4>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {muscleGroup}
                            </span>
                            {showImage && (
                                <ImageIcon size={12} weight="bold" className="text-slate-300 dark:text-slate-600" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    {videoUrl && (
                        <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-300 dark:text-slate-500 hover:text-performance-green dark:hover:text-emerald-400 transition-colors"
                            title="Ver Vídeo"
                        >
                            <PlayCircle size={28} weight="fill" />
                        </a>
                    )}
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-slate-300 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Editar exercício"
                        >
                            <PencilSimple size={20} weight="bold" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

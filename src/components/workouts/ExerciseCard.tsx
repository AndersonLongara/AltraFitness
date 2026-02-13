"use client";

import { ReactNode } from "react";
import { PlayCircle } from "@phosphor-icons/react";

interface ExerciseCardProps {
    name: string;
    muscleGroup: string;
    videoUrl?: string | null;
    icon: ReactNode;
    accentColor: string;
    bgColor: string;
}

export default function ExerciseCard({ name, muscleGroup, videoUrl, icon, accentColor, bgColor }: ExerciseCardProps) {
    return (
        <div className="bg-pure-white p-4 rounded-2xl soft-shadow border border-slate-100 hover:border-emerald-100 transition-colors flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${bgColor} ${accentColor}`}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold text-graphite-dark">{name}</h4>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {muscleGroup}
                    </span>
                </div>
            </div>

            {videoUrl && (
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-300 hover:text-performance-green transition-colors"
                    title="Ver Vídeo"
                >
                    <PlayCircle size={32} weight="fill" />
                </a>
            )}
        </div>
    );
}

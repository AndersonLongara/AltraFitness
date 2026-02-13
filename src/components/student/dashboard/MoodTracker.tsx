'use client';

import { useState } from "react";
import { Smiley, Fire, SmileySad, SmileyMeh, FirstAid } from "@phosphor-icons/react";
import { logMood } from "@/app/actions/gamification";

export default function MoodTracker() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const moods = [
        { id: 'motivated', icon: Fire, label: "Motivado", color: "text-orange-500", bg: "bg-orange-50" },
        { id: 'happy', icon: Smiley, label: "Bem", color: "text-emerald-500", bg: "bg-emerald-50" },
        { id: 'neutral', icon: SmileyMeh, label: "Normal", color: "text-slate-500", bg: "bg-slate-50" },
        { id: 'tired', icon: SmileySad, label: "Cansado", color: "text-blue-500", bg: "bg-blue-50" },
        { id: 'sore', icon: FirstAid, label: "Dolorido", color: "text-red-500", bg: "bg-red-50" },
    ];

    const handleMoodSelect = async (moodId: string) => {
        setStatus('submitting');
        try {
            await logMood(moodId);
            setStatus('success');
        } catch (error) {
            console.error("Failed to log mood", error);
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white p-6 rounded-[24px] soft-shadow border border-slate-50 text-center animate-in fade-in zoom-in duration-300">
                <p className="text-sm font-bold text-slate-600">Obrigado por compartilhar! 😽</p>
                <p className="text-xs text-slate-400 mt-1">Isso ajuda seu treinador a ajustar seus treinos.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[24px] soft-shadow border border-slate-50">
            <h3 className="font-bold text-slate-700 mb-4 text-sm">Como você está se sentindo hoje?</h3>

            <div className="flex justify-between gap-1">
                {moods.map((mood) => {
                    const Icon = mood.icon;
                    return (
                        <button
                            key={mood.id}
                            onClick={() => handleMoodSelect(mood.id)}
                            disabled={status === 'submitting'}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 hover:bg-slate-50 flex-1`}
                        >
                            <div className={`w-10 h-10 ${mood.bg} ${mood.color} rounded-full flex items-center justify-center`}>
                                <Icon size={24} weight="duotone" />
                            </div>
                            <span className="text-[10px] font-medium text-slate-400">{mood.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

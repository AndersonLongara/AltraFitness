'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Smiley, Fire, SmileySad, SmileyMeh, FirstAid } from "@phosphor-icons/react";
import { logMood } from "@/app/actions/gamification";

const MOODS = [
    { id: 'motivated', icon: Fire, label: "Motivado", color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30" },
    { id: 'happy', icon: Smiley, label: "Bem", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
    { id: 'neutral', icon: SmileyMeh, label: "Normal", color: "text-zinc-400", bg: "bg-zinc-500/15", border: "border-white/10" },
    { id: 'tired', icon: SmileySad, label: "Cansado", color: "text-blue-400", bg: "bg-blue-500/15", border: "border-blue-500/30" },
    { id: 'sore', icon: FirstAid, label: "Dolorido", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
] as const;

function getMoodLabel(moodId: string) {
    return MOODS.find((m) => m.id === moodId)?.label ?? moodId;
}

interface MoodTrackerProps {
    todaysMood: string | null;
}

export default function MoodTracker({ todaysMood }: MoodTrackerProps) {
    const router = useRouter();
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(todaysMood ? 'success' : 'idle');
    const [selectedMood, setSelectedMood] = useState<string | null>(todaysMood);

    const handleMoodSelect = async (moodId: string) => {
        setStatus('submitting');
        try {
            await logMood(moodId);
            setSelectedMood(moodId);
            setStatus('success');
            router.refresh();
        } catch (error) {
            console.error("Failed to log mood", error);
            setStatus('idle');
        }
    };

    const displayMood = selectedMood ?? todaysMood;
    if (status === 'success' || displayMood) {
        const label = getMoodLabel(displayMood || '');
        return (
            <div className="bg-surface-grey p-5 rounded-3xl border border-white/10 text-center">
                <p className="text-sm font-bold text-white">Como está seu humor hoje?</p>
                <p className="text-acid-lime font-semibold text-base mt-1">{label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">Obrigado por compartilhar — isso ajuda seu treinador.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-grey p-5 rounded-3xl border border-white/10">
            <h3 className="font-bold text-white text-sm mb-4">Como está seu humor hoje?</h3>
            <div className="flex justify-between gap-1">
                {MOODS.map((mood) => {
                    const Icon = mood.icon;
                    return (
                        <button
                            key={mood.id}
                            onClick={() => handleMoodSelect(mood.id)}
                            disabled={status === 'submitting'}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all active:scale-95 hover:bg-white/5 border ${mood.border} flex-1 disabled:opacity-50`}
                        >
                            <div className={`w-10 h-10 ${mood.bg} ${mood.color} rounded-full flex items-center justify-center`}>
                                <Icon size={22} weight="duotone" />
                            </div>
                            <span className="text-[10px] font-medium text-zinc-400">{mood.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

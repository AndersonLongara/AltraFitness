'use client';

import Image from "next/image";
import { Fire } from "@phosphor-icons/react";

interface ProfileHeaderProps {
    name: string;
    photoUrl: string;
    level: number;
    currentXp: number;
    streak: number;
}

export default function ProfileHeader({ name, photoUrl, level, currentXp, streak }: ProfileHeaderProps) {
    const nextLevelXp = level * 1000;
    const progress = (currentXp % 1000) / 1000 * 100;

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-surface-grey border border-white/5 rounded-[32px] text-center relative overflow-hidden group shadow-2xl">
            {/* Background Decoration */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-acid-lime/10 to-transparent pointer-events-none"></div>

            <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full border-4 border-surface-grey shadow-2xl shadow-black/50 overflow-hidden relative z-10 group-hover:scale-105 transition-transform duration-500">
                    <Image
                        src={photoUrl || "/placeholder-user.jpg"}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-3 -right-3 bg-acid-lime text-black text-xs font-black px-3 py-1.5 rounded-full border-4 border-surface-grey shadow-lg z-20 flex items-center gap-1">
                    Lvl {level}
                </div>
            </div>

            <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{name}</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 mb-6 uppercase tracking-wider">
                <span className="flex items-center gap-1 text-orange-500">
                    <Fire weight="fill" size={16} /> {streak} dias
                </span>
                <span className="text-zinc-700">•</span>
                <span>{currentXp} XP Total</span>
            </div>

            {/* XP Progress */}
            <div className="w-full max-w-xs relative z-10">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                    <span>Nível {level}</span>
                    <span>{level + 1}</span>
                </div>
                <div className="h-2 w-full bg-deep-black rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-acid-lime shadow-[0_0_10px_rgba(189,255,0,0.5)] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 text-right font-medium">
                    <span className="text-white font-bold">{Math.round(1000 - (currentXp % 1000))} XP</span> para o próximo nível
                </div>
            </div>
        </div>
    );
}

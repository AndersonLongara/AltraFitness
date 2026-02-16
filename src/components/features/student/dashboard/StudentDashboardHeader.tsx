'use client';

import { Fire, Trophy } from "@phosphor-icons/react";

interface DashboardHeaderProps {
    firstName: string;
    userImage?: string;
    notificationCount?: number;
    currentStreak: number;
}

export default function StudentDashboardHeader({ firstName, userImage, notificationCount = 0, currentStreak }: DashboardHeaderProps) {
    return (
        <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full border-2 border-white/5 p-1 relative group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-acid-lime to-emerald-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
                    {/* Fallback or Image */}
                    <img
                        src={userImage || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                        alt="User"
                        className="w-full h-full rounded-full object-cover bg-surface-grey relative z-10"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-acid-lime rounded-full border-2 border-deep-black z-20 shadow-[0_0_5px_rgba(189,255,0,0.5)]"></div>
                </div>

                {/* Text */}
                <div>
                    <h1 className="text-xl font-black text-white leading-tight tracking-tight">
                        Olá, {firstName} 👋
                    </h1>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        Vamos evoluir hoje?
                    </p>
                </div>
            </div>

            {/* Icons Right */}
            <div className="flex items-center gap-3">
                <button className="w-12 h-12 rounded-2xl bg-surface-grey border border-white/5 flex items-center justify-center relative hover:bg-white/10 hover:border-white/10 transition-all group">
                    <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-grey transition-transform group-hover:scale-110"></div>
                    <span className="sr-only">Notificações</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#71717a" className="group-hover:fill-white transition-colors" viewBox="0 0 256 256"><path d="M216,192H40a8,8,0,0,1-6.88-12C37.06,173.67,64,136.2,64,96a64,64,0,0,1,128,0c0,40.2,26.94,77.67,30.88,84A8,8,0,0,1,216,192Zm-60,24a28,28,0,0,1-56,0Z" opacity="0.2"></path><path d="M216,192H176a40,40,0,0,1-80,0H40a8,8,0,0,1-6.88-12C37.06,173.67,64,136.2,64,96a64,64,0,0,1,128,0c0,40.2,26.94,77.67,30.88,84A8,8,0,0,1,216,192Zm-88,24a24,24,0,0,0,48,0H104A24.18,24.18,0,0,0,128,216ZM198.58,181.33C192.38,171.21,176,140.69,176,96a48,48,0,0,0-96,0c0,44.69-16.38,75.21-22.58,85.33A2.86,2.86,0,0,0,51.13,184l6.09,2.83,6.33-2.28L80,176h96l16.45,8.55,6.33,2.28,6.09-2.83A2.86,2.86,0,0,0,198.58,181.33Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M221.73,179,190.85,127.52l-.12-.19a64.12,64.12,0,0,0-9.28-11.75,8,8,0,1,0-12.22,10.38,47.38,47.38,0,0,1,6.77,8.57,1.85,1.85,0,0,1,0,1.94L144.18,192h71.82A8,8,0,0,0,221.73,179Z" opacity="0.2"></path><path d="M216,192H40a8,8,0,0,1-6.88-12C37.06,173.67,64,136.2,64,96a64,64,0,0,1,128,0c0,40.2,26.94,77.67,30.88,84A8,8,0,0,1,216,192Zm-135-16h94c-3.15-6.6-21.69-38.38-27.76-74.67a8,8,0,0,0-15.68,2.62c4.35,26.05,14.65,52,20,62.66l-1.63.76-22-10.27H81Zm87.42-3.11c5.1-9.69,14.65-35.65,19-61.69a8,8,0,0,0-15.8-2.67c-6,36.14-24.51,67.79-27.67,74.33Z" fill="currentColor"></path></svg>
                </button>

                <div className="w-12 h-12 rounded-2xl bg-surface-grey border border-white/5 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <Fire weight="fill" size={24} />
                </div>
            </div>
        </header>
    );
}

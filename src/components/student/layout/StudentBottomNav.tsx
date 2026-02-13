'use client';

import { House, Barbell, BowlFood, User } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentBottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/student' && pathname === '/student') return true;
        if (path !== '/student' && pathname.startsWith(path)) return true;
        return false;
    };

    const navItems = [
        {
            label: "Início",
            href: "/student",
            icon: House
        },
        {
            label: "Treinos",
            href: "/student/workouts",
            icon: Barbell
        },
        {
            label: "Dieta",
            href: "/student/nutrition",
            icon: BowlFood
        },
        {
            label: "Perfil",
            href: "/student/profile",
            icon: User
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 px-6 py-4 pb-8 md:hidden z-50 rounded-t-3xl backdrop-blur-xl">
            {/* Gradient fade from bottom if needed, but glass panel handles it */}
            <nav className="flex justify-between items-center max-w-sm mx-auto relative z-10">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-acid-lime scale-110' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-acid-lime/10 shadow-[0_0_15px_rgba(189,255,0,0.3)]' : 'bg-transparent'}`}>
                                <Icon size={24} weight={active ? "fill" : "duotone"} />
                            </div>
                            <span className={`text-[10px] font-bold ${active ? 'text-acid-lime' : 'text-zinc-600'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

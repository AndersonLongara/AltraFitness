'use client';

import { House, Barbell, BowlFood, ChartLineUp, User } from "@phosphor-icons/react";
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
        { label: "Início", href: "/student", icon: House },
        { label: "Treinos", href: "/student/workouts", icon: Barbell },
        { label: "Dieta", href: "/student/nutrition", icon: BowlFood },
        { label: "Evolução", href: "/student/evolution", icon: ChartLineUp },
        { label: "Perfil", href: "/student/profile", icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 px-4 py-3 pb-8 md:hidden z-50 rounded-t-3xl backdrop-blur-xl">
            <nav className="flex justify-between items-center max-w-md mx-auto relative z-10 gap-1">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 min-w-0 flex-1 transition-all duration-200 ${active ? 'text-acid-lime' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all duration-200 ${active ? 'bg-acid-lime/15 shadow-[0_0_12px_rgba(46,204,113,0.25)]' : 'bg-transparent hover:bg-white/5'}`}>
                                <Icon size={22} weight={active ? "fill" : "duotone"} />
                            </div>
                            <span className={`text-[9px] font-bold truncate w-full text-center ${active ? 'text-acid-lime' : 'text-zinc-500'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

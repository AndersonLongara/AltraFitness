"use client";

import {
    House,
    Barbell,
    BowlFood,
    ChartLineUp,
    User,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { icon: House, label: "Início", href: "/student" },
    { icon: Barbell, label: "Treinos", href: "/student/workouts" },
    { icon: BowlFood, label: "Dieta", href: "/student/nutrition" },
    { icon: ChartLineUp, label: "Evolução", href: "/student/evolution" },
    { icon: User, label: "Perfil", href: "/student/profile" },
];

export default function StudentSidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/student" && pathname === "/student") return true;
        if (href !== "/student" && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <aside className="hidden md:flex flex-col w-24 h-screen bg-[#0D1117] fixed left-0 top-0 border-r border-white/5 z-50 py-8 items-center justify-between">
            {/* Logo */}
            <div className="w-12 h-12 bg-acid-lime rounded-xl flex items-center justify-center text-deep-black font-extrabold text-xl">
                A.
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-6">
                {navItems.map((item, idx) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            className={`p-2.5 rounded-2xl transition-all duration-300 group relative ${
                                active
                                    ? "bg-acid-lime text-deep-black shadow-lg shadow-acid-lime/20"
                                    : "text-zinc-600 hover:bg-white/5 hover:text-acid-lime"
                            }`}
                        >
                            <item.icon size={28} weight={active ? "fill" : "duotone"} />

                            {/* Tooltip */}
                            <span className="absolute left-16 bg-white text-deep-black text-xs font-bold py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom spacer */}
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <span className="text-zinc-600 text-[10px] font-bold">🏋️</span>
            </div>
        </aside>
    );
}

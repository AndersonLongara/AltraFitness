"use client";

import {
    House,
    Users,
    Barbell,
    Cookie,
    ChartLine,
    Gear,
    Funnel,
    ClipboardText,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { icon: House, label: "Início", href: "/dashboard" },
    { icon: Funnel, label: "Vendas", href: "/dashboard/sales" },
    { icon: Users, label: "Alunos", href: "/dashboard/students" },
    { icon: Barbell, label: "Treinos", href: "/dashboard/workouts" },
    { icon: Cookie, label: "Nutrição", href: "/dashboard/nutrition" },
    { icon: ClipboardText, label: "Formulários", href: "/dashboard/forms" },
    { icon: ChartLine, label: "Financeiro", href: "/dashboard/financial" },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        // Special case: Diet editing routes inside students should highlight Nutrition
        if (pathname.includes("/diet/")) {
            if (href === "/dashboard/nutrition") return true;
            if (href === "/dashboard/students") return false;
        }

        // Special case: Workout editing routes inside students should highlight Workouts
        if (pathname.includes("/workouts/")) {
            if (href === "/dashboard/workouts") return true;
            if (href === "/dashboard/students") return false;
        }

        if (href === "/dashboard" && pathname === "/dashboard") return true;

        // Default behavior: check if pathname starts with href
        // But exclude /dashboard root matching everything
        if (href !== "/dashboard" && pathname.startsWith(href)) return true;

        return false;
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-24 h-screen bg-pure-white fixed left-0 top-0 border-r border-slate-100 z-50 py-8 items-center justify-between">
                {/* Logo */}
                <div className="w-12 h-12 bg-graphite-dark rounded-xl flex items-center justify-center text-performance-green font-extrabold text-xl">
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
                                className={`p-2 rounded-2xl transition-all duration-300 group relative ${active
                                    ? "bg-performance-green text-white shadow-lg shadow-emerald-200"
                                    : "text-slate-400 hover:bg-slate-50 hover:text-performance-green"
                                    }`}
                            >
                                <item.icon size={28} weight={active ? "fill" : "duotone"} />

                                {/* Tooltip */}
                                <span className="absolute left-14 bg-graphite-dark text-white text-xs font-bold py-2 px-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Settings */}
                <div className="flex flex-col gap-4">
                    <Link
                        href="/dashboard/settings"
                        className={`p-2 rounded-2xl transition-all duration-300 group relative ${isActive("/dashboard/settings")
                            ? "bg-performance-green text-white shadow-lg shadow-emerald-200"
                            : "text-slate-400 hover:bg-slate-50 hover:text-performance-green"
                            }`}
                    >
                        <Gear size={28} weight={isActive("/dashboard/settings") ? "fill" : "duotone"} />

                        {/* Tooltip */}
                        <span className="absolute left-14 bg-graphite-dark text-white text-xs font-bold py-2 px-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            Configurações
                        </span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-pure-white/90 backdrop-blur-xl border-t border-slate-100 safe-area-bottom">
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item, idx) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={idx}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 ${active
                                    ? "text-performance-green"
                                    : "text-slate-400"
                                    }`}
                            >
                                <item.icon size={24} weight={active ? "fill" : "duotone"} />
                                <span className="text-[10px] font-bold leading-none">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                    {/* Logout/Profile for Mobile */}
                    <Link
                        href="/dashboard/settings"
                        className={`flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 ${isActive("/dashboard/settings")
                            ? "text-performance-green"
                            : "text-slate-400"
                            }`}
                    >
                        <Gear size={24} weight={isActive("/dashboard/settings") ? "fill" : "duotone"} />
                        <span className="text-[10px] font-bold leading-none">
                            Perfil
                        </span>
                    </Link>
                </div>
            </nav>
        </>
    );
}

"use client";

import { useEffect } from "react";
import { Sun, Moon, Monitor } from "@phosphor-icons/react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { syncThemeCookie } from "@/app/actions/settings";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
];

export default function ThemeSection() {
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        syncThemeCookie()
            .then((savedTheme) => {
                setTheme(savedTheme);
            })
            .catch(() => {});
    }, [setTheme]);

    return (
        <div className="bg-white dark:bg-[#1E2A36] rounded-[24px] p-6 soft-shadow border border-slate-100 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                Aparência
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Escolha o tema da interface. O modo escuro usa a mesma paleta do login.
            </p>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => {
                    const isActive = theme === opt.value;
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setTheme(opt.value)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border",
                                isActive
                                    ? "bg-performance-green text-graphite-dark border-performance-green"
                                    : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
                            )}
                        >
                            <Icon size={20} weight={isActive ? "fill" : "duotone"} />
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

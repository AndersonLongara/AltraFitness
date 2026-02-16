"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { updateTheme } from "@/app/actions/settings";

const THEME_COOKIE = "altrafitness-theme";

export type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getThemeFromStorage(): Theme {
    if (typeof window === "undefined") return "system";
    const stored = document.cookie.match(new RegExp(`(^| )${THEME_COOKIE}=([^;]+)`))?.[2] as Theme | undefined;
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
    return "system";
}

function getResolvedTheme(theme: Theme): "light" | "dark" {
    if (theme === "dark") return "dark";
    if (theme === "light") return "light";
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (resolved === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
}

export function ThemeProvider({ children, initialTheme }: { children: React.ReactNode; initialTheme?: Theme }) {
    const [theme, setThemeState] = useState<Theme>(initialTheme ?? getThemeFromStorage);
    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
        getResolvedTheme(initialTheme ?? getThemeFromStorage())
    );

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        const resolved = getResolvedTheme(newTheme);
        setResolvedTheme(resolved);
        applyTheme(resolved);
        document.cookie = `${THEME_COOKIE}=${newTheme};path=/;max-age=${60 * 60 * 24 * 365}`;
        updateTheme(newTheme).catch(() => {});
    }, []);

    useEffect(() => {
        const stored = getThemeFromStorage();
        if (stored !== theme) setThemeState(stored);
        const resolved = getResolvedTheme(stored);
        setResolvedTheme(resolved);
        applyTheme(resolved);
    }, []);

    useEffect(() => {
        if (theme !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            const resolved = mq.matches ? "dark" : "light";
            setResolvedTheme(resolved);
            applyTheme(resolved);
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [theme]);

    const value: ThemeContextValue = { theme, resolvedTheme, setTheme };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        return {
            theme: "system",
            resolvedTheme: typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
            setTheme: () => {},
        };
    }
    return ctx;
}


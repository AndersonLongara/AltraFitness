"use client";

import { useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { syncThemeCookie } from "@/app/actions/settings";

const THEME_COOKIE = "altrafitness-theme";

/** Sincroniza o tema salvo no DB do trainer com o cookie e o contexto (só roda no dashboard). */
export default function SyncThemeFromDb() {
    const { setTheme } = useTheme();

    useEffect(() => {
        syncThemeCookie().then((savedTheme) => {
            document.cookie = `${THEME_COOKIE}=${savedTheme};path=/;max-age=${60 * 60 * 24 * 365}`;
            setTheme(savedTheme);
        });
    }, [setTheme]);

    return null;
}

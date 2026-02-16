"use client";

import { useClerk } from "@clerk/nextjs";
import { useCallback, useState } from "react";

const SIGN_IN_URL = "/sign-in";

type Props = {
    children: React.ReactNode;
    className?: string;
};

/**
 * Botão de sair da conta que evita ficar travado em tela de carregar:
 * chama signOut do Clerk e força navegação completa para /sign-in (window.location.href),
 * em vez de depender do redirect do Clerk/Next.js que pode deixar a UI em loading.
 */
export function SignOutButtonSafe({ children, className }: Props) {
    const { signOut } = useClerk();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleClick = useCallback(async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);
        try {
            await signOut();
        } finally {
            // Força navegação completa para limpar estado e evitar tela travada
            window.location.href = SIGN_IN_URL;
        }
    }, [signOut, isSigningOut]);

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isSigningOut}
            className={className}
            aria-busy={isSigningOut}
        >
            {children}
        </button>
    );
}

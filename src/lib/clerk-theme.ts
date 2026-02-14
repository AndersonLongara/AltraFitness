import type { Appearance } from "@clerk/types";

/**
 * Shared Clerk dark theme for AltraFit auth pages.
 * Used by sign-in, sign-up, and any embedded Clerk components.
 */
export const clerkDarkAppearance: Appearance = {
    variables: {
        colorPrimary: "#CCFF00",
        colorText: "#e4e4e7",
        colorTextSecondary: "#71717a",
        colorBackground: "#111113",
        colorInputBackground: "#0a0a0a",
        colorInputText: "#FFFFFF",
        colorDanger: "#ef4444",
        borderRadius: "0.875rem",
        fontFamily: "var(--font-jakarta), system-ui, sans-serif",
        fontSize: "0.875rem",
        spacingUnit: "1rem",
    },
    elements: {
        rootBox: "w-full",
        cardBox: "w-full shadow-none",
        card: "bg-[#111113] w-full shadow-[0_1px_0_0_rgba(204,255,0,0.05)] rounded-3xl border border-white/[0.06] p-2",
        headerTitle: "hidden",
        headerSubtitle: "hidden",

        // Social login buttons
        socialButtonsBlockButton:
            "bg-[#0c0c0e] border border-white/[0.08] text-zinc-300 font-semibold rounded-xl h-11 transition-all duration-200 hover:bg-[#161618] hover:border-white/[0.12]",
        socialButtonsBlockButtonText: "text-zinc-300 font-semibold text-[13px]",
        socialButtonsIconButton:
            "bg-[#0c0c0e] border border-white/[0.08] rounded-xl h-11 w-full transition-all duration-200 hover:bg-[#161618] hover:border-white/[0.12]",

        // Divider
        dividerLine: "bg-white/[0.06]",
        dividerText:
            "text-zinc-600 font-semibold text-[11px] uppercase tracking-widest",

        // Form fields
        formFieldLabel:
            "text-zinc-400 font-semibold text-[11px] uppercase tracking-wider",
        formFieldInput:
            "bg-[#0a0a0a] border border-white/[0.08] text-white font-medium rounded-xl h-11 focus:border-acid-lime/40 focus:ring-2 focus:ring-acid-lime/10 transition-all placeholder:text-zinc-600",
        formFieldAction:
            "text-acid-lime/80 hover:text-acid-lime font-semibold text-xs",

        // Primary CTA button
        formButtonPrimary:
            "bg-acid-lime hover:bg-[#d4ff33] text-[#050505] font-black uppercase tracking-wide rounded-xl h-11 shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all duration-200 text-[13px]",

        // Footer links (Don't have account? / Already have account?)
        footerAction: "justify-center",
        footerActionLink:
            "text-acid-lime/80 hover:text-acid-lime font-bold text-sm",
        footerActionText: "text-zinc-500 text-sm",

        // Identity preview (email step)
        identityPreviewEditButton:
            "text-acid-lime/80 hover:text-acid-lime font-semibold",
        identityPreviewText: "text-zinc-300 font-medium",

        // Validation states
        formFieldSuccessText: "text-acid-lime text-xs",
        formFieldErrorText: "text-red-400 text-xs",
        alert: "bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm",
        alertText: "text-red-300 text-sm",

        // Hide Clerk branding
        logoBox: "hidden",

        // Footer
        footer: "bg-[#111113] rounded-b-3xl border-t border-white/[0.04] [&_.cl-internal-b3fm6y]:!text-zinc-700 [&_.cl-internal-b3fm6y]:!text-[10px]",
    },
};

/**
 * Global CSS overrides for Clerk internal elements.
 * Inject via <style> tag in the auth layout.
 */
export const clerkStyleOverrides = `
    .cl-internal-b3fm6y { color: #3f3f46 !important; font-size: 10px !important; }
    .cl-internal-17eqao5 { display: none !important; }
    .cl-footer { border-top: 1px solid rgba(255,255,255,0.04) !important; }
    .cl-socialButtonsIconButton { flex: 1 !important; }
`;

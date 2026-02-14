import type { Appearance } from "@clerk/types";

/**
 * AltraHub Void Theme (v2.0)
 * Deep Graphite + Performance Green — fully dark, seamless with auth layout.
 */
export const clerkDarkAppearance: Appearance = {
    variables: {
        colorPrimary: "#2ECC71",
        colorText: "#FFFFFF",
        colorTextOnPrimaryBackground: "#050505",
        colorTextSecondary: "#94A3B8",
        colorBackground: "#131B23",
        colorInputBackground: "#1E2A36",
        colorInputText: "#FFFFFF",
        colorDanger: "#EF4444",
        borderRadius: "1rem",
        fontFamily: "var(--font-jakarta), system-ui, sans-serif",
        fontSize: "0.875rem",
        spacingUnit: "1rem",
    },
    elements: {
        rootBox: "w-full",
        cardBox: "w-full shadow-none overflow-visible",
        card: "!bg-transparent w-full !shadow-none !border-none !px-1 !py-0 overflow-visible",
        headerTitle: "hidden",
        headerSubtitle: "hidden",

        // Social buttons
        socialButtonsBlockButton:
            "!bg-[#1E2A36] !border !border-white/10 !rounded-2xl !h-16 hover:!bg-[#253241] hover:!border-white/20 transition-all",
        socialButtonsBlockButtonText: "!text-white !font-bold !text-base",
        socialButtonsIconButton:
            "!bg-[#1E2A36] !border !border-white/10 !rounded-2xl !h-16 hover:!bg-[#253241] hover:!border-white/20 transition-all",

        // Divider
        dividerLine: "!bg-white/10",
        dividerText: "!text-[#94A3B8] !font-bold !text-[11px] !uppercase !tracking-widest",

        // Form fields
        formFieldLabel: "!text-[#94A3B8] !font-bold !text-[11px] !uppercase !tracking-wider",
        formFieldInput:
            "!bg-[#1E2A36] !border !border-white/10 !text-white !font-medium !rounded-2xl !h-14 focus:!ring-2 focus:!ring-[#2ECC71]/20 focus:!border-[#2ECC71]/30 focus:!bg-[#253241] transition-all placeholder:!text-[#94A3B8]/50",
        formFieldAction: "!text-[#2ECC71] hover:!text-[#27AE60] !font-semibold !text-xs",

        // Primary CTA
        formButtonPrimary:
            "!bg-[#2ECC71] hover:!bg-[#27AE60] !text-[#050505] !font-black !uppercase !tracking-wide !rounded-2xl !h-14 !shadow-[0_8px_30px_rgba(46,204,113,0.25)] hover:!shadow-[0_8px_30px_rgba(46,204,113,0.45)] transition-all !text-sm active:!scale-[0.98]",

        // Footer
        footerAction: "!justify-center !mt-6",
        footerActionLink: "!text-[#2ECC71] hover:!text-[#27AE60] !font-bold !text-sm",
        footerActionText: "!text-[#94A3B8] !text-sm",

        // Identity preview
        identityPreviewEditButton: "!text-[#2ECC71] hover:!text-[#27AE60] !font-semibold",
        identityPreviewText: "!text-white !font-medium",

        // Validation
        formFieldSuccessText: "!text-[#2ECC71] !text-xs",
        formFieldErrorText: "!text-[#EF4444] !text-xs",
        alert: "!bg-[#EF4444]/10 !border !border-[#EF4444]/20 !text-[#EF4444] !rounded-2xl !text-sm",
        alertText: "!text-[#EF4444] !text-sm",

        // Branding
        logoBox: "hidden",
        footer: "hidden",
    },
};

/**
 * Global CSS overrides for Clerk internal elements.
 * Uses !important sparingly and only where Clerk's inline styles win.
 */
export const clerkStyleOverrides = `
    /* =========================================
       CLERK DARK THEME — AltraHub Void v2.0
       ========================================= */

    /* --- Card: transparent, merge with page --- */
    .cl-card {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        overflow: visible !important;
    }
    .cl-cardBox,
    .cl-rootBox {
        overflow: visible !important;
    }

    /* --- Force all text white inside card --- */
    .cl-card,
    .cl-card p,
    .cl-card span,
    .cl-card label,
    .cl-card a,
    .cl-card div {
        color: #FFFFFF !important;
    }

    /* --- Labels: Slate Mist --- */
    .cl-formFieldLabel,
    .cl-formFieldLabel * {
        color: #94A3B8 !important;
    }

    /* --- Divider text --- */
    .cl-dividerText,
    .cl-dividerText * {
        color: #94A3B8 !important;
    }

    /* --- Primary button: dark text on green --- */
    .cl-formButtonPrimary,
    .cl-formButtonPrimary * {
        color: #050505 !important;
    }

    /* --- Inputs --- */
    .cl-formFieldInput {
        background-color: #1E2A36 !important;
        color: #FFFFFF !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
    }
    .cl-formFieldInput::placeholder {
        color: #94A3B8 !important;
        opacity: 0.5;
    }

    /* --- Footer --- */
    .cl-footerActionText { color: #94A3B8 !important; }
    .cl-footerActionLink { color: #2ECC71 !important; }
    .cl-identityPreviewText { color: #FFFFFF !important; }

    /* --- Social Buttons: larger icons, natural colors --- */
    .cl-socialButtonsBlockButton,
    .cl-socialButtonsIconButton {
        height: 64px !important;
        border-radius: 1rem !important;
        background: #1E2A36 !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
    }
    .cl-socialButtonsBlockButton:hover,
    .cl-socialButtonsIconButton:hover {
        background: #253241 !important;
        border-color: rgba(255,255,255,0.2) !important;
    }

    /* Icon sizing */
    .cl-socialButtonsBlockButton svg,
    .cl-socialButtonsIconButton svg {
        width: 28px !important;
        height: 28px !important;
        min-width: 28px !important;
        min-height: 28px !important;
        flex-shrink: 0 !important;
    }

    /* Apple icon: make it white (it's normally black) */
    .cl-socialButtonsIconButton[data-provider="apple"] svg,
    .cl-socialButtonsBlockButton[data-provider="apple"] svg {
        filter: brightness(0) invert(1) !important;
    }

    /* Facebook icon: keep its native blue, no filter */
    .cl-socialButtonsIconButton[data-provider="facebook"] svg,
    .cl-socialButtonsBlockButton[data-provider="facebook"] svg {
        filter: none !important;
    }

    /* Google icon: keep native colors */
    .cl-socialButtonsIconButton[data-provider="google"] svg,
    .cl-socialButtonsBlockButton[data-provider="google"] svg {
        filter: none !important;
    }

    /* Social button text */
    .cl-socialButtonsBlockButtonText,
    .cl-socialButtonsBlockButtonText * {
        color: #FFFFFF !important;
        font-weight: 700 !important;
    }

    /* Hide Clerk branding */
    .cl-internal-17eqao5,
    .cl-internal-1dauvpw,
    .cl-internal-b3fm6y {
        display: none !important;
    }
`;

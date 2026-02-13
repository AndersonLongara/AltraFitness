import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-deep-black via-[#0a0a0a] to-deep-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background ambient glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-acid-lime/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-acid-lime/8 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-acid-lime/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Enhanced grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(204,255,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(204,255,0,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.8)_100%)]" />

            <div className="w-full max-w-md relative z-10">
                {/* Enhanced Brand Header */}
                <div className="text-center mb-8">
                    {/* Logo with glow effect */}
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-surface-grey to-[#141414] border-2 border-acid-lime/20 rounded-[28px] mb-6 shadow-[0_0_60px_rgba(204,255,0,0.2),0_0_100px_rgba(204,255,0,0.1)] relative group">
                        <div className="absolute inset-0 bg-acid-lime/5 rounded-[26px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="text-acid-lime text-5xl font-black tracking-tighter relative z-10">A</span>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-acid-lime rounded-full shadow-[0_0_10px_rgba(204,255,0,0.8)]" />
                    </div>
                    
                    {/* Title with gradient */}
                    <h1 className="text-4xl font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                        AltraFit
                    </h1>
                    <p className="text-zinc-500 text-sm font-semibold">
                        Bem-vindo de volta ao futuro do <span className="text-acid-lime font-black">fitness</span>
                    </p>
                </div>

                {/* Enhanced Clerk Sign-In Card */}
                <div className="flex justify-center relative">
                    {/* Glow effect behind card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-acid-lime/10 via-transparent to-transparent blur-3xl opacity-50 scale-95" />
                    
                    <SignIn
                        appearance={{
                            variables: {
                                colorPrimary: "#CCFF00",
                                colorText: "#FFFFFF",
                                colorTextSecondary: "#a1a1aa",
                                colorBackground: "#1C1C1E",
                                colorInputBackground: "#0a0a0a",
                                colorInputText: "#FFFFFF",
                                borderRadius: "1.25rem",
                                fontFamily: "var(--font-jakarta), sans-serif",
                                fontSize: "0.9375rem",
                            },
                            elements: {
                                card: "bg-[#16161a]/95 backdrop-blur-2xl shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9),0_0_1px_rgba(204,255,0,0.1)] rounded-[36px] border-2 border-white/5 relative",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                socialButtonsBlockButton: "bg-gradient-to-br from-[#0f0f11] to-[#18181b] border-2 border-white/8 hover:border-acid-lime/30 text-zinc-300 font-bold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(204,255,0,0.15)]",
                                socialButtonsBlockButtonText: "text-zinc-200 font-bold text-sm",
                                socialButtonsIconButton: "border-white/8 hover:border-acid-lime/30",
                                formFieldLabel: "text-zinc-400 font-bold text-xs uppercase tracking-[0.15em] mb-2",
                                formFieldInput: "bg-[#0a0a0a] border-2 border-white/8 text-white font-semibold rounded-2xl focus:border-acid-lime/60 focus:ring-4 focus:ring-acid-lime/10 transition-all duration-200 placeholder:text-zinc-600 hover:border-white/15",
                                formButtonPrimary: "bg-gradient-to-r from-acid-lime to-[#d4ff33] hover:from-[#d4ff33] hover:to-acid-lime text-deep-black font-black uppercase tracking-[0.1em] rounded-2xl shadow-[0_0_30px_rgba(204,255,0,0.4),0_8px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_0_50px_rgba(204,255,0,0.6),0_12px_24px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm py-3",
                                formButtonReset: "text-zinc-400 hover:text-zinc-300",
                                footerActionLink: "text-acid-lime hover:text-[#d4ff33] font-black transition-all duration-200 hover:underline decoration-acid-lime/30 underline-offset-4",
                                footerActionText: "text-zinc-500 font-medium",
                                dividerLine: "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                                dividerText: "text-zinc-600 font-black uppercase text-[10px] tracking-[0.2em] bg-[#16161a] px-4",
                                identityPreviewEditButton: "text-acid-lime hover:text-[#d4ff33] font-bold",
                                formFieldAction: "text-acid-lime hover:text-[#d4ff33] font-bold text-sm",
                                formFieldSuccessText: "text-acid-lime font-semibold",
                                formFieldErrorText: "text-red-400 font-semibold text-xs",
                                formFieldWarningText: "text-yellow-400 font-semibold text-xs",
                                alert: "bg-red-500/10 border-2 border-red-500/20 text-red-300 rounded-2xl font-semibold",
                                alertText: "text-red-300 font-semibold text-sm",
                                logoBox: "hidden",
                                footer: "hidden",
                            },
                        }}
                    />
                </div>

                {/* Enhanced Bottom brand line */}
                <div className="text-center mt-10 space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-acid-lime/30" />
                        <p className="text-acid-lime/60 text-[11px] font-black uppercase tracking-[0.25em]">
                            High Performance Fitness
                        </p>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-acid-lime/30" />
                    </div>
                    <p className="text-zinc-700 text-[9px] font-semibold uppercase tracking-[0.3em]">
                        Powered by AI Technology
                    </p>
                </div>
            </div>
        </div>
    );
}

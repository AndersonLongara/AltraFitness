import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen bg-deep-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background ambient glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-acid-lime/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-acid-lime/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="w-full max-w-md relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-surface-grey border border-white/10 rounded-3xl mb-6 shadow-[0_0_40px_rgba(204,255,0,0.15)]">
                        <span className="text-acid-lime text-4xl font-black tracking-tighter">A.</span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Bem-vindo de volta
                    </h1>
                    <p className="text-zinc-500 mt-2 text-sm font-medium">
                        Faça login para acessar o <span className="text-acid-lime font-bold">AltraFit</span>
                    </p>
                </div>

                {/* Clerk Sign-In Card */}
                <div className="flex justify-center">
                    <SignIn
                        appearance={{
                            variables: {
                                colorPrimary: "#CCFF00",
                                colorText: "#FFFFFF",
                                colorTextSecondary: "#71717a",
                                colorBackground: "#1C1C1E",
                                colorInputBackground: "#050505",
                                colorInputText: "#FFFFFF",
                                borderRadius: "1rem",
                                fontFamily: "var(--font-jakarta), sans-serif",
                            },
                            elements: {
                                card: "bg-surface-grey/80 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-[32px] border border-white/10",
                                headerTitle: "text-white font-black tracking-tight",
                                headerSubtitle: "text-zinc-500 font-medium",
                                socialButtonsBlockButton: "bg-deep-black border border-white/10 hover:bg-white/5 text-zinc-300 font-bold rounded-2xl transition-all duration-300 hover:border-acid-lime/30",
                                socialButtonsBlockButtonText: "text-zinc-300 font-bold",
                                formFieldLabel: "text-zinc-400 font-bold text-xs uppercase tracking-widest",
                                formFieldInput: "bg-deep-black border border-white/10 text-white font-medium rounded-xl focus:border-acid-lime/50 focus:ring-2 focus:ring-acid-lime/20 transition-all placeholder:text-zinc-600",
                                formButtonPrimary: "bg-acid-lime hover:brightness-110 text-deep-black font-black uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] transition-all duration-300",
                                footerActionLink: "text-acid-lime hover:text-acid-lime/80 font-bold transition-colors",
                                footerActionText: "text-zinc-500",
                                dividerLine: "bg-white/10",
                                dividerText: "text-zinc-600 font-bold uppercase text-xs tracking-widest",
                                identityPreviewEditButton: "text-acid-lime hover:text-acid-lime/80",
                                formFieldAction: "text-acid-lime hover:text-acid-lime/80 font-bold",
                                alert: "bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl",
                                logoBox: "hidden",
                            },
                        }}
                    />
                </div>

                {/* Bottom brand line */}
                <div className="text-center mt-8">
                    <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-[0.2em]">
                        High Performance Fitness Management
                    </p>
                </div>
            </div>
        </div>
    );
}

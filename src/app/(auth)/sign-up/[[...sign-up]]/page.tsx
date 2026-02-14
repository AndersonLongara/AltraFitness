import { SignUp } from "@clerk/nextjs";
import { clerkDarkAppearance } from "@/lib/clerk-theme";

export default function Page() {
    return (
        <div className="w-full max-w-[420px]">
            {/* Brand Header */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#111113] border border-acid-lime/20 rounded-2xl mb-4 shadow-[0_0_40px_rgba(204,255,0,0.15)] relative">
                    <span className="text-acid-lime text-3xl font-black">A</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-acid-lime rounded-full shadow-[0_0_8px_rgba(204,255,0,0.9)]" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight mb-1">
                    AltraFit
                </h1>
                <p className="text-zinc-500 text-xs font-medium">
                    Crie sua conta para começar
                </p>
            </div>

            {/* Clerk Sign-Up */}
            <SignUp appearance={clerkDarkAppearance} />

            {/* Bottom tagline */}
            <div className="text-center mt-8">
                <p className="text-zinc-600 text-[10px] font-semibold uppercase tracking-[0.2em]">
                    High Performance Fitness Management
                </p>
            </div>
        </div>
    );
}

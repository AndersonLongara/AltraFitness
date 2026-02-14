import { SignUp } from "@clerk/nextjs";
import { clerkDarkAppearance } from "@/lib/clerk-theme";
import { Dumbbell } from "lucide-react";

export default function Page() {
    return (
        <div className="w-full">
            {/* Header / Brand */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-[#2ECC71] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(46,204,113,0.3)]">
                        <Dumbbell className="text-[#131B23] w-6 h-6 fill-current" />
                    </div>
                    <span className="text-white font-bold text-2xl tracking-tight">
                        AltraFit <span className="text-[#2ECC71] text-xs font-black uppercase align-top ml-1">PRO</span>
                    </span>
                </div>
                
                <h1 className="text-5xl font-extrabold text-white tracking-tighter leading-[1.1] mb-4">
                    Junte-se à <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ECC71] to-[#27AE60]">Elite.</span>
                </h1>
                
                <p className="text-[#94A3B8] text-lg font-medium leading-relaxed max-w-md">
                    A plataforma definitiva para personal trainers que buscam alta performance.
                </p>
            </div>

            {/* Clerk Form */}
            <SignUp appearance={clerkDarkAppearance} />
        </div>
    );
}

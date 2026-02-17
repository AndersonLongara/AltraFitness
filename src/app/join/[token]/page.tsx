import { db } from "@/db";
import { students, trainers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Check, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import JoinForm from "@/components/join/JoinForm";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const student = await db.query.students.findFirst({
        where: eq(students.inviteToken, token),
        with: {
            trainer: true,
            plan: true,
        }
    });

    if (!student) {
        return (
            <div className="min-h-screen bg-[#131B23] flex items-center justify-center p-6">
                <div className="bg-[#1E2A36] p-8 rounded-3xl border border-white/10 text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} weight="duotone" />
                    </div>
                    <h1 className="text-xl font-bold text-white mb-2">Convite Inválido</h1>
                    <p className="text-slate-400 text-sm">Este link de convite não existe ou já expirou.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#131B23] flex flex-col items-center justify-center p-6 font-primary relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-[#2ECC71]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#2ECC71]/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="w-full max-w-md space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-[#2ECC71]/20 text-[#2ECC71] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(46,204,113,0.3)]">
                        <Check size={40} weight="bold" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Bem-vindo(a), {student.name.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Você foi convidado por <strong className="text-[#2ECC71]">{student.trainer.name}</strong> para acessar o AltraHub.
                    </p>
                </div>

                {/* Card */}
                <JoinForm
                    token={token}
                    initialName={student.name}
                    initialPhone={student.phone}
                    initialEmail={student.email}
                    planName={student.plan?.name || null}
                    planPrice={student.plan?.price || null}
                />
            </div>
        </div>
    );
}

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
            trainer: true
        }
    });

    if (!student) {
        return (
            <div className="min-h-screen bg-ice-white flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl soft-shadow text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} weight="duotone" />
                    </div>
                    <h1 className="text-xl font-bold text-graphite-dark mb-2">Convite Inválido</h1>
                    <p className="text-slate-500 text-sm">Este link de convite não existe ou já expirou.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ice-white flex flex-col items-center justify-center p-6 font-primary">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-emerald-50 text-performance-green rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100">
                        <Check size={40} weight="bold" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                        Bem-vindo(a), {student.name.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Você foi convidado por <strong className="text-slate-700">{student.trainer.name}</strong> para acessar o AltraHub.
                    </p>
                </div>

                {/* Card */}
                <JoinForm
                    token={token}
                    initialName={student.name}
                    initialPhone={student.phone}
                />
            </div>
        </div>
    );
}

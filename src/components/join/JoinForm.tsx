'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/app/actions/students";
import { SpinnerGap, SignIn, User, ArrowRight } from "@phosphor-icons/react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

interface JoinFormProps {
    token: string;
    initialName: string;
    initialPhone: string | null;
}

export default function JoinForm({ token, initialName, initialPhone }: JoinFormProps) {
    const router = useRouter();
    const { isSignedIn, user, isLoaded } = useUser();
    const [phone, setPhone] = useState(initialPhone || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!isSignedIn) return; // Should not happen due to UI state

        setLoading(true);
        setError(null);
        try {
            await acceptInvite(token, phone);
            // Force a hard reload to ensure clean state and auth redirect
            window.location.href = '/student';
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao confirmar convite. Tente novamente.");
            setLoading(false);
        }
    };

    if (!isLoaded) {
        return (
            <div className="bg-pure-white p-8 rounded-[32px] soft-shadow-lg border border-slate-50 flex justify-center">
                <SpinnerGap className="animate-spin text-emerald-500" size={32} />
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="bg-pure-white p-8 rounded-[32px] soft-shadow-lg border border-slate-50 space-y-6 text-center">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-graphite-dark">Acesso Restrito</h2>
                    <p className="text-slate-500 text-sm">
                        Para aceitar este convite, você precisa criar uma conta ou entrar em uma existente.
                    </p>
                </div>

                <div className="space-y-3">
                    <SignInButton mode="modal" forceRedirectUrl={`/join/${token}`}>
                        <button className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:brightness-110 active:scale-95 transition-all text-lg">
                            Entrar na minha conta
                        </button>
                    </SignInButton>

                    <SignUpButton mode="modal" forceRedirectUrl={`/join/${token}`}>
                        <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 active:scale-95 transition-all text-lg">
                            Criar nova conta
                        </button>
                    </SignUpButton>
                </div>

                <p className="text-xs text-slate-400 font-medium px-4">
                    Seus dados estão seguros e protegidos.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-pure-white p-8 rounded-[32px] soft-shadow-lg border border-slate-50 space-y-6">

            {/* Logged User Info */}
            <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                    <User size={20} className="text-emerald-600" weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Aceitando como</p>
                    <p className="text-sm font-semibold text-graphite-dark truncate">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
                <UserButton />
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Nome</label>
                    <input
                        type="text"
                        defaultValue={initialName}
                        disabled
                        className="w-full p-4 bg-slate-50 rounded-xl font-bold text-slate-500 outline-none cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">WhatsApp</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className="w-full p-4 bg-white border-2 border-slate-100 focus:border-emerald-500 rounded-xl font-bold text-slate-700 outline-none transition-colors"
                    />
                </div>
            </div>

            {error && (
                <p className="text-rose-500 text-sm font-bold text-center bg-rose-50 p-3 rounded-xl">{error}</p>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:brightness-110 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <SpinnerGap className="animate-spin" size={24} /> : (
                    <>
                        Confirmar e Acessar
                        <ArrowRight weight="bold" />
                    </>
                )}
            </button>

            <p className="text-center text-xs text-slate-400 font-medium px-4">
                Ao continuar, você concorda com os Termos de Uso do AltraFitness App.
            </p>
        </div>
    );
}

'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/app/actions/students";
import { SpinnerGap, SignIn, User, ArrowRight, SignOut, CurrencyDollar, Tag } from "@phosphor-icons/react";
import { useUser, useClerk, SignInButton, SignUpButton } from "@clerk/nextjs";

interface JoinFormProps {
    token: string;
    initialName: string;
    initialPhone: string | null;
    planName: string | null;
    planPrice: number | null;
}

export default function JoinForm({ token, initialName, initialPhone, planName, planPrice }: JoinFormProps) {
    const router = useRouter();
    const { isSignedIn, user, isLoaded } = useUser();
    const { signOut } = useClerk();
    
    // Form states
    const [name, setName] = useState(initialName || '');
    const [instagram, setInstagram] = useState('');
    const [phone, setPhone] = useState(initialPhone || '');
    const [cpf, setCpf] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Format CPF: 000.000.000-00
    const formatCpf = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d)/, '$1.$2')
                .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        return cpf;
    };

    // Format Phone: (00) 00000-0000
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            return numbers
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }
        return phone;
    };

    // Set invite token cookie on mount (for OAuth redirect detection)
    useEffect(() => {
        document.cookie = `invite_token=${token}; path=/; max-age=3600; samesite=lax`;
        console.log('[JoinForm] Set invite_token cookie:', token);
        console.log('[JoinForm] Current cookies:', document.cookie);
    }, [token]);

    const handleSubmit = async () => {
        if (!isSignedIn) return;

        // Get email from Clerk user
        const userEmail = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
        if (!userEmail) {
            setError('Não foi possível obter seu email. Tente fazer login novamente.');
            return;
        }

        // Basic validation
        if (!name.trim()) {
            setError('Por favor, preencha seu nome completo.');
            return;
        }
        if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
            setError('Por favor, preencha um telefone válido.');
            return;
        }
        if (!cpf.trim() || cpf.replace(/\D/g, '').length !== 11) {
            setError('Por favor, preencha um CPF válido.');
            return;
        }
        if (!birthDay || !birthMonth || !birthYear) {
            setError('Por favor, preencha sua data de nascimento completa.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Create birthDate timestamp from day, month, year
            const birthDate = new Date(
                parseInt(birthYear),
                parseInt(birthMonth) - 1, // JS months are 0-indexed
                parseInt(birthDay)
            );

            await acceptInvite(token, {
                name: name.trim(),
                email: userEmail,
                instagram: instagram.trim() ? instagram.trim() : null,
                phone: phone.replace(/\D/g, ''),
                cpf: cpf.replace(/\D/g, ''),
                birthDate: birthDate.getTime(),
            });
            
            // Clear the invite cookie
            document.cookie = 'invite_token=; path=/; max-age=0';
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
            <div className="bg-[#1E2A36] p-8 rounded-[32px] border border-white/10 flex justify-center">
                <SpinnerGap className="animate-spin text-[#2ECC71]" size={32} />
            </div>
        )
    }

    if (!isSignedIn) {
        return (
            <div className="bg-[#1E2A36] p-8 rounded-[32px] border border-white/10 space-y-6 text-center">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">Acesso Restrito</h2>
                    <p className="text-slate-400 text-sm">
                        Para aceitar este convite, você precisa criar uma conta ou entrar em uma existente.
                    </p>
                </div>

                <div className="space-y-3">
                    <SignInButton 
                        mode="redirect" 
                        forceRedirectUrl={`/auth-redirect?invite_token=${token}`}
                    >
                        <button className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 active:scale-95 transition-all text-lg">
                            Entrar na minha conta
                        </button>
                    </SignInButton>

                    <SignUpButton 
                        mode="redirect" 
                        forceRedirectUrl={`/auth-redirect?invite_token=${token}`}
                    >
                        <button className="w-full py-4 bg-[#2ECC71] border border-[#2ECC71] text-[#131B23] font-bold rounded-2xl hover:brightness-110 active:scale-95 transition-all text-lg">
                            Criar nova conta
                        </button>
                    </SignUpButton>
                </div>

                <p className="text-xs text-slate-500 font-medium px-4">
                    Seus dados estão seguros e protegidos.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#1E2A36] p-8 rounded-[32px] border border-white/10 space-y-6">

            {/* Logged User Info */}
            <div className="bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="bg-[#2ECC71]/20 p-2 rounded-full">
                    <User size={20} className="text-[#2ECC71]" weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#2ECC71] uppercase tracking-wide">Aceitando como</p>
                    <p className="text-sm font-semibold text-white truncate">{user.primaryEmailAddress?.emailAddress}</p>
                </div>
                <button
                    onClick={() => signOut({ redirectUrl: `/join/${token}` })}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-400/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Sair e entrar com outra conta"
                >
                    <SignOut size={14} weight="bold" />
                    Trocar conta
                </button>
            </div>

            {/* Plan Info */}
            {planName && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-full">
                        <Tag size={20} className="text-blue-400" weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Seu Plano</p>
                        <p className="text-sm font-semibold text-white">{planName}</p>
                    </div>
                    {planPrice !== null && (
                        <span className="text-lg font-extrabold text-blue-400">
                            R$ {(planPrice / 100).toFixed(2).replace('.', ',')}
                        </span>
                    )}
                </div>
            )}

            <div className="space-y-4">
                {/* Nome Completo */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Nome Completo <span className="text-rose-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome completo"
                        className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#2ECC71] focus:bg-white/10 rounded-xl font-bold text-white outline-none transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* Instagram */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Instagram
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                        <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                            placeholder="seuusuario"
                            className="w-full p-4 pl-8 bg-white/5 border border-white/10 focus:border-[#2ECC71] focus:bg-white/10 rounded-xl font-bold text-white outline-none transition-colors placeholder:text-slate-600"
                        />
                    </div>
                </div>

                {/* WhatsApp */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        WhatsApp <span className="text-rose-400">*</span>
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#2ECC71] focus:bg-white/10 rounded-xl font-bold text-white outline-none transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* CPF */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        CPF <span className="text-rose-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={cpf}
                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#2ECC71] focus:bg-white/10 rounded-xl font-bold text-white outline-none transition-colors placeholder:text-slate-600"
                    />
                </div>

                {/* Data de Nascimento */}
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Data de Nascimento <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="number"
                            value={birthDay}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
                                    setBirthDay(val);
                                }
                            }}
                            placeholder="Dia"
                            min="1"
                            max="31"
                            className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#2ECC71] focus:bg-white/10 rounded-xl font-bold text-white outline-none transition-colors placeholder:text-slate-600 text-center"
                        />
                        <input
                            type="number"
                            value={birthMonth}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                                    setBirthMonth(val);
                                }
                            }}
                            placeholder="Mês"
                            min="1"
                            max="12"
                            className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#2ECC71] focus:bg-white/10 rounded-xl font-bold text-white outline-none transition-colors placeholder:text-slate-600 text-center"
                        />
                        <input
                            type="number"
                            value={birthYear}
                            onChange={(e) => {
                                const val = e.target.value;
                                const currentYear = new Date().getFullYear();
                                if (val === '' || (parseInt(val) >= 1900 && parseInt(val) <= currentYear)) {
                                    setBirthYear(val);
                                }
                            }}
                            placeholder="Ano"
                            min="1900"
                            max={new Date().getFullYear()}
                            className="w-full p-4 bg-white/5 border border-white/10 focus:border-[#2ECC71] focus:bg-white/10 rounded-xl font-bold text-white outline-none transition-colors placeholder:text-slate-600 text-center"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <p className="text-rose-400 text-sm font-bold text-center bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">{error}</p>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-[#2ECC71] text-[#131B23] font-bold rounded-2xl shadow-[0_0_30px_rgba(46,204,113,0.3)] hover:brightness-110 active:scale-95 transition-all text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <SpinnerGap className="animate-spin" size={24} /> : (
                    <>
                        Confirmar e Acessar
                        <ArrowRight weight="bold" />
                    </>
                )}
            </button>

            <p className="text-center text-xs text-slate-500 font-medium px-4">
                Ao continuar, você concorda com os Termos de Uso do AltraFitness App.
            </p>
        </div>
    );
}

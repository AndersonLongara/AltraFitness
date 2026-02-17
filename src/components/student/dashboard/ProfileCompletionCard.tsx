'use client';

import { useState, useTransition } from "react";
import { updateStudentProfile } from "@/app/actions/profile";
import { UserCircle, CheckCircle, SpinnerGap, IdentificationCard, Phone, Calendar, GenderIntersex, Ruler, Scales } from "@phosphor-icons/react";

interface ProfileCompletionCardProps {
    missing: string[];
    studentData: {
        name: string;
        phone: string | null;
        cpf: string | null;
        birthDate: string | null;
        gender: string | null;
        height: number | null;
        weight: number | null;
    };
}

function formatCPF(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatBirthDate(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function ProfileCompletionCard({ missing, studentData }: ProfileCompletionCardProps) {
    const [isPending, startTransition] = useTransition();
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [phone, setPhone] = useState(studentData.phone || '');
    const [cpf, setCpf] = useState(studentData.cpf || '');
    const [birthDate, setBirthDate] = useState(
        studentData.birthDate
            ? new Date(studentData.birthDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : ''
    );
    const [gender, setGender] = useState(studentData.gender || '');
    const [height, setHeight] = useState(studentData.height ? String(studentData.height) : '');
    const [weight, setWeight] = useState(studentData.weight ? String(studentData.weight) : '');

    const totalFields = missing.length;
    const filledFields = [
        missing.includes('phone') && phone.replace(/\D/g, '').length >= 10,
        missing.includes('cpf') && cpf.replace(/\D/g, '').length === 11,
        missing.includes('birthDate') && birthDate.replace(/\D/g, '').length === 8,
        missing.includes('gender') && gender !== '',
        missing.includes('height') && height !== '',
        missing.includes('weight') && weight !== '',
    ].filter(Boolean).length;
    const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 100;

    function handleSubmit() {
        setError('');

        // Validation
        if (missing.includes('phone') && phone.replace(/\D/g, '').length < 10) {
            setError('Informe um telefone válido');
            return;
        }
        if (missing.includes('cpf') && cpf.replace(/\D/g, '').length !== 11) {
            setError('Informe um CPF válido (11 dígitos)');
            return;
        }
        if (missing.includes('birthDate') && birthDate.replace(/\D/g, '').length !== 8) {
            setError('Informe uma data de nascimento válida');
            return;
        }
        if (missing.includes('gender') && !gender) {
            setError('Selecione seu sexo');
            return;
        }
        if (missing.includes('height') && (!height || isNaN(Number(height)))) {
            setError('Informe sua altura');
            return;
        }
        if (missing.includes('weight') && (!weight || isNaN(Number(weight)))) {
            setError('Informe seu peso');
            return;
        }

        startTransition(async () => {
            try {
                const payload: Record<string, string | number> = {};
                if (missing.includes('phone')) payload.phone = phone;
                if (missing.includes('cpf')) payload.cpf = cpf.replace(/\D/g, '');
                if (missing.includes('birthDate')) payload.birthDate = birthDate; // dd/mm/yyyy
                if (missing.includes('gender')) payload.gender = gender;
                if (missing.includes('height')) payload.height = Number(height);
                if (missing.includes('weight')) payload.weight = Number(weight);

                await updateStudentProfile(payload as any);
                setIsDone(true);
            } catch (e: any) {
                setError(e.message || 'Erro ao salvar. Tente novamente.');
            }
        });
    }

    if (isDone) {
        return (
            <div className="relative z-50 mb-8 animate-in fade-in duration-500">
                <div className="bg-gradient-to-r from-emerald-500/20 to-acid-lime/20 border border-acid-lime/30 rounded-[28px] p-8 text-center">
                    <CheckCircle size={56} weight="fill" className="text-acid-lime mx-auto mb-3" />
                    <h3 className="text-xl font-black text-white mb-1">Perfil Completo!</h3>
                    <p className="text-zinc-400 text-sm">Tudo pronto. Aproveite a plataforma!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative z-50 mb-8">
            {/* Pulsing glow shadow */}
            <div className="absolute -inset-1 bg-acid-lime/20 rounded-[32px] blur-xl animate-pulse" />
            <div className="absolute -inset-0.5 bg-acid-lime/10 rounded-[30px] blur-md animate-pulse" style={{ animationDelay: '0.5s' }} />

            <div className="relative bg-surface-grey border-2 border-acid-lime/50 rounded-[28px] p-6 md:p-8 shadow-[0_0_40px_rgba(189,255,0,0.15)]">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-acid-lime/10 border border-acid-lime/20 flex items-center justify-center">
                        <UserCircle size={28} weight="duotone" className="text-acid-lime" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white">Complete seu Perfil</h3>
                        <p className="text-xs text-zinc-500">Preencha os dados abaixo para começar</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-400">{filledFields} de {totalFields} campos</span>
                        <span className="text-xs font-black text-acid-lime">{progress}%</span>
                    </div>
                    <div className="h-2 bg-deep-black rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-acid-lime to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                    {missing.includes('phone') && (
                        <div>
                            <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                                <Phone size={14} weight="bold" className="text-acid-lime" />
                                WhatsApp
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                placeholder="(11) 99999-9999"
                                className="w-full bg-deep-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid-lime/50 focus:ring-1 focus:ring-acid-lime/30 transition-all"
                            />
                        </div>
                    )}

                    {missing.includes('cpf') && (
                        <div>
                            <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                                <IdentificationCard size={14} weight="bold" className="text-acid-lime" />
                                CPF
                            </label>
                            <input
                                type="text"
                                value={cpf}
                                onChange={(e) => setCpf(formatCPF(e.target.value))}
                                placeholder="000.000.000-00"
                                className="w-full bg-deep-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid-lime/50 focus:ring-1 focus:ring-acid-lime/30 transition-all"
                            />
                        </div>
                    )}

                    {missing.includes('birthDate') && (
                        <div>
                            <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                                <Calendar size={14} weight="bold" className="text-acid-lime" />
                                Data de Nascimento
                            </label>
                            <input
                                type="text"
                                value={birthDate}
                                onChange={(e) => setBirthDate(formatBirthDate(e.target.value))}
                                placeholder="DD/MM/AAAA"
                                className="w-full bg-deep-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid-lime/50 focus:ring-1 focus:ring-acid-lime/30 transition-all"
                            />
                        </div>
                    )}

                    {missing.includes('gender') && (
                        <div>
                            <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                                <GenderIntersex size={14} weight="bold" className="text-acid-lime" />
                                Sexo
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setGender('male')}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-all
                                        ${gender === 'male'
                                            ? 'bg-acid-lime/10 border-acid-lime/50 text-acid-lime'
                                            : 'bg-deep-black border-white/10 text-zinc-400 hover:border-white/20'
                                        }`}
                                >
                                    Masculino
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGender('female')}
                                    className={`py-3 rounded-xl text-sm font-bold border transition-all
                                        ${gender === 'female'
                                            ? 'bg-acid-lime/10 border-acid-lime/50 text-acid-lime'
                                            : 'bg-deep-black border-white/10 text-zinc-400 hover:border-white/20'
                                        }`}
                                >
                                    Feminino
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {missing.includes('height') && (
                            <div>
                                <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                                    <Ruler size={14} weight="bold" className="text-acid-lime" />
                                    Altura (cm)
                                </label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="175"
                                    min={100}
                                    max={250}
                                    className="w-full bg-deep-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid-lime/50 focus:ring-1 focus:ring-acid-lime/30 transition-all"
                                />
                            </div>
                        )}

                        {missing.includes('weight') && (
                            <div>
                                <label className="text-xs font-bold text-zinc-400 mb-1.5 flex items-center gap-1.5">
                                    <Scales size={14} weight="bold" className="text-acid-lime" />
                                    Peso (kg)
                                </label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    placeholder="70"
                                    min={30}
                                    max={300}
                                    step={0.1}
                                    className="w-full bg-deep-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid-lime/50 focus:ring-1 focus:ring-acid-lime/30 transition-all"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-red-400 text-xs mt-3 text-center">{error}</p>
                )}

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full mt-6 py-3.5 bg-acid-lime text-deep-black font-black text-sm uppercase tracking-wider rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <SpinnerGap size={18} className="animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        'Salvar e Continuar'
                    )}
                </button>
            </div>
        </div>
    );
}

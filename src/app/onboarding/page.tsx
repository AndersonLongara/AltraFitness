"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function selectRole(role: "trainer" | "student") {
        if (!user) return;

        setIsLoading(true);

        try {
            // Update user metadata in Clerk
            await user.update({
                publicMetadata: {
                    ...user.publicMetadata,
                    role,
                },
            });

            // Redirect to appropriate dashboard
            const redirectUrl = role === "trainer" ? "/dashboard" : "/student";
            router.push(redirectUrl);
            router.refresh(); // Force middleware to re-run
        } catch (error) {
            console.error("Error setting role:", error);
            alert("Erro ao configurar tipo de usuário. Tente novamente.");
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-deep-black via-[#0a0a0a] to-deep-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-acid-lime/10 rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#2ECC71]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(204,255,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(204,255,0,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="w-full max-w-4xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-surface-grey to-[#141414] border-2 border-acid-lime/20 rounded-[28px] mb-8 shadow-[0_0_60px_rgba(204,255,0,0.2)]">
                        <span className="text-acid-lime text-5xl font-black tracking-tighter">A</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4 bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                        Bem-vindo ao AltraFit
                    </h1>
                    <p className="text-zinc-400 text-lg font-semibold">
                        Escolha como você quer usar a plataforma
                    </p>
                </div>

                {/* Role selection cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Trainer Card */}
                    <button
                        onClick={() => selectRole("trainer")}
                        disabled={isLoading}
                        className="group relative bg-[#16161a]/95 backdrop-blur-2xl rounded-[32px] border-2 border-white/5 p-12 text-left transition-all duration-300 hover:border-[#2ECC71]/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2ECC71]/10 via-transparent to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-[#2ECC71] to-[#27ae60] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(46,204,113,0.3)]">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-black text-white mb-3">
                                Sou Personal Trainer
                            </h2>
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">
                                Gerencie seus alunos, crie treinos e dietas, acompanhe evolução e administre seu negócio fitness
                            </p>

                            {/* Features */}
                            <ul className="space-y-2">
                                <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                    <span className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full mr-2" />
                                    Dashboard completo de gestão
                                </li>
                                <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                    <span className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full mr-2" />
                                    Criação de treinos e dietas com IA
                                </li>
                                <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                    <span className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full mr-2" />
                                    Controle financeiro e vendas
                                </li>
                            </ul>
                        </div>
                    </button>

                    {/* Student Card */}
                    <button
                        onClick={() => selectRole("student")}
                        disabled={isLoading}
                        className="group relative bg-[#16161a]/95 backdrop-blur-2xl rounded-[32px] border-2 border-white/5 p-12 text-left transition-all duration-300 hover:border-acid-lime/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-acid-lime/10 via-transparent to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px]" />

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="w-16 h-16 bg-gradient-to-br from-acid-lime to-[#d4ff33] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                                <svg className="w-8 h-8 text-deep-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>

                            {/* Content */}
                            <h2 className="text-2xl font-black text-white mb-3">
                                Sou Aluno
                            </h2>
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">
                                Acesse seus treinos, registre sua alimentação, acompanhe sua evolução e mantenha contato com seu personal
                            </p>

                            {/* Features */}
                            <ul className="space-y-2">
                                <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                    <span className="w-1.5 h-1.5 bg-acid-lime rounded-full mr-2" />
                                    App mobile otimizado para academia
                                </li>
                                <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                    <span className="w-1.5 h-1.5 bg-acid-lime rounded-full mr-2" />
                                    Execução de treinos com cronômetro
                                </li>
                                <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                    <span className="w-1.5 h-1.5 bg-acid-lime rounded-full mr-2" />
                                    Registro de refeições e evolução
                                </li>
                            </ul>
                        </div>
                    </button>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="text-center mt-12">
                        <div className="inline-flex items-center gap-3 text-zinc-400 font-semibold">
                            <div className="w-5 h-5 border-2 border-zinc-600 border-t-acid-lime rounded-full animate-spin" />
                            Configurando sua conta...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

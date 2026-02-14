"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserRole } from "@/app/actions/onboarding";

export default function OnboardingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function selectRole(role: "trainer" | "student") {
        setIsLoading(true);

        try {
            const redirectUrl = await setUserRole(role);
            router.push(redirectUrl);
            router.refresh();
        } catch (error) {
            console.error("Error setting role:", error);
            alert("Erro ao configurar tipo de usuário. Tente novamente.");
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#111113] border border-acid-lime/20 rounded-2xl mb-6 shadow-[0_0_40px_rgba(204,255,0,0.15)] relative">
                    <span className="text-acid-lime text-3xl font-black">A</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-acid-lime rounded-full shadow-[0_0_8px_rgba(204,255,0,0.9)]" />
                </div>
                <h1 className="text-4xl font-black text-white tracking-tight mb-4">
                    Bem-vindo ao AltraFit
                </h1>
                <p className="text-zinc-400 text-base font-semibold">
                    Escolha como você quer usar a plataforma
                </p>
            </div>

                {/* Role selection cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Trainer Card */}
                    <button
                        onClick={() => selectRole("trainer")}
                        disabled={isLoading}
                        className="group relative bg-[#111113] rounded-3xl border border-white/[0.06] p-10 text-left transition-all duration-200 hover:border-[#2ECC71]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="w-14 h-14 bg-gradient-to-br from-[#2ECC71] to-[#27ae60] rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(46,204,113,0.2)]">
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
                        className="group relative bg-[#111113] rounded-3xl border border-white/[0.06] p-10 text-left transition-all duration-200 hover:border-acid-lime/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="w-14 h-14 bg-gradient-to-br from-acid-lime to-[#d4ff33] rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
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
    );
}

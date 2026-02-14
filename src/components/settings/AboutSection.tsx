"use client";

import { Heart, Rocket, ShieldCheck, Code, GithubLogo } from "@phosphor-icons/react";

const APP_VERSION = "1.0.0";

export default function AboutSection() {
    return (
        <div className="space-y-6">
            {/* App Info */}
            <div className="bg-white rounded-[32px] p-8 soft-shadow border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-graphite-dark rounded-2xl flex items-center justify-center">
                        <span className="text-performance-green font-black text-2xl">A.</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-graphite-dark">AltraFit</h2>
                        <p className="text-sm font-medium text-slate-400">
                            Versão {APP_VERSION} · Plataforma de Gestão Fitness
                        </p>
                    </div>
                </div>

                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
                    AltraFit é a plataforma completa para personal trainers gerenciarem seus negócios fitness.
                    Com inteligência artificial integrada, gestão de alunos, treinos, nutrição e finanças em um só lugar.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                        icon={Rocket}
                        title="Tecnologia"
                        description="Next.js, React, Turso, Clerk, Tailwind CSS"
                    />
                    <InfoCard
                        icon={ShieldCheck}
                        title="Segurança"
                        description="Autenticação robusta via Clerk com proteção de dados"
                    />
                    <InfoCard
                        icon={Heart}
                        title="Suporte"
                        description="Prioridade para planos pagos. Contato via e-mail."
                    />
                    <InfoCard
                        icon={Code}
                        title="Integrações"
                        description="IA para treinos e dietas, Instagram, Webhooks"
                    />
                </div>
            </div>

            {/* Legal */}
            <div className="bg-white rounded-[24px] p-6 soft-shadow border border-slate-100">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Legal
                </h3>
                <div className="space-y-3">
                    <LegalLink label="Termos de Uso" />
                    <LegalLink label="Política de Privacidade" />
                    <LegalLink label="Política de Cookies" />
                </div>
                <p className="text-xs text-slate-400 mt-4">
                    © {new Date().getFullYear()} AltraFit. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}

function InfoCard({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Heart;
    title: string;
    description: string;
}) {
    return (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-performance-green/10 rounded-lg flex items-center justify-center">
                    <Icon size={18} weight="duotone" className="text-performance-green" />
                </div>
                <h4 className="text-sm font-bold text-graphite-dark">{title}</h4>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
        </div>
    );
}

function LegalLink({ label }: { label: string }) {
    return (
        <button className="block text-sm font-medium text-slate-500 hover:text-performance-green transition-colors">
            {label} →
        </button>
    );
}

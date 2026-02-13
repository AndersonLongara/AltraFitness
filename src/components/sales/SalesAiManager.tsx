'use client';

import { Sparkle, WarningCircle, CheckCircle } from "@phosphor-icons/react";

export default function SalesAiManager() {
    return (
        <div className="bg-graphite-dark text-white p-8 rounded-[24px] shadow-2xl relative overflow-hidden group border border-white/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkle weight="fill" className="text-blue-400" size={20} />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">AI Sales Assistant</h2>
                    </div>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-bold text-slate-300">
                        Online
                    </span>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <WarningCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-200">
                                <strong className="text-white">3 leads em Negociação</strong> não recebem contato há 48h.
                            </p>
                            <button className="text-xs font-bold text-blue-400 hover:text-blue-300 mt-2 underline">
                                Sugerir follow-up
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 items-start p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <CheckCircle size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-slate-200">
                                Sua taxa de resposta no WhatsApp aumentou <strong className="text-white">15%</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

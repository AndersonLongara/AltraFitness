"use client";

import { useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import { updateAsaasApiKey } from "@/app/actions/settings";
import { CurrencyCircleDollar, CaretDown, CaretUp, Link } from "@phosphor-icons/react";
import type { TrainerProfile } from "@/app/actions/settings";

export default function AccountSection({ profile }: { profile?: TrainerProfile }) {
    const [asaasKey, setAsaasKey] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

    const handleSaveAsaasKey = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await updateAsaasApiKey(asaasKey.trim() || null);
            setMessage(asaasKey.trim() ? "Chave Asaas salva. Você pode enviar cobranças PIX/Boleto/Cartão aos alunos." : "Chave removida.");
            setAsaasKey("");
        } catch (e) {
            setMessage("Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-pure-white rounded-[32px] soft-shadow overflow-hidden border border-slate-100 dark:border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CurrencyCircleDollar size={20} weight="duotone" />
                    </div>
                    <div>
                        <h3 className="font-bold text-graphite-dark">Cobranças Asaas</h3>
                        <p className="text-sm text-slate-500">Configure sua chave de API para enviar cobranças PIX, Boleto ou Cartão aos alunos.</p>
                    </div>
                </div>
                {profile?.hasAsaasKey && <p className="text-sm text-emerald-600 font-medium mb-2">Chave configurada. Para trocar, digite a nova abaixo.</p>}
                <p className="text-sm text-slate-500 mb-2">
                    O Asaas é opcional. Se preferir cobrar por fora (PIX manual, dinheiro), não precisa configurar. Em Financeiro use &quot;Registrar pagamento recebido&quot; ou &quot;Marcar como Pago&quot;.
                </p>
                <button
                    type="button"
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="flex items-center gap-2 text-sm font-medium text-performance-green hover:underline mb-3"
                >
                    {showInstructions ? <CaretUp size={16} /> : <CaretDown size={16} />}
                    Como criar conta Asaas e obter a chave?
                </button>
                {showInstructions && (
                    <div className="bg-slate-50 dark:bg-slate-200 rounded-xl p-4 mb-4 text-sm text-slate-600 dark:text-slate-400 space-y-2 border border-slate-100 dark:border-white/10">
                        <p><strong>1. Criar conta</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Produção: <a href="https://www.asaas.com/" target="_blank" rel="noopener noreferrer" className="text-performance-green hover:underline">asaas.com</a></li>
                            <li>Testes: <a href="https://sandbox.asaas.com/" target="_blank" rel="noopener noreferrer" className="text-performance-green hover:underline">sandbox.asaas.com</a></li>
                        </ul>
                        <p><strong>2. Obter a chave</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>No painel Asaas → <strong>Integrações</strong> → Nova chave de API</li>
                            <li>Ou: <a href="https://www.asaas.com/customerApiAccessToken/index" target="_blank" rel="noopener noreferrer" className="text-performance-green hover:underline flex items-center gap-1">
                                <Link size={14} /> Área de integrações
                            </a></li>
                            <li>Copie a chave <strong>imediatamente</strong> — ela só aparece uma vez</li>
                        </ul>
                        <p><strong>3. Cole aqui</strong> e clique em Salvar. Produção e Sandbox usam chaves diferentes.</p>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="password"
                        placeholder="Sua chave de API Asaas"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/20 bg-transparent dark:bg-white/5 text-sm outline-none focus:border-performance-green"
                        value={asaasKey}
                        onChange={(e) => setAsaasKey(e.target.value)}
                    />
                    <button
                        onClick={handleSaveAsaasKey}
                        disabled={saving}
                        className="px-4 py-2.5 bg-performance-green text-graphite-dark font-bold rounded-xl hover:brightness-110 disabled:opacity-60"
                    >
                        {saving ? "Salvando…" : "Salvar"}
                    </button>
                </div>
                {message && <p className="text-sm text-slate-600 mt-2">{message}</p>}
            </div>

            {/* Clerk UserProfile embedded */}
            <div className="bg-white dark:bg-pure-white rounded-[32px] soft-shadow overflow-hidden border border-slate-100 dark:border-white/10">
                <div className="p-2 md:p-4 overflow-x-auto">
                    <UserProfile
                        appearance={{
                            elements: {
                                rootBox: "w-full mx-auto",
                                card: "shadow-none border-none p-0 w-full",
                                navbar: "hidden md:flex",
                                navbarMobileMenuButton: "text-graphite-dark",
                                headerTitle: "text-xl font-bold text-graphite-dark",
                                headerSubtitle: "text-slate-500",
                                profileSectionTitleText: "text-graphite-dark font-bold",
                                accordionTriggerButton: "text-graphite-dark font-bold",
                                formButtonPrimary:
                                    "bg-performance-green hover:bg-emerald-600 text-white font-bold rounded-xl",
                                formFieldInput:
                                    "rounded-xl border-slate-200 focus:border-performance-green focus:ring-performance-green/20",
                                badge: "bg-performance-green/10 text-performance-green font-bold",
                            },
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { User, CurrencyCircleDollar, Copy, FloppyDisk } from "@phosphor-icons/react";
import Image from "next/image";
import { savePlatformAsaasConfig } from "@/app/actions/superadmin";

type Props = {
  user: {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
  };
  asaas: {
    hasApiKey: boolean;
    sandbox: boolean;
    hasWebhookToken: boolean;
  };
};

const WEBHOOK_PATH = "/api/webhooks/asaas";

export default function SuperAdminSettingsContent({ user, asaas: initialAsaas }: Props) {
  const [webhookFullUrl, setWebhookFullUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [sandbox, setSandbox] = useState(initialAsaas.sandbox);
  const [webhookToken, setWebhookToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setWebhookFullUrl(`${window.location.origin}${WEBHOOK_PATH}`);
  }, []);

  useEffect(() => {
    setSandbox(initialAsaas.sandbox);
  }, [initialAsaas.sandbox]);

  const copyWebhookUrl = () => {
    const url = webhookFullUrl || (typeof window !== "undefined" ? `${window.location.origin}${WEBHOOK_PATH}` : WEBHOOK_PATH);
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveAsaas = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      await savePlatformAsaasConfig({
        apiKey: apiKey === "" && initialAsaas.hasApiKey ? undefined : apiKey || undefined,
        sandbox,
        webhookToken: webhookToken === "" && initialAsaas.hasWebhookToken ? undefined : webhookToken || undefined,
      });
      setMessage({ type: "success", text: "Configuração Asaas salva." });
      setApiKey("");
      setWebhookToken("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao salvar.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Conta */}
      <section className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <User size={22} weight="duotone" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Conta</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Usuário Super Admin conectado</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt=""
              width={56}
              height={56}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email || "E-mail não informado"}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ID: {user.id}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Para alterar nome, e-mail ou senha, use a conta no Clerk (painel de autenticação).
        </p>
      </section>

      {/* Integração Asaas — formulário */}
      <section className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CurrencyCircleDollar size={22} weight="duotone" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Integração Asaas</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Configure aqui. Cobranças da plataforma e webhook usam estes dados.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAsaas} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Chave API (conta Asaas da plataforma)
            </label>
            <input
              type="password"
              autoComplete="off"
              placeholder={initialAsaas.hasApiKey ? "Deixe em branco para manter a atual" : "Cole sua chave da API Asaas"}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Asaas → Minha conta → Integrações → API. Use a chave da conta que receberá as cobranças dos personais.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="asaas-sandbox"
              checked={sandbox}
              onChange={(e) => setSandbox(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-500 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="asaas-sandbox" className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Usar ambiente Sandbox (testes)
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Token do webhook (opcional)
            </label>
            <input
              type="password"
              autoComplete="off"
              placeholder={initialAsaas.hasWebhookToken ? "Deixe em branco para manter" : "Token para validar chamadas do Asaas"}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              value={webhookToken}
              onChange={(e) => setWebhookToken(e.target.value)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Se preenchido, o Asaas deve enviar este valor no header <code className="bg-slate-100 dark:bg-white/10 px-1 rounded">asaas-access-token</code>.
            </p>
          </div>

          {message && (
            <p
              className={`text-sm font-medium ${message.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            <FloppyDisk size={20} weight="bold" />
            {saving ? "Salvando…" : "Salvar configuração Asaas"}
          </button>
        </form>

        <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            URL do webhook (cadastre no Asaas)
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-700 dark:text-slate-300 font-mono truncate">
              {webhookFullUrl || `https://seu-dominio.com${WEBHOOK_PATH}`}
            </code>
            <button
              type="button"
              onClick={copyWebhookUrl}
              className="p-2 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors min-w-[40px]"
              title="Copiar URL"
            >
              {copied ? (
                <span className="text-xs font-bold text-emerald-600">OK</span>
              ) : (
                <Copy size={18} weight="bold" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Asaas → Integrações → Webhooks. Eventos: PAYMENT_RECEIVED, PAYMENT_CONFIRMED. Use o token acima se configurou.
          </p>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Valores salvos aqui têm prioridade. Se não houver configuração no painel, o sistema usa as variáveis de ambiente (ASAAS_API_KEY, ASAAS_SANDBOX, ASAAS_WEBHOOK_TOKEN).
        </p>
      </section>
    </div>
  );
}

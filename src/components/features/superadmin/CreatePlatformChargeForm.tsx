"use client";

import { useState } from "react";
import { createPlatformCharge } from "@/app/actions/superadmin";

type Trainer = { id: string; name: string; email: string };

export default function CreatePlatformChargeForm({ trainers }: { trainers: Trainer[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainerId, setTrainerId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [billingType, setBillingType] = useState<"PIX" | "BOLETO" | "CREDIT_CARD" | "UNDEFINED">("UNDEFINED");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerId || !amount.trim() || !dueDate) {
      setError("Preencha cliente, valor e vencimento.");
      return;
    }
    const valueReais = parseFloat(amount.trim().replace(",", "."));
    if (Number.isNaN(valueReais) || valueReais <= 0) {
      setError("Informe um valor válido maior que zero (ex: 99,90).");
      return;
    }
    if (valueReais > 999_999.99) {
      setError("Valor máximo permitido é R$ 999.999,99.");
      return;
    }
    const amountCents = Math.round(valueReais * 100);
    setLoading(true);
    setError(null);
    try {
      const result = await createPlatformCharge({
        trainerId,
        amount: amountCents,
        dueDate: new Date(dueDate),
        description: description.trim() || undefined,
        billingType,
      });
      setOpen(false);
      setTrainerId("");
      setAmount("");
      setDueDate("");
      setDescription("");
      if (result.invoiceUrl) window.open(result.invoiceUrl, "_blank");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar cobrança.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-colors"
      >
        Nova cobrança
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1E2A36] rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cobrar cliente (personal)</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Cliente</label>
                <select
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white"
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                >
                  <option value="">Selecione</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Valor (R$)</label>
                <input
                  type="text"
                  placeholder="99,90"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Vencimento</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Forma de pagamento</label>
                <select
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white"
                  value={billingType}
                  onChange={(e) => setBillingType(e.target.value as any)}
                >
                  <option value="UNDEFINED">Cliente escolhe</option>
                  <option value="PIX">PIX</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="CREDIT_CARD">Cartão de crédito</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Assinatura mensal Jan/2025"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-xl disabled:opacity-60">
                  {loading ? "Criando…" : "Gerar cobrança"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

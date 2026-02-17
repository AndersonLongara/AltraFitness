"use client";

import { useState } from "react";
import { Check, SpinnerGap } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TrialActivationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planSlug: string;
  planName: string;
  priceAfterTrial: string; // ex: "R$ 99,90/mês" ou "R$ 851,15/ano"
  onConfirm: () => Promise<string | void>; // retorna URL de checkout ou void
  onCancel?: () => void;
}

const CHECKLIST = [
  "R$ 0,00 cobrados hoje.",
  "Cartão válido obrigatório para ativar o trial (validação sem cobrança).",
  "Acesso total à IA e Planos Alimentares.",
  "Lembrete automático antes da primeira cobrança.",
];

export default function TrialActivationModal({
  open,
  onOpenChange,
  planSlug,
  planName,
  priceAfterTrial,
  onConfirm,
  onCancel,
}: TrialActivationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trialEndDate = addDays(new Date(), 30);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const url = await onConfirm();
      if (typeof url === "string" && url) {
        window.location.href = url;
      } else {
        onOpenChange(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao ativar trial. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="max-w-md rounded-[32px] border border-zinc-800 bg-[#111113] p-0 overflow-hidden shadow-xl [&>button:last-child]:text-zinc-400 [&>button:last-child]:hover:text-white"
      >
        <div className="p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white text-center">
              Comece seus 30 dias de {planName} agora
            </DialogTitle>
            <DialogDescription className="text-center text-zinc-400 font-medium mt-2">
              Cancele quando quiser com um clique.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {CHECKLIST.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2ECC71]/20 flex items-center justify-center flex-shrink-0">
                  <Check size={14} weight="bold" className="text-[#2ECC71]" />
                </div>
                <span className="text-zinc-300 font-semibold text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 py-4 px-5 rounded-xl bg-[#0D1117] border border-zinc-800">
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Total hoje
            </p>
            <p className="text-2xl font-black text-[#2ECC71]">R$ 0,00</p>
          </div>

          <p className="mt-4 text-sm font-medium text-zinc-400 text-center">
            Você será redirecionado para uma página segura para cadastrar seu cartão. Não há cobrança hoje. Sua assinatura começará em{" "}
            <span className="font-bold text-white">
              {format(trialEndDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            {", "}
            quando o valor de {priceAfterTrial} será debitado automaticamente.
          </p>

          {error && (
            <p className="mt-3 text-sm font-semibold text-red-400 text-center">{error}</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "w-full mt-6 py-4 rounded-xl font-black text-base transition-all duration-200 flex items-center justify-center gap-2",
              "bg-[#2ECC71] text-[#131B23] hover:bg-[#27ae60] shadow-lg shadow-[#2ECC71]/20",
              "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <SpinnerGap size={20} weight="bold" className="animate-spin" />
                Preparando checkout...
              </>
            ) : (
              "Continuar — Cadastrar cartão (sem cobrança hoje)"
            )}
          </button>

          {onCancel && (
            <button
              onClick={() => {
                onCancel();
                onOpenChange(false);
              }}
              className="w-full mt-3 text-sm font-semibold text-zinc-500 hover:text-zinc-300"
            >
              Voltar e escolher outro plano
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

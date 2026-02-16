"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CheckoutSuccessView() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/dashboard"), 3500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-[#2ECC71]/20 w-16 h-16 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-[#2ECC71]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Assinatura ativa</h1>
      <p className="text-zinc-400 max-w-sm mb-6">
        Você não foi cobrado hoje. Sua primeira cobrança será em 30 dias.
      </p>
      <p className="text-zinc-500 text-sm">
        Redirecionando para o painel…
      </p>
      <a
        href="/dashboard"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#2ECC71] text-[#131B23] font-bold px-6 py-3 hover:bg-[#27ae60] transition-colors"
      >
        Ir para o painel
      </a>
    </div>
  );
}

"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SuperAdminListing from "./SuperAdminListing";

type Charge = {
  id: string;
  trainerId: string;
  trainer?: { name: string } | null;
  amount: number;
  dueDate: Date | string | null;
  description: string | null;
  status: string | null;
  asaasInvoiceUrl: string | null;
};

const emptyMsg = 'Nenhum pagamento à plataforma. Use "Nova cobrança" para cobrar um cliente (personal).';

export default function ChargesListingClient(props: { charges: Charge[] }) {
  const { charges } = props;
  return (
    <SuperAdminListing<Charge>
      data={charges}
      getRowKey={(c) => c.id}
      emptyMessage={emptyMsg}
      columns={[
        {
          id: "trainer",
          label: "Cliente (personal)",
          render: (c) => (
            <Link href={"/superadmin/trainers/" + c.trainerId} className="text-amber-600 hover:underline font-medium">
              {c.trainer?.name ?? c.trainerId}
            </Link>
          ),
        },
        { id: "amount", label: "Valor", render: (c) => <span className="font-semibold text-slate-900 dark:text-white">R$ {(c.amount / 100).toFixed(2)}</span> },
        { id: "dueDate", label: "Vencimento", render: (c) => <span className="text-slate-600 dark:text-slate-200">{c.dueDate ? format(new Date(c.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "—"}</span> },
        { id: "description", label: "Descrição", render: (c) => <span className="text-slate-600 dark:text-slate-200">{c.description ?? "—"}</span>, hideOnCard: true },
        {
          id: "status",
          label: "Status",
          render: (c) => (
            <span className={"inline-flex px-2 py-1 text-xs font-semibold rounded-lg " + (c.status === "paid" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300")}>
              {c.status === "paid" ? "Pago" : "Pendente"}
            </span>
          ),
        },
        {
          id: "link",
          label: "Link",
          render: (c) =>
            c.asaasInvoiceUrl ? (
              <a href={c.asaasInvoiceUrl} target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-medium">Ver cobrança</a>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">—</span>
            ),
        },
      ]}
    />
  );
}

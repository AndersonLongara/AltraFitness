"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CaretRight } from "@phosphor-icons/react";
import SuperAdminListing from "@/components/features/superadmin/SuperAdminListing";

type Trainer = {
  id: string;
  name: string;
  email: string;
  studentsCount: number;
  plansCount: number;
  subscriptionPlan: string | null;
  createdAt: Date | string | null;
};

export default function TrainersListingClient(props: { trainers: Trainer[] }) {
  const { trainers } = props;
  return (
    <SuperAdminListing<Trainer>
      data={trainers}
      getRowKey={(t) => t.id}
      emptyMessage="Nenhum cliente cadastrado."
      columns={[
        { id: "name", label: "Nome", render: (t) => <span className="font-medium text-slate-900 dark:text-white">{t.name}</span> },
        { id: "email", label: "E-mail", render: (t) => <span className="text-slate-600 dark:text-slate-200">{t.email}</span>, hideOnCard: true },
        { id: "students", label: "Alunos", render: (t) => <span className="text-slate-600 dark:text-slate-200">{t.studentsCount}</span> },
        { id: "plans", label: "Planos", render: (t) => <span className="text-slate-600 dark:text-slate-200">{t.plansCount}</span> },
        {
          id: "subscription",
          label: "Assinatura",
          render: (t) => (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-white/15 text-slate-600 dark:text-slate-200">
              {t.subscriptionPlan ?? "free"}
            </span>
          ),
        },
        { id: "createdAt", label: "Cadastro", render: (t) => <span className="text-slate-500 dark:text-slate-300 text-sm">{t.createdAt ? format(new Date(t.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "—"}</span>, hideOnCard: true },
        {
          id: "actions",
          label: "",
          render: (t) => (
            <Link
              href={`/superadmin/trainers/${t.id}`}
              className="p-2 rounded-lg text-slate-400 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-block"
              aria-label="Ver detalhes"
            >
              <CaretRight size={20} weight="bold" />
            </Link>
          ),
        },
      ]}
    />
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash, Prohibit, CheckCircle } from "@phosphor-icons/react";
import SuperAdminListing from "@/components/features/superadmin/SuperAdminListing";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { deleteStudentByStudentId, setStudentActive } from "@/app/actions/superadmin";

type Student = {
  id: string;
  name: string;
  email: string | null;
  trainerId: string;
  trainer?: { name: string } | null;
  plan?: { name: string } | null;
  planEnd: Date | string | null;
  active: boolean | null;
};

export default function StudentsListingClient({ students }: { students: Student[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteStudentByStudentId(deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleToggleActive(s: Student) {
    setTogglingId(s.id);
    setError(null);
    const result = await setStudentActive(s.id, !s.active);
    setTogglingId(null);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 underline">
            Fechar
          </button>
        </div>
      )}
      <SuperAdminListing<Student>
        data={students}
        getRowKey={(s) => s.id}
        emptyMessage="Nenhum aluno encontrado."
        columns={[
          { id: "name", label: "Aluno", render: (s) => <span className="font-medium text-slate-900 dark:text-white">{s.name}</span> },
          { id: "email", label: "E-mail", render: (s) => <span className="text-slate-600 dark:text-slate-200">{s.email ?? "—"}</span>, hideOnCard: true },
          { id: "trainer", label: "Cliente (Personal)", render: (s) => <Link href={`/superadmin/trainers/${s.trainerId}`} className="text-amber-600 dark:text-amber-400 hover:underline font-medium">{s.trainer?.name ?? s.trainerId}</Link> },
          { id: "plan", label: "Plano", render: (s) => <span className="text-slate-600 dark:text-slate-200">{s.plan?.name ?? "—"}</span> },
          { id: "planEnd", label: "Vencimento", render: (s) => <span className="text-slate-600 dark:text-slate-200">{s.planEnd ? format(new Date(s.planEnd), "dd/MM/yyyy", { locale: ptBR }) : "—"}</span>, hideOnCard: true },
          { id: "status", label: "Status", render: (s) => <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${s.active ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" : "bg-slate-100 dark:bg-white/15 text-slate-600 dark:text-slate-200"}`}>{s.active ? "Ativo" : "Inativo"}</span> },
          {
            id: "actions",
            label: "",
            render: (s) => (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleActive(s)}
                  disabled={!!togglingId}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors disabled:opacity-50"
                  aria-label={s.active ? "Inativar aluno" : "Ativar aluno"}
                  title={s.active ? "Inativar aluno" : "Ativar aluno"}
                >
                  {s.active ? <Prohibit size={18} weight="bold" /> : <CheckCircle size={18} weight="bold" />}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(s)}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  aria-label="Excluir aluno"
                >
                  <Trash size={18} weight="bold" />
                </button>
              </div>
            ),
          },
        ]}
      />
      <ConfirmationModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir aluno"
        description={
          deleting ? (
            <>
              Tem certeza que deseja excluir <strong>{deleting.name}</strong>
              {deleting.email ? ` (${deleting.email})` : ""}? Todos os dados do aluno (treinos, nutrição, avaliações, pagamentos, etc.) serão removidos. Esta ação não pode ser desfeita.
            </>
          ) : (
            ""
          )
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

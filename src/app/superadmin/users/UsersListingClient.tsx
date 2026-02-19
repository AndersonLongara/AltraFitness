"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CaretRight, Trash } from "@phosphor-icons/react";
import SuperAdminListing from "@/components/features/superadmin/SuperAdminListing";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { deleteUserByUserId, type SuperAdminUserRow } from "@/app/actions/superadmin";

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  trainer: "Personal",
  student: "Aluno",
};

const ROLE_STYLES: Record<string, string> = {
  superadmin: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300",
  trainer: "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300",
  student: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
};

export default function UsersListingClient({ users }: { users: SuperAdminUserRow[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<SuperAdminUserRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    setError(null);
    const result = await deleteUserByUserId(deleting.userId);
    setIsDeleting(false);
    if ("error" in result) {
      setError(result.error);
      setDeleting(null);
      return;
    }
    
    // Aguardar um pouco para o Clerk processar
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Force hard reload to bypass all caches
    window.location.reload();
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-medium">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 underline">
            Fechar
          </button>
        </div>
      )}
    <SuperAdminListing<SuperAdminUserRow>
      data={users}
      getRowKey={(u) => u.userId}
      emptyMessage="Nenhum usuário cadastrado."
      columns={[
        { id: "name", label: "Nome", render: (u) => <span className="font-medium text-slate-900 dark:text-white">{u.name}</span> },
        { id: "email", label: "E-mail", render: (u) => <span className="text-slate-600 dark:text-slate-200">{u.email || "—"}</span>, hideOnCard: true },
        {
          id: "role",
          label: "Função",
          render: (u) => (
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${
                ROLE_STYLES[u.role] ?? "bg-slate-100 dark:bg-white/15 text-slate-600 dark:text-slate-200"
              }`}
            >
              {ROLE_LABELS[u.role] ?? u.role}
            </span>
          ),
        },
        {
          id: "createdAt",
          label: "Cadastro",
          render: (u) => (
            <span className="text-slate-500 dark:text-slate-300 text-sm">
              {u.createdAt ? format(new Date(u.createdAt), "dd/MM/yyyy", { locale: ptBR }) : "—"}
            </span>
          ),
          hideOnCard: true,
        },
        {
          id: "actions",
          label: "",
          render: (u) => (
            <div className="flex items-center gap-1">
              {u.hasTrainerRecord && (
                <Link
                  href={`/superadmin/trainers/${u.userId}`}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-block"
                  aria-label="Ver detalhes"
                >
                  <CaretRight size={20} weight="bold" />
                </Link>
              )}
              {u.role !== "superadmin" && (
                <button
                  type="button"
                  onClick={() => setDeleting(u)}
                  className="p-2 rounded-lg text-slate-400 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  aria-label="Excluir"
                >
                  <Trash size={18} weight="bold" />
                </button>
              )}
            </div>
          ),
        },
      ]}
    />
      <ConfirmationModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir usuário"
        description={
          deleting ? (
            <>
              Tem certeza que deseja excluir <strong>{deleting.name}</strong>
              {deleting.email ? ` (${deleting.email})` : ""}? A conta no Clerk será excluída.
              {deleting.hasTrainerRecord && " Todos os dados do personal e alunos serão removidos."}
              {" Esta ação não pode ser desfeita."}
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

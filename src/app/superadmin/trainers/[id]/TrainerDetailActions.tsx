"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, Prohibit, CheckCircle } from "@phosphor-icons/react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { deleteTrainerUser, setTrainerSubscriptionStatus } from "@/app/actions/superadmin";

export default function TrainerDetailActions({
  trainerId,
  trainerName,
  subscriptionStatus,
}: {
  trainerId: string;
  trainerName: string;
  subscriptionStatus: string;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInactive = subscriptionStatus === "inactive";

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteTrainerUser(trainerId);
    setIsDeleting(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.push("/superadmin/trainers");
    router.refresh();
  }

  async function handleToggleStatus() {
    setIsToggling(true);
    setError(null);
    const result = await setTrainerSubscriptionStatus(trainerId, isInactive ? "active" : "inactive");
    setIsToggling(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={handleToggleStatus}
          disabled={isToggling}
          className={isInactive ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50" : "text-amber-600 border-amber-200 hover:bg-amber-50"}
        >
          {isInactive ? <CheckCircle size={18} weight="bold" className="mr-2" /> : <Prohibit size={18} weight="bold" className="mr-2" />}
          {isInactive ? "Ativar cliente" : "Inativar cliente"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
        >
          <Trash size={18} weight="bold" className="mr-2" />
          Excluir cliente
        </Button>
      </div>
      {error && (
        <div className="fixed bottom-4 right-4 p-4 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium shadow-lg">
          {error}
          <button type="button" onClick={() => setError(null)} className="ml-2 underline">
            Fechar
          </button>
        </div>
      )}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir cliente"
        description={
          <>
            Tem certeza que deseja excluir <strong>{trainerName}</strong>? Todos os dados do personal, alunos,
            planos e pagamentos serão removidos. A conta no Clerk será excluída. Esta ação não pode ser desfeita.
          </>
        }
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

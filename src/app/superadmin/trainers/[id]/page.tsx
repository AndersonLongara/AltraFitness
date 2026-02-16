import { getSuperAdminTrainerById } from "@/app/actions/superadmin";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Users, CreditCard, CurrencyCircleDollar } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import TrainerDetailActions from "./TrainerDetailActions";

export const dynamic = "force-dynamic";

export default async function SuperAdminTrainerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trainer = await getSuperAdminTrainerById(id);
  if (!trainer) notFound();

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/superadmin/trainers"
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">{trainer.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{trainer.email}</p>
            </div>
          </div>
          <TrainerDetailActions
            trainerId={trainer.id}
            trainerName={trainer.name}
            subscriptionStatus={trainer.subscriptionStatus ?? "active"}
          />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Users size={20} weight="duotone" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Alunos</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{trainer.studentsCount}</p>
          </div>
          <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                <CreditCard size={20} weight="duotone" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Planos</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{trainer.plans.length}</p>
          </div>
          <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CurrencyCircleDollar size={20} weight="duotone" />
              </div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase">Assinatura</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">
              {trainer.subscriptionPlan ?? "free"} · {trainer.subscriptionStatus ?? "—"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
            <h2 className="px-6 py-4 border-b border-slate-100 dark:border-white/10 font-bold text-slate-800 dark:text-white">
              Planos deste cliente
            </h2>
            <ul className="divide-y divide-slate-100 dark:divide-white/10">
              {trainer.plans.map((p) => (
                <li key={p.id} className="px-6 py-3 flex justify-between items-center">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    R$ {(p.price / 100).toFixed(2)} · {p.durationMonths} meses
                    {p.active ? "" : " · Inativo"}
                  </span>
                </li>
              ))}
              {trainer.plans.length === 0 && (
                <li className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum plano cadastrado.</li>
              )}
            </ul>
          </div>

          <div className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
            <h2 className="px-6 py-4 border-b border-slate-100 dark:border-white/10 font-bold text-slate-800 dark:text-white">
              Últimos pagamentos
            </h2>
            <ul className="divide-y divide-slate-100 dark:divide-white/10">
              {trainer.recentPayments.map((pay) => (
                <li key={pay.id} className="px-6 py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{pay.student?.name ?? pay.studentId}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{pay.plan?.name ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      R$ {(pay.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {pay.paidAt
                        ? format(new Date(pay.paidAt), "dd/MM/yyyy", { locale: ptBR })
                        : pay.dueDate
                        ? `Venc: ${format(new Date(pay.dueDate), "dd/MM/yyyy", { locale: ptBR })}`
                        : pay.status}
                    </p>
                  </div>
                </li>
              ))}
              {trainer.recentPayments.length === 0 && (
                <li className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">Nenhum pagamento recente.</li>
              )}
            </ul>
          </div>
        </div>
    </>
  );
}

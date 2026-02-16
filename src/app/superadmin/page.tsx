import { getSuperAdminStats, getSuperAdminDashboardCharts } from "@/app/actions/superadmin";
import SuperAdminDashboardCharts from "@/components/features/superadmin/SuperAdminDashboardCharts";
import { ChalkboardTeacher, Users, CurrencyCircleDollar, Receipt } from "@phosphor-icons/react/dist/ssr";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const [stats, chartsData] = await Promise.all([
    getSuperAdminStats(),
    getSuperAdminDashboardCharts(),
  ]);

  const cards = [
    {
      title: "Clientes (Personal)",
      value: stats.totalTrainers.toString(),
      icon: <ChalkboardTeacher size={24} weight="duotone" />,
    },
    {
      title: "Total de Alunos",
      value: stats.totalStudents.toString(),
      icon: <Users size={24} weight="duotone" />,
    },
    {
      title: "Receita do mês",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(stats.revenueThisMonth / 100),
      icon: <CurrencyCircleDollar size={24} weight="duotone" />,
    },
    {
      title: "Pagamentos (mês)",
      value: `${stats.paidCountThisMonth} recebidos`,
      icon: <Receipt size={24} weight="duotone" />,
    },
  ];

  return (
    <>
      <header>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Painel Super Admin
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Visão geral da plataforma · {format(new Date(), "EEEE, d MMMM yyyy", { locale: ptBR })}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white dark:bg-[#1E2A36] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</p>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                  {card.title}
                </p>
              </div>
            </div>
          ))}
        </div>

      <SuperAdminDashboardCharts data={chartsData} />
    </>
  );
}

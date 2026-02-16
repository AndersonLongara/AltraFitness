"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChartLineUp,
  CurrencyCircleDollar,
  Users,
  Receipt,
  Storefront,
  ListChecks,
} from "@phosphor-icons/react";

export type DashboardChartsData = {
  revenueByMonth: { month: string; receita: number; receitaPlataforma: number }[];
  paymentsByStatus: { status: string; count: number }[];
  topTrainersByRevenue: { name: string; receita: number }[];
  signupsByMonth: { month: string; personais: number; alunos: number }[];
  platformChargesSummary: {
    pendingCount: number;
    pendingAmount: number;
    paidCount: number;
    paidAmount: number;
  };
  recentPayments: {
    id: string;
    amount: number;
    status: string | null;
    paidAt: Date | null;
    dueDate: Date;
    createdAt: Date | null;
    trainer: { id: string; name: string } | null;
    student: { id: string; name: string } | null;
  }[];
};

const STATUS_COLORS: Record<string, string> = {
  Pago: "#10b981",
  Pendente: "#f59e0b",
  Atrasado: "#ef4444",
};

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

export default function SuperAdminDashboardCharts({ data }: { data: DashboardChartsData }) {
  const {
    revenueByMonth,
    paymentsByStatus,
    topTrainersByRevenue,
    signupsByMonth,
    platformChargesSummary,
    recentPayments,
  } = data;

  return (
    <div className="space-y-8">
      {/* Receita por mês (Personais + Plataforma) */}
      <section className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ChartLineUp size={22} weight="duotone" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Receita nos últimos 12 meses</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personais → alunos e Plataforma → personais</p>
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="saReceitaPersonais" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="saReceitaPlataforma" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                dy={8}
              />
              <YAxis
                tickFormatter={(v) => (v >= 1000 ? `R$${v / 1000}k` : `R$${v}`)}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                width={42}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                  padding: "12px 16px",
                }}
                formatter={(value: number | undefined) => [formatBRL(value ?? 0), ""]}
                labelFormatter={(label) => label}
              />
              <Legend
                wrapperStyle={{ paddingTop: 16 }}
                formatter={(value) => (value === "receita" ? "Personais → alunos" : "Plataforma → personais")}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="receita"
                name="receita"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#saReceitaPersonais)"
              />
              <Area
                type="monotone"
                dataKey="receitaPlataforma"
                name="receitaPlataforma"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#saReceitaPlataforma)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pagamentos por status */}
        <section className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Receipt size={22} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Pagamentos por status</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personais → alunos</p>
            </div>
          </div>
          <div className="h-[240px] flex justify-center">
            {paymentsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={88}
                    paddingAngle={2}
                    label={({ name, value }) => `${name ?? ""}: ${value ?? 0}`}
                    labelLine={false}
                  >
                    {paymentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, "cobranças"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm self-center">Nenhum pagamento registrado</p>
            )}
          </div>
        </section>

        {/* Top personais por receita */}
        <section className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <CurrencyCircleDollar size={22} weight="duotone" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Top personais por receita</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total recebido (pago)</p>
            </div>
          </div>
          <div className="h-[240px] w-full">
            {topTrainersByRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topTrainersByRevenue}
                  layout="vertical"
                  margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" tickFormatter={(v) => formatBRL(v)} hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "none",
                      boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value: number | undefined) => [formatBRL(value ?? 0), "Receita"]}
                  />
                  <Bar dataKey="receita" fill="#8b5cf6" radius={[0, 6, 6, 0]} name="Receita" maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm h-full flex items-center justify-center">Nenhum dado ainda</p>
            )}
          </div>
        </section>
      </div>

      {/* Novos cadastros por mês */}
      <section className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Users size={22} weight="duotone" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Novos cadastros por mês</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Personais e alunos</p>
          </div>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={signupsByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 8 }} iconType="circle" iconSize={8} />
              <Bar dataKey="personais" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Personais" maxBarSize={36} />
              <Bar dataKey="alunos" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Alunos" maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Resumo cobranças plataforma + Últimos pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resumo plataforma */}
        <section className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Storefront size={22} weight="duotone" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cobranças plataforma</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Recebidas</span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {formatBRL(platformChargesSummary.paidAmount)} ({platformChargesSummary.paidCount})
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-400">Pendentes</span>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                {formatBRL(platformChargesSummary.pendingAmount)} ({platformChargesSummary.pendingCount})
              </span>
            </div>
          </div>
        </section>

        {/* Últimos pagamentos - tabela */}
        <section className="lg:col-span-2 bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <ListChecks size={22} weight="duotone" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Últimos pagamentos (alunos → personais)</h2>
          </div>
          <div className="overflow-x-auto">
            {recentPayments.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-white/10">
                    <th className="pb-3 pr-4">Personal / Aluno</th>
                    <th className="pb-3 pr-4">Valor</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 dark:border-white/5 last:border-0">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{p.trainer?.name ?? "—"}</span>
                        <span className="text-slate-400 dark:text-slate-500"> → </span>
                        <span className="text-slate-600 dark:text-slate-300">{p.student?.name ?? "—"}</span>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">{formatBRL(p.amount / 100)}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            p.status === "paid"
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                              : p.status === "overdue"
                                ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                                : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {p.status === "paid" ? "Pago" : p.status === "overdue" ? "Atrasado" : "Pendente"}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {p.paidAt
                          ? format(new Date(p.paidAt), "dd/MM/yy", { locale: ptBR })
                          : format(new Date(p.dueDate), "dd/MM/yy", { locale: ptBR })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm py-6">Nenhum pagamento registrado</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

import { Bell, MagnifyingGlass, Users, Wallet, Trophy } from "@phosphor-icons/react/dist/ssr";
import Sidebar from "@/components/layout/Sidebar";
import MetricCard from "@/components/dashboard/MetricCard";
import AiManager from "@/components/dashboard/AiManager";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import RenewalsList from "@/components/dashboard/RenewalsList";
import { db } from "@/db";
import { students, payments } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { syncTrainer } from "./actions/auth";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  // CHECK FOR STUDENT ROLE FIRST
  const user = await currentUser();
  if (user) {
    const email = user.emailAddresses[0]?.emailAddress;

    // Check if this email belongs to a student
    const student = await db.query.students.findFirst({
      where: eq(students.email, email)
    });

    if (student) {
      // It's a student! Redirect to student dashboard
      return redirect("/student");
    }
  }

  // Sync trainer record from Clerk to DB (Only if not a student)
  await syncTrainer();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const currentMonthName = format(now, "MMM", { locale: ptBR });

  // 1. Fetch Active Students Count
  const [activeCountRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(students)
    .where(and(eq(students.trainerId, userId), eq(students.active, true)));

  const activeCount = activeCountRes?.count || 0;

  // 2. Fetch Monthly Revenue
  const [revenueRes] = await db
    .select({ total: sql<number>`sum(${payments.amount})` })
    .from(payments)
    .where(
      and(
        eq(payments.trainerId, userId),
        eq(payments.status, 'paid'),
        gte(payments.paidAt, monthStart),
        lte(payments.paidAt, monthEnd)
      )
    );

  const monthlyRevenue = (revenueRes?.total || 0) / 100;
  const formattedRevenue = `R$ ${(monthlyRevenue / 1000).toFixed(1)}k`;

  // 3. Fetch New Signups (This Month)
  const [newSignupsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(students)
    .where(
      and(
        eq(students.trainerId, userId),
        gte(students.createdAt, monthStart),
        lte(students.createdAt, monthEnd)
      )
    );

  const newSignups = newSignupsRes?.count || 0;

  // 4. Fetch Upcoming Renewals (Next 30 days or overdue)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingRenewalsRaw = await db.query.students.findMany({
    where: and(
      eq(students.trainerId, userId),
      eq(students.active, true)
    ),
    with: {
      plan: true,
    },
    columns: {
      id: true,
      name: true,
      planEnd: true,
    }
  });

  // Filter and map for RenewalsList
  const renewals = upcomingRenewalsRaw
    .filter(s => s.planEnd)
    .map(s => {
      const diff = s.planEnd!.getTime() - now.getTime();
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return {
        id: s.id,
        name: s.name,
        plan: s.plan?.name || "Sem Plano",
        daysLeft,
        overdue: daysLeft < 0
      };
    })
    .filter(r => r.daysLeft <= 30) // Only relevant ones
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5); // Take top 5

  return (
    <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
      <Sidebar />

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-4 md:mb-2">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-4xl font-extrabold text-graphite-dark tracking-tight truncate">
              Olá, <span className="text-slate-400">Anderson</span> 👋
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">
              Aqui está o resumo do seu estúdio hoje.
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Search — desktop only */}
            <div className="hidden md:flex items-center bg-pure-white px-4 py-4 rounded-2xl soft-shadow border border-slate-100 w-64">
              <MagnifyingGlass size={20} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Buscar alunos..."
                className="bg-transparent outline-none text-sm font-medium text-slate-600 w-full placeholder:text-slate-300"
              />
            </div>

            <button className="p-2 md:p-3 bg-pure-white rounded-2xl soft-shadow text-slate-600 hover:text-performance-green transition-colors relative">
              <Bell size={22} weight="duotone" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-100 overflow-hidden soft-shadow cursor-pointer shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600"></div>
            </div>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          <MetricCard
            title="Alunos Ativos"
            value={activeCount.toString()}
            trend="+12%" // Still mock trend for now as we don't have historical deltas easily
            trendUp={true}
            icon={Users}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <MetricCard
            title={`Receita (${currentMonthName})`}
            value={formattedRevenue}
            trend="+8.4%"
            trendUp={true}
            icon={Wallet}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <div className="col-span-2 md:col-span-1">
            <MetricCard
              title="Novas Matrículas"
              value={newSignups.toString()}
              trend="+0%"
              trendUp={true}
              icon={Trophy}
              iconColor="text-orange-500"
              iconBg="bg-orange-50"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Performance Chart */}
          <div className="md:col-span-2 h-64 md:h-80">
            <PerformanceChart />
          </div>

          {/* AI Manager */}
          <div className="md:col-span-1 md:row-span-2 min-h-[280px] md:min-h-[320px]">
            <AiManager />
          </div>

          {/* Renewals */}
          <div className="md:col-span-2 min-h-[240px] md:min-h-[300px]">
            <RenewalsList renewals={renewals} />
          </div>
        </div>
      </main>
    </div>
  );
}

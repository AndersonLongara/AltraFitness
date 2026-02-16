import LayoutSidebar from "@/components/layout/LayoutSidebar";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students, payments } from "@/db/schema";
import { eq, and, gte, lte, gt } from "drizzle-orm";
import { Users, Money, Trophy, Clock } from "@phosphor-icons/react/dist/ssr";
import { format, startOfMonth, endOfMonth, addDays, subMonths, eachMonthOfInterval, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import RevenueChart from "@/components/dashboard/RevenueChart";
import StatCard from "@/components/dashboard/StatCard";
import AiManager from "@/components/dashboard/AiManager";
import OnboardingChecklist from "@/components/features/dashboard/OnboardingChecklist";
import { getConfigTutorialStatus } from "@/app/actions/settings";

export const dynamic = 'force-dynamic';

const defaultConfigTutorial = { hasAsaasKey: false, plansCount: 0, studentsCount: 0 };

export default async function DashboardPage() {
    const user = await currentUser();
    const userId = user?.id;
    if (!userId) return null;

    let configTutorial = defaultConfigTutorial;
    let studentsCount = 0;
    let newStudentsCount = 0;
    type StudentWithPlan = Awaited<ReturnType<typeof db.query.students.findMany>>[number] & { plan?: { name: string | null } | null };
    let expiringStudents: StudentWithPlan[] = [];
    let monthlyRevenue = 0;
    let chartData: { name: string; value: number }[] = [];

    try {
        configTutorial = await getConfigTutorialStatus();
        const now = new Date();
        const startMonth = startOfMonth(now);
        const endMonth = endOfMonth(now);
        const next30Days = addDays(now, 30);

        studentsCount = await db.$count(students, eq(students.trainerId, userId));
        newStudentsCount = await db.$count(students, and(
            eq(students.trainerId, userId),
            gte(students.createdAt, startMonth)
        ));

        expiringStudents = await db.query.students.findMany({
            where: and(
                eq(students.trainerId, userId),
                gt(students.planEnd, now),
                lte(students.planEnd, next30Days)
            ),
            limit: 5,
            with: { plan: true }
        });

        const monthlyPayments = await db.query.payments.findMany({
            where: and(
                eq(payments.trainerId, userId),
                eq(payments.status, 'paid'),
                gte(payments.paidAt, startMonth),
                lte(payments.paidAt, endMonth)
            )
        });
        monthlyRevenue = monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0);

        const sixMonthsAgo = subMonths(now, 5);
        const recentMonts = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
        const historicalPayments = await db.query.payments.findMany({
            where: and(
                eq(payments.trainerId, userId),
                eq(payments.status, 'paid'),
                gte(payments.paidAt, startOfMonth(sixMonthsAgo))
            )
        });

        chartData = recentMonts.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const revenue = historicalPayments
                .filter(p => p.paidAt && p.paidAt >= monthStart && p.paidAt <= monthEnd)
                .reduce((acc, curr) => acc + curr.amount, 0);
            return {
                name: format(month, 'MMM', { locale: ptBR }).toUpperCase(),
                value: revenue
            };
        });
    } catch (err) {
        console.error("[DashboardPage] Error loading data:", err instanceof Error ? err.message : String(err));
    }

    const now = new Date();
    const hasAnyData = studentsCount > 0 || monthlyRevenue > 0;
    const revenueFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(monthlyRevenue / 100);

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                {/* Tutorial de configuração (Asaas, planos, alunos) — no início para quem ainda não configurou */}
                <OnboardingChecklist
                    hasAsaasKey={configTutorial.hasAsaasKey}
                    plansCount={configTutorial.plansCount}
                    studentsCount={configTutorial.studentsCount}
                />
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight flex items-center gap-2">
                            Olá, {user.firstName} <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                            {hasAnyData ? "Aqui está o resumo do seu estúdio hoje." : "Bem-vindo! Siga o passo a passo acima para começar e os números aparecerão aqui."}
                        </p>
                    </div>
                </header>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Alunos Ativos"
                        value={studentsCount.toString()}
                        icon={<Users size={24} weight="duotone" />}
                        trend={hasAnyData ? undefined : undefined}
                        trendDirection="neutral"
                    />
                    <StatCard
                        title={`Receita (${format(now, 'MMM', { locale: ptBR }).toUpperCase()})`}
                        value={revenueFormatted}
                        icon={<Money size={24} weight="duotone" />}
                        trend={hasAnyData ? undefined : undefined}
                        trendDirection="neutral"
                    />
                    <StatCard
                        title="Novas Matrículas"
                        value={newStudentsCount.toString()}
                        icon={<Trophy size={24} weight="duotone" />}
                        trend={hasAnyData ? undefined : undefined}
                        trendDirection="neutral"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">

                    {/* Left Column: Chart & List (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8 flex flex-col">
                        {/* Chart Section */}
                        <div className="flex-1 min-h-[350px]">
                            <RevenueChart data={chartData} hasRevenue={monthlyRevenue > 0} />
                        </div>

                        {/* Expiring Plans List */}
                        <div className="bg-white dark:bg-[#1E2A36] rounded-[32px] p-8 soft-shadow flex-1 border border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-3 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-graphite-dark dark:text-white">Próximos Vencimentos</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status de Renovação</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {expiringStudents.length > 0 ? expiringStudents.map(student => (
                                    <div key={student.id} className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-xl transition-colors -mx-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center font-bold text-sm">
                                                {student.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-graphite-dark dark:text-white">{student.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {student.plan?.name || 'Sem plano'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-amber-100/50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200/50 dark:border-amber-500/30">
                                            Vence em {differenceInDays(new Date(student.planEnd!), now)} dias
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 px-4">
                                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                            <Clock size={28} weight="duotone" className="text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 font-medium">Nenhum vencimento nos próximos 30 dias.</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Quando tiver alunos com planos, os vencimentos aparecerão aqui.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Manager (1/3 width, Full Height) */}
                    <div className="lg:h-full">
                        <AiManager hasStudents={studentsCount > 0} />
                    </div>

                </div>
            </main>
        </div>
    );
}

import Sidebar from "@/components/layout/Sidebar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students, leads, payments } from "@/db/schema";
import { eq, and, desc, gte, lte, gt } from "drizzle-orm";
import { Users, TrendUp, Warning, CaretRight, Money, Trophy, ChalkboardTeacher } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, addDays, subMonths, eachMonthOfInterval, differenceInDays } from "date-fns";
// ... (imports remain same, just extracting for context if needed, but tool handles partial lookup)


import { ptBR } from "date-fns/locale";
import RevenueChart from "@/components/dashboard/RevenueChart";
import StatCard from "@/components/dashboard/StatCard";
import AiManager from "@/components/dashboard/AiManager";

export default async function DashboardPage() {
    const user = await currentUser();
    const userId = user?.id;
    if (!userId) return null;

    const now = new Date();
    const startMonth = startOfMonth(now);
    const endMonth = endOfMonth(now);
    const next30Days = addDays(now, 30);

    // --- 1. Operations ---
    const studentsCount = await db.$count(students, eq(students.trainerId, userId));

    // New Students this month (Mock logic for "Novas Matrículas")
    const newStudentsCount = await db.$count(students, and(
        eq(students.trainerId, userId),
        gte(students.createdAt, startMonth)
    ));

    // Expiring Plans (Next 30 days)
    const expiringStudents = await db.query.students.findMany({
        where: and(
            eq(students.trainerId, userId),
            gt(students.planEnd, now),
            lte(students.planEnd, next30Days)
        ),
        limit: 5,
        with: { plan: true }
    });


    // --- 2. Financials & Chart Data ---
    // Revenue This Month (Paid)
    const monthlyPayments = await db.query.payments.findMany({
        where: and(
            eq(payments.trainerId, userId),
            eq(payments.status, 'paid'),
            gte(payments.paidAt, startMonth),
            lte(payments.paidAt, endMonth)
        )
    });
    const monthlyRevenue = monthlyPayments.reduce((acc, curr) => acc + curr.amount, 0);

    // Chart Data (Last 6 Months)
    const sixMonthsAgo = subMonths(now, 5);
    const recentMonts = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

    // Fetch all payments from 6 months ago
    const historicalPayments = await db.query.payments.findMany({
        where: and(
            eq(payments.trainerId, userId),
            eq(payments.status, 'paid'),
            gte(payments.paidAt, startOfMonth(sixMonthsAgo))
        )
    });

    const chartData = recentMonts.map(month => {
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

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight flex items-center gap-2">
                            Olá, {user.firstName} <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Aqui está o resumo do seu estúdio hoje.
                        </p>
                    </div>
                </header>

                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Alunos Ativos"
                        value={studentsCount.toString()}
                        icon={<Users size={24} weight="duotone" />}
                        trend="+12%"
                        trendDirection="up"
                    />
                    <StatCard
                        title={`Receita (${format(now, 'MMM', { locale: ptBR }).toUpperCase()})`}
                        value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(monthlyRevenue / 100)}
                        icon={<Money size={24} weight="duotone" />}
                        trend="+8.4%"
                        trendDirection="up"
                    />
                    <StatCard
                        title="Novas Matrículas"
                        value={newStudentsCount.toString()}
                        icon={<Trophy size={24} weight="duotone" />}
                        trend="0%"
                        trendDirection="neutral"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">

                    {/* Left Column: Chart & List (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8 flex flex-col">
                        {/* Chart Section */}
                        <div className="flex-1 min-h-[350px]">
                            <RevenueChart data={chartData} />
                        </div>

                        {/* Expiring Plans List */}
                        <div className="bg-white rounded-[32px] p-8 soft-shadow flex-1">
                            <div className="flex items-center gap-3 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-graphite-dark">Próximos Vencimentos</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status de Renovação</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {expiringStudents.length > 0 ? expiringStudents.map(student => (
                                    <div key={student.id} className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded-xl transition-colors -mx-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-sm">
                                                {student.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-graphite-dark">{student.name}</p>
                                                <p className="text-xs text-slate-400 font-medium">
                                                    {student.plan?.name || 'Sem plano'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-amber-100/50 text-amber-600 px-3 py-1 rounded-lg text-xs font-bold border border-amber-200/50">
                                            Vence em {differenceInDays(new Date(student.planEnd!), now)} dias
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8">
                                        <p className="text-slate-400 font-medium">Nenhum vencimento próximo.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Manager (1/3 width, Full Height) */}
                    <div className="lg:h-full">
                        <AiManager />
                    </div>

                </div>
            </main>
        </div>
    );
}

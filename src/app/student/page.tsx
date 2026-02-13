import { db } from "@/db";
import { students, workouts, nutritionalPlans, meals, workoutLogs, mealLogs } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FolderUser, ChartLineUp, BookOpen, Trophy, Barbell, ArrowRight, BowlFood } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { startOfDay, endOfDay, format, parseISO, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardHeader from "@/components/student/dashboard/StudentDashboardHeader";
import CalendarStrip from "@/components/student/dashboard/CalendarStrip";
import { getTodaysHydration } from "@/app/actions/gamification";
import { getStudentPendingForms } from "@/app/actions/forms";
import PendingFormsList from "@/components/student/dashboard/PendingFormsList";

export default async function StudentDashboardPage(props: {
    searchParams: Promise<{ date?: string, cat?: string }>
}) {
    const searchParams = await props.searchParams;
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return redirect("/sign-in");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email),
        with: {
            trainer: true,
            plan: true
        }
    });

    if (!student) return redirect("/");

    // PARALLEL DATA FETCHING
    const requestedDate = searchParams.date ? parseISO(searchParams.date) : new Date();
    const today = startOfDay(new Date());
    const queryDate = startOfDay(requestedDate);

    // 1. Next Workout (For requested date)
    const dailyWorkout = await db.query.workouts.findFirst({
        where: and(
            eq(workouts.studentId, student.id),
            eq(workouts.scheduledDate, queryDate)
        ),
        with: {
            items: true
        }
    });

    // 2. Meals for requested date
    const nutritionalPlan = await db.query.nutritionalPlans.findFirst({
        where: and(
            eq(nutritionalPlans.studentId, student.id),
            eq(nutritionalPlans.active, true)
        ),
        with: {
            meals: {
                orderBy: [asc(meals.order)],
                with: {
                    items: true
                }
            }
        }
    });

    // 3. Activity Logs for synchronization
    const loggedMeals = await db.query.mealLogs.findMany({
        where: and(
            eq(mealLogs.studentId, student.id),
            gte(mealLogs.eatenAt, startOfDay(requestedDate)),
            lte(mealLogs.eatenAt, endOfDay(requestedDate))
        )
    });

    const isWorkoutDone = await db.query.workoutLogs.findFirst({
        where: and(
            eq(workoutLogs.studentId, student.id),
            gte(workoutLogs.endedAt, startOfDay(requestedDate)),
            lte(workoutLogs.endedAt, endOfDay(requestedDate)),
            eq(workoutLogs.status, 'completed')
        )
    });

    // Hydration
    const hydrationTotal = await getTodaysHydration(student.id, requestedDate);
    const waterGoal = nutritionalPlan?.waterGoalMl || 2500;

    // Weekly Progress Logic
    const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    const weeklyWorkouts = await db.query.workoutLogs.findMany({
        where: and(
            eq(workoutLogs.studentId, student.id),
            gte(workoutLogs.endedAt, startOfCurrentWeek),
            eq(workoutLogs.status, 'completed')
        )
    });

    // Weekly Goal (Mocked or from Plan if exists - currently hardcoded to 5 in design)
    const weeklyGoal = 5;
    const weeklyProgress = Math.round((weeklyWorkouts.length / weeklyGoal) * 100);

    // 4. Pending Forms
    const pendingForms = await getStudentPendingForms(student.id);

    return (
        <div className="p-6 pb-28 font-primary">

            <DashboardHeader
                firstName={student.name.split(' ')[0]}
                userImage={user.imageUrl}
                currentStreak={student.currentStreak || 0}
            />

            {/* Hero Card - Real Weekly Progress */}
            <div className="mb-8 relative group">
                <div className="bg-gradient-to-r from-acid-lime to-emerald-500 rounded-[32px] p-6 text-deep-black relative overflow-hidden shadow-[0_10px_30px_-5px_rgba(189,255,0,0.3)]">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-black/10 rounded-full">
                                    <Trophy size={16} weight="fill" className="text-deep-black" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide opacity-70">Desafio Semanal</span>
                            </div>
                            <h2 className="text-2xl font-black leading-tight mb-1">{weeklyWorkouts.length} de {weeklyGoal} Treinos</h2>
                            <p className="text-sm font-medium opacity-80">
                                {weeklyWorkouts.length >= weeklyGoal
                                    ? "Meta batida! Sensacional! 🔥"
                                    : "Bora pra cima, falta pouco!"}
                            </p>

                            <Link href="/student/evolution" className="mt-4 px-5 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm hover:scale-105 transition-transform inline-block">
                                Ver Detalhes
                            </Link>
                        </div>

                        {/* Progress Circle Visual */}
                        <div className="w-20 h-20 rounded-full border-4 border-black/10 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent" style={{ transform: `rotate(${weeklyProgress * 3.6 - 90}deg)` }} />
                            <span className="font-black text-lg">{Math.min(weeklyProgress, 100)}%</span>
                        </div>
                    </div>

                    {/* Decor */}
                    <div className="absolute -right-10 -bottom-10 opacity-20 rotate-12">
                        <Trophy size={140} weight="fill" />
                    </div>
                </div>
            </div>

            {/* Calendar Strip */}
            <div className="mb-8">
                <CalendarStrip />
            </div>

            {/* Category Chips - Filter by Exercise Category */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 pb-2">
                {[
                    { label: "Tudo", id: "all", icon: "✨" },
                    { label: "Treino", id: "workout", icon: "💪" },
                    { label: "Dieta", id: "diet", icon: "🍎" },
                    { label: "Ficha", id: "forms", icon: "📝" },
                ].map((cat, i) => {
                    const isActive = (searchParams.cat || 'all') === cat.id;
                    return (
                        <Link
                            key={i}
                            href={`/student?${new URLSearchParams({ ...searchParams, cat: cat.id }).toString()}`}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full border whitespace-nowrap transition-all
                                ${isActive
                                    ? 'bg-transparent border-acid-lime text-acid-lime shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                                    : 'bg-surface-grey border-white/5 text-zinc-400 hover:bg-white/5'}
                            `}
                        >
                            <span>{cat.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{cat.label}</span>
                        </Link>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                Atividades de {format(requestedDate, 'dd/MM', { locale: ptBR })}
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </h3>

            <div className="grid gap-4">
                {/* Workout Card */}
                {(!searchParams.cat || searchParams.cat === 'all' || searchParams.cat === 'workout') && (
                    <Link href={`/student/workouts/${dailyWorkout?.id}`} className={`bg-surface-grey p-4 rounded-3xl border transition-colors group flex gap-4 items-center ${isWorkoutDone ? 'border-acid-lime/30 bg-acid-lime/5' : 'border-white/5 hover:bg-white/5'}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform ${isWorkoutDone ? 'bg-acid-lime text-black rotate-3' : 'bg-gradient-to-br from-emerald-500 to-teal-600 group-hover:scale-105'}`}>
                            {isWorkoutDone ? <Trophy size={28} weight="fill" /> : <Barbell size={28} weight="duotone" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">{dailyWorkout?.title || "Descanso"}</h4>
                            <p className="text-zinc-500 text-xs">
                                {dailyWorkout
                                    ? `${dailyWorkout.items.length} exercícios • ${isWorkoutDone ? 'Concluído ✅' : '~45 min'}`
                                    : "Recuperação ativa"}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-acid-lime group-hover:text-black group-hover:border-acid-lime transition-all">
                            <ArrowRight size={14} weight="bold" />
                        </div>
                    </Link>
                )}

                {/* Next Meal / Nutrition Summary */}
                {(!searchParams.cat || searchParams.cat === 'all' || searchParams.cat === 'diet') && (
                    <Link href="/student/nutrition" className="bg-surface-grey p-4 rounded-3xl border border-white/5 flex gap-4 items-center hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                            <BowlFood size={28} weight="duotone" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">Alimentação</h4>
                            <p className="text-zinc-500 text-xs">
                                {loggedMeals.length} de {nutritionalPlan?.meals.length || 0} refeições registradas
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-acid-lime group-hover:text-black group-hover:border-acid-lime transition-all">
                            <ArrowRight size={14} weight="bold" />
                        </div>
                    </Link>
                )}

                {/* Hydration Mini */}
                {(!searchParams.cat || searchParams.cat === 'all') && (
                    <div className="bg-surface-grey p-4 rounded-3xl border border-white/5 flex gap-4 items-center hover:bg-white/5 transition-colors group cursor-pointer">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                            <span className="font-black text-xs">{hydrationTotal}ml</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-lg">Hidratação</h4>
                            <div className="w-full bg-deep-black h-1.5 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((hydrationTotal / waterGoal) * 100, 100)}%` }} />
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-acid-lime group-hover:text-black group-hover:border-acid-lime transition-all">
                            <ArrowRight size={14} weight="bold" />
                        </div>
                    </div>
                )}

                {/* Pending Forms */}
                {(!searchParams.cat || searchParams.cat === 'all' || searchParams.cat === 'forms') && pendingForms.length > 0 && (
                    <PendingFormsList pendingForms={pendingForms} />
                )}

            </div>

        </div>
    );
}

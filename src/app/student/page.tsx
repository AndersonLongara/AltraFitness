import { db } from "@/db";
import { students, nutritionalPlans, meals, workoutLogs, mealLogs } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Trophy, ArrowRight, BowlFood } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { startOfDay, endOfDay, format, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardHeader from "@/components/student/dashboard/StudentDashboardHeader";
import { getTodaysHydration, getTodaysMood, checkAndAwardDailyBonus } from "@/app/actions/gamification";
import { getDailyWorkout } from "@/lib/get-daily-workout";
import { getStudentPendingForms } from "@/app/actions/forms";
import PendingFormsList from "@/components/student/dashboard/PendingFormsList";
import { checkStudentProfileComplete } from "@/app/actions/profile";
import ProfileCompletionCard from "@/components/student/dashboard/ProfileCompletionCard";
import HydrationCardWithModal from "@/components/student/dashboard/HydrationCardWithModal";
import MoodTracker from "@/components/student/dashboard/MoodTracker";
import TodaysWorkoutCard from "@/components/student/dashboard/TodaysWorkoutCard";
import DailyScoreRing from "@/components/student/dashboard/DailyScoreRing";
import MissionAccomplished from "@/components/student/dashboard/MissionAccomplished";

export const dynamic = 'force-dynamic';

export default async function StudentDashboardPage() {
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

    if (!student) return redirect("/onboarding");

    // Check if student profile is complete
    const profileStatus = await checkStudentProfileComplete();
    const isProfileIncomplete = !profileStatus.complete;

    // Sempre mostrar atividades de hoje
    const requestedDate = new Date();
    const today = startOfDay(new Date());
    const queryDate = startOfDay(requestedDate);

    // 1. Treino do dia: override do aluno > scheduledDate (legado) > suggestedDayOfWeek do plano
    const dailyWorkout = await getDailyWorkout(student.id, requestedDate);

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

    // 5. Humor do dia — pergunta só quando estiver vendo a data de hoje
    const isViewingToday = format(requestedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const todaysMood = isViewingToday ? await getTodaysMood(student.id, requestedDate) : null;

    // 6. Pontuação do dia (0–100%): treino 35%, dieta 35%, água 30%
    const totalMeals = nutritionalPlan?.meals?.length ?? 0;
    const workoutScore = isWorkoutDone ? 35 : 0;
    const mealsScore = totalMeals > 0 ? Math.min(35, (loggedMeals.length / totalMeals) * 35) : 0;
    const hydrationScore = waterGoal > 0 ? Math.min(30, (hydrationTotal / waterGoal) * 30) : 0;
    const totalScore = Math.min(100, Math.round(workoutScore + mealsScore + hydrationScore));
    const hydrationMet = waterGoal > 0 && hydrationTotal >= waterGoal;
    const mealsMet = totalMeals === 0 || loggedMeals.length >= totalMeals;
    if (totalScore >= 100) void checkAndAwardDailyBonus(student.id);

    return (
        <div className="p-6 pb-28 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">

            <DashboardHeader
                firstName={student.name.split(' ')[0]}
                userImage={user.imageUrl}
                currentStreak={student.currentStreak || 0}
            />

            {/* Profile Completion Card - Pulsing, blocks everything until filled */}
            {isProfileIncomplete && profileStatus.student && (
                <ProfileCompletionCard
                    missing={profileStatus.missing}
                    studentData={profileStatus.student}
                />
            )}

            {/* Pending Forms - Also shown above the dimmed content when profile is incomplete */}
            {isProfileIncomplete && pendingForms.length > 0 && (
                <div className="relative z-40 mb-8">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        📝 Formulários Pendentes
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-black rounded-full">{pendingForms.length}</span>
                    </h3>
                    <PendingFormsList pendingForms={pendingForms} />
                </div>
            )}

            {/* Dashboard content - dimmed and non-interactive when profile is incomplete */}
            <div className={isProfileIncomplete ? 'opacity-30 pointer-events-none select-none blur-[2px]' : ''}>

            {/* Pontuação do dia — anel 0–100% */}
            <DailyScoreRing
                workoutScore={workoutScore}
                mealsScore={mealsScore}
                hydrationScore={hydrationScore}
                totalScore={totalScore}
            />

            {totalScore >= 100 && (
                <MissionAccomplished
                    workoutDone={!!isWorkoutDone}
                    hydrationMet={!!hydrationMet}
                    mealsMet={!!mealsMet}
                />
            )}

            {/* Hero Card - Real Weekly Progress */}
            <div className="mb-8 relative group">
                <div className="bg-gradient-to-r from-acid-lime to-emerald-500 rounded-[32px] p-6 md:p-8 text-deep-black relative overflow-hidden shadow-[0_8px_24px_-4px_rgba(46,204,113,0.25)]">
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1.5 bg-black/15 rounded-full">
                                    <Trophy size={16} weight="fill" className="text-deep-black" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide text-deep-black/80">Desafio Semanal</span>
                            </div>
                            <h2 className="text-2xl font-black leading-tight mb-1 text-deep-black">{weeklyWorkouts.length} de {weeklyGoal} Treinos</h2>
                            <p className="text-sm font-semibold text-deep-black/85">
                                {weeklyWorkouts.length >= weeklyGoal
                                    ? "Meta batida! Sensacional! 🔥"
                                    : "Bora pra cima, falta pouco!"}
                            </p>

                            <Link href="/student/evolution" className="mt-4 px-5 py-2.5 bg-deep-black text-acid-lime rounded-full text-[10px] font-black uppercase tracking-wider shadow-md hover:bg-deep-black/90 hover:scale-[1.02] transition-all inline-block">
                                Ver Detalhes
                            </Link>
                        </div>

                        {/* Progress Circle - conic-gradient ring (filled = 0 to progress deg) */}
                        <div className="w-20 h-20 rounded-full flex items-center justify-center relative shrink-0">
                            <div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background: `conic-gradient(rgba(255,255,255,0.95) 0deg, rgba(255,255,255,0.95) ${weeklyProgress * 3.6}deg, rgba(255,255,255,0.22) ${weeklyProgress * 3.6}deg)`,
                                }}
                            />
                            <div className="absolute inset-[5px] rounded-full bg-gradient-to-br from-acid-lime/30 to-emerald-400/20" />
                            <span className="relative z-10 font-black text-base text-deep-black">{Math.min(weeklyProgress, 100)}%</span>
                        </div>
                    </div>

                    {/* Decor - menor opacidade */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.12] rotate-12 pointer-events-none">
                        <Trophy size={140} weight="fill" className="text-deep-black" />
                    </div>
                </div>
            </div>

            {/* Treino do dia — dados do banco (workout agendado para hoje) */}
            <TodaysWorkoutCard workout={dailyWorkout} isWorkoutDone={!!isWorkoutDone} />

            {/* Humor do dia — pergunta todo dia */}
            {isViewingToday && (
                <div className="mb-8">
                    <MoodTracker todaysMood={todaysMood} />
                </div>
            )}

            {/* Atividades do dia */}
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                Atividades de {format(requestedDate, 'dd/MM', { locale: ptBR })}
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Alimentação - plano configurado pelo treinador */}
                <Link href="/student/nutrition" className="bg-surface-grey p-4 rounded-3xl border border-white/5 flex gap-4 items-center hover:bg-white/5 hover:border-white/10 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] transition-all duration-200 group cursor-pointer">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg transition-transform duration-200 group-hover:scale-105">
                            <BowlFood size={28} weight="duotone" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-lg">Alimentação</h4>
                            <p className="text-zinc-500 text-xs">
                                {nutritionalPlan?.meals?.length
                                    ? `${loggedMeals.length} de ${nutritionalPlan.meals.length} refeições registradas`
                                    : "Plano em configuração pelo treinador"}
                            </p>
                            {nutritionalPlan?.meals?.length ? (
                                <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-acid-lime transition-all duration-500"
                                        style={{ width: `${Math.min(100, (loggedMeals.length / nutritionalPlan.meals.length) * 100)}%` }}
                                    />
                                </div>
                            ) : null}
                        </div>
                        <div className="w-8 h-8 shrink-0 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-acid-lime group-hover:text-black group-hover:border-acid-lime transition-all">
                            <ArrowRight size={14} weight="bold" />
                        </div>
                    </Link>

                {/* Hidratação - meta do plano do treinador; toque abre modal para registrar */}
                <HydrationCardWithModal hydrationTotal={hydrationTotal} waterGoal={waterGoal} />

                {/* Formulários pendentes - quando perfil completo */}
                {!isProfileIncomplete && pendingForms.length > 0 && (
                    <PendingFormsList pendingForms={pendingForms} />
                )}

            </div>

            </div>{/* end of dimmed wrapper */}

        </div>
    );
}

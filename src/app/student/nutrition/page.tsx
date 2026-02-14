import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students, nutritionalPlans, meals, mealLogs } from "@/db/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { startOfDay, endOfDay, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import NutritionHeader from "@/components/student/nutrition/NutritionHeader";
import MealList from "@/components/student/nutrition/MealList";
import AdHocMealButton from "@/components/student/nutrition/AdHocMealButton";
import AdHocMealList from "@/components/student/nutrition/AdHocMealList";
import { ArrowLeft, ForkKnife, Trash } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import CalendarStrip from "@/components/student/dashboard/CalendarStrip";

export default async function NutritionPage(props: {
    searchParams: Promise<{ date?: string }>
}) {
    const searchParams = await props.searchParams;
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return redirect("/sign-in");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) return redirect("/");

    // Fetch Active Nutritional Plan
    const plan = await db.query.nutritionalPlans.findFirst({
        where: and(
            eq(nutritionalPlans.studentId, student.id),
            eq(nutritionalPlans.active, true)
        ),
        with: {
            meals: {
                with: {
                    items: true
                },
                orderBy: [asc(meals.order)]
            }
        }
    });

    if (!plan) {
        return (
            <main className="p-6 pb-24 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">
                <header className="flex items-center gap-4 mb-8">
                    <Link href="/student" className="w-10 h-10 bg-surface-grey border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                        <ArrowLeft size={20} weight="bold" />
                    </Link>
                    <h1 className="text-2xl font-black text-white tracking-tight">Nutrição</h1>
                </header>
                <div className="flex flex-col items-center justify-center py-20 bg-surface-grey border border-white/5 rounded-4xl text-center p-8">
                    <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-3xl flex items-center justify-center mb-6">
                        <ForkKnife size={48} weight="duotone" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Plano não encontrado</h3>
                    <p className="text-zinc-500 mt-2 max-w-xs mx-auto">
                        Seu nutricionista ainda não liberou seu plano alimentar. Tente novamente mais tarde.
                    </p>
                </div>
            </main>
        );
    }

    // Fetch Logs for the requested date
    const requestedDate = searchParams.date ? parseISO(searchParams.date) : new Date();

    const logs = await db.query.mealLogs.findMany({
        where: and(
            eq(mealLogs.studentId, student.id),
            gte(mealLogs.eatenAt, startOfDay(requestedDate)),
            lte(mealLogs.eatenAt, endOfDay(requestedDate))
        )
    });

    const loggedMealIds = logs
        .filter(l => l.mealId !== null)
        .map(l => l.mealId!);

    const adHocLogs = logs.filter(l => l.mealId === null);

    // Calculate Consumed Macros
    const consumed = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

    plan.meals.forEach(meal => {
        if (loggedMealIds.includes(meal.id)) {
            meal.items.forEach(item => {
                consumed.kcal += item.calories || 0;
                consumed.protein += item.protein || 0;
                consumed.carbs += item.carbs || 0;
                consumed.fat += item.fat || 0;
            });
        }
    });

    adHocLogs.forEach(log => {
        consumed.kcal += log.calories || 0;
    });

    return (
        <main className="p-6 pb-28 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">
            <header className="flex items-center gap-4 mb-6">
                <Link href="/student" className="w-10 h-10 bg-surface-grey border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeft size={20} weight="bold" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Minha Dieta</h1>
                    <p className="text-xs font-bold text-acid-lime uppercase tracking-widest">{plan.title}</p>
                </div>
            </header>

            {/* Calendar Strip also on Nutrition page */}
            <div className="mb-8">
                <CalendarStrip />
            </div>

            <NutritionHeader
                dailyKcal={plan.dailyKcal}
                proteinG={plan.proteinG}
                carbsG={plan.carbsG}
                fatG={plan.fatG}
                consumed={consumed}
            />

            <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider mb-4 px-1 mt-8">
                Refeições de {format(requestedDate, 'dd/MM', { locale: ptBR })}
                <span className="w-1.5 h-1.5 rounded-full bg-acid-lime animate-pulse" />
            </h3>

            <MealList
                meals={plan.meals}
                loggedMealIds={loggedMealIds}
            />

            <AdHocMealList logs={adHocLogs} />

            <AdHocMealButton />
        </main>
    );
}

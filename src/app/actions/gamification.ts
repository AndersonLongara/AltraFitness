'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { hydrationLogs, students, moodLogs, workoutLogs, mealLogs, nutritionalPlans, gamificationLogs } from "@/db/schema";
import { eq, sql, gte, lte, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addXp } from "@/services/gamification";
import { startOfDay, endOfDay } from "date-fns";

export async function logHydration(amountMl: number) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("No email found");

    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    // 1. Log Hydration
    await db.insert(hydrationLogs).values({
        studentId: student.id,
        date: new Date(),
        amountMl,
    });

    // 2. Add XP (Minimal XP for each generic action to prevent spamming? Or just daily goal?)
    // Strategy: 10 XP per 250ml logged, max daily? 
    // Let's give 10 XP for the action of logging for now.
    await addXp(student.id, 10, 'hydration_log');

    revalidatePath('/student');
    return { success: true };
}

export async function getTodaysHydration(studentId: string, date: Date = new Date()) {
    const logs = await db.query.hydrationLogs.findMany({
        where: sql`student_id = ${studentId} AND date >= ${startOfDay(date).getTime()} AND date <= ${endOfDay(date).getTime()}`
    });

    // Manual sum since standard SQLite adapter might be limited on aggregation via Drizzle API shorthand
    const total = logs.reduce((sum, log) => sum + log.amountMl, 0);
    return total;
}

export async function getTodaysMood(studentId: string, date: Date = new Date()) {
    const logs = await db.query.moodLogs.findMany({
        where: and(
            eq(moodLogs.studentId, studentId),
            gte(moodLogs.createdAt, startOfDay(date)),
            lte(moodLogs.createdAt, endOfDay(date))
        ),
        orderBy: [desc(moodLogs.createdAt)],
        limit: 1,
    });
    return logs[0]?.mood ?? null;
}

export async function logMood(mood: string, note?: string) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("No email found");

    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    await db.insert(moodLogs).values({
        studentId: student.id,
        mood,
        note,
        createdAt: new Date(),
    });

    await addXp(student.id, 5, 'mood_log');

    revalidatePath('/student');
    return { success: true };
}

export async function awardXP(studentId: string, xp: number) {
    await addXp(studentId, xp, 'workout_complete');
    revalidatePath('/student');
}

/** Bonus 50 XP quando o dia atinge 100% (treino + dieta + água). Uma vez por dia. */
export async function checkAndAwardDailyBonus(studentId: string) {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const alreadyAwarded = await db.query.gamificationLogs.findFirst({
        where: and(
            eq(gamificationLogs.studentId, studentId),
            eq(gamificationLogs.action, 'daily_bonus'),
            gte(gamificationLogs.createdAt, todayStart),
            lte(gamificationLogs.createdAt, todayEnd)
        ),
    });
    if (alreadyAwarded) return { awarded: false };

    const workoutDone = await db.query.workoutLogs.findFirst({
        where: and(
            eq(workoutLogs.studentId, studentId),
            eq(workoutLogs.status, 'completed'),
            gte(workoutLogs.endedAt, todayStart),
            lte(workoutLogs.endedAt, todayEnd)
        ),
    });
    const plan = await db.query.nutritionalPlans.findFirst({
        where: and(
            eq(nutritionalPlans.studentId, studentId),
            eq(nutritionalPlans.active, true)
        ),
        with: { meals: true },
    });
    const totalMeals = plan?.meals?.length ?? 0;
    const loggedMeals = await db.query.mealLogs.findMany({
        where: and(
            eq(mealLogs.studentId, studentId),
            gte(mealLogs.eatenAt, todayStart),
            lte(mealLogs.eatenAt, todayEnd)
        ),
    });
    const waterGoal = plan?.waterGoalMl || 2500;
    const hydrationTotal = await getTodaysHydration(studentId, new Date());

    const workoutScore = workoutDone ? 35 : 0;
    const mealsScore = totalMeals > 0 ? Math.min(35, (loggedMeals.length / totalMeals) * 35) : 0;
    const hydrationScore = waterGoal > 0 ? Math.min(30, (hydrationTotal / waterGoal) * 30) : 0;
    const total = workoutScore + mealsScore + hydrationScore;

    if (total < 100) return { awarded: false };

    await addXp(studentId, 50, 'daily_bonus');
    revalidatePath('/student');
    return { awarded: true };
}

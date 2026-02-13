'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { mealLogs, students, nutritionalPlans, meals, mealItems } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addXp } from "@/services/gamification";
import { startOfDay, endOfDay } from "date-fns";

export async function logMeal(mealId: string) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    // Check if already logged today to prevent double logging
    const today = new Date();
    const existingLog = await db.query.mealLogs.findFirst({
        where: and(
            eq(mealLogs.studentId, student.id),
            eq(mealLogs.mealId, mealId),
            gte(mealLogs.eatenAt, startOfDay(today)),
            lte(mealLogs.eatenAt, endOfDay(today))
        )
    });

    if (existingLog) {
        return { success: true, message: "Already logged" };
    }

    await db.insert(mealLogs).values({
        studentId: student.id,
        mealId,
        eatenAt: new Date(),
        skipped: false
    });

    // Award XP
    await addXp(student.id, 25, 'meal_checkin');

    revalidatePath('/student/nutrition');
    revalidatePath('/student'); // Update dashboard too
    return { success: true };
}

export async function undoLogMeal(mealId: string) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    const today = new Date();

    // Find log to delete
    await db.delete(mealLogs).where(
        and(
            eq(mealLogs.studentId, student.id),
            eq(mealLogs.mealId, mealId),
            gte(mealLogs.eatenAt, startOfDay(today)),
            lte(mealLogs.eatenAt, endOfDay(today))
        )
    );

    // TODO: Deduct XP? For now, we'll leave it to avoid complexity.
    // If we deduct, we might create negative XP scenarios if user levels up then undoes.

    revalidatePath('/student/nutrition');
    revalidatePath('/student');
    return { success: true };
}

export async function logAdHocMeal(data: { name: string, calories: number, isCheatMeal: boolean }) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    await db.insert(mealLogs).values({
        studentId: student.id,
        name: data.name,
        calories: data.calories,
        isCheatMeal: data.isCheatMeal,
        eatenAt: new Date(),
        skipped: false
    });

    // Award XP? Maybe less for cheat meals? Or just for tracking.
    // Let's give 10 XP for honesty.
    await addXp(student.id, 10, 'meal_checkin');

    revalidatePath('/student/nutrition');
    revalidatePath('/student');
    return { success: true };
}

export async function deleteAdHocLog(logId: string) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    await db.delete(mealLogs).where(eq(mealLogs.id, logId));

    revalidatePath('/student/nutrition');
    revalidatePath('/student');
    return { success: true };
}

interface CreateNutritionalPlanParams {
    title: string;
    studentId: string;
    trainerId: string;
    dailyKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    meals: {
        name: string;
        time: string;
        order: number;
        items: {
            foodName: string;
            portion: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
        }[];
    }[];
}

export async function createNutritionalPlan(data: CreateNutritionalPlanParams) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Start a transaction if possible, or just sequence it (SQLite doesn't support nested transactions easily with Drizzle yet, but we can sequence).
    // 1. Deactivate old plans
    await db.update(nutritionalPlans)
        .set({ active: false })
        .where(eq(nutritionalPlans.studentId, data.studentId));

    // 2. Create new plan
    const planId = crypto.randomUUID();
    await db.insert(nutritionalPlans).values({
        id: planId,
        studentId: data.studentId,
        trainerId: data.trainerId,
        title: data.title,
        dailyKcal: data.dailyKcal,
        proteinG: data.proteinG,
        carbsG: data.carbsG,
        fatG: data.fatG,
        active: true,
    });

    // 3. Create Meals and Items
    for (const meal of data.meals) {
        const mealId = crypto.randomUUID();
        await db.insert(meals).values({
            id: mealId,
            planId: planId,
            name: meal.name,
            time: meal.time,
            order: meal.order,
        });

        if (meal.items.length > 0) {
            await db.insert(mealItems).values(
                meal.items.map(item => ({
                    mealId: mealId,
                    foodName: item.foodName,
                    portion: item.portion,
                    calories: item.calories,
                    protein: item.protein,
                    carbs: item.carbs,
                    fat: item.fat,
                }))
            );
        }
    }

    revalidatePath(`/dashboard/students/${data.studentId}`);
    return { success: true, planId };
}

export async function deleteNutritionalPlan(planId: string, studentId?: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Start a transaction-like sequence
    // 1. Delete associated meal items
    // First get all meals to find their IDs
    const planMeals = await db.query.meals.findMany({
        where: eq(meals.planId, planId)
    });

    for (const meal of planMeals) {
        await db.delete(mealItems).where(eq(mealItems.mealId, meal.id));
    }

    // 2. Delete meals
    await db.delete(meals).where(eq(meals.planId, planId));

    // 3. Delete the plan itself
    await db.delete(nutritionalPlans).where(eq(nutritionalPlans.id, planId));

    if (studentId) {
        revalidatePath(`/dashboard/students/${studentId}`);
    } else {
        revalidatePath('/dashboard/nutrition/templates');
    }

    return { success: true };
}

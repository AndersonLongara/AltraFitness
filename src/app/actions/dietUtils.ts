'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { foods, nutritionalPlans, meals, mealItems, students, assessments } from "@/db/schema";
import { eq, like, or, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { differenceInYears } from "date-fns";

export async function searchFoods(query: string, filter?: 'protein' | 'carbs' | 'fat' | null) {
    // If no query and no filter, return empty
    if ((!query || query.length < 2) && !filter) return [];

    let orderBy;
    if (filter === 'protein') orderBy = desc(foods.protein);
    else if (filter === 'carbs') orderBy = desc(foods.carbs);
    else if (filter === 'fat') orderBy = desc(foods.fat);

    // If we have a filter but no query, just return top foods for that macro
    if (filter && (!query || query.length < 2)) {
        return await db.query.foods.findMany({
            orderBy: orderBy,
            limit: 20,
        });
    }

    const results = await db.query.foods.findMany({
        where: like(foods.name, `%${query}%`),
        orderBy: orderBy,
        limit: 20,
    });

    // Sort to prioritize TACO/TBCA if not filtering by macro
    if (!filter) {
        return results.sort((a, b) => {
            const aScore = (a.source === 'TACO' || a.source === 'TBCA') ? 1 : 0;
            const bScore = (b.source === 'TACO' || b.source === 'TBCA') ? 1 : 0;
            return bScore - aScore;
        });
    }

    return results;
}

// Plan Management
export async function createNutritionalPlan(data: {
    studentId: string;
    title: string;
    dailyKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    waterGoalMl?: number;
    daysOfWeek?: string[];
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const trainer = await db.query.trainers.findFirst({ where: eq(trainers.id, userId) });
    if (!trainer) throw new Error("Trainer not found");

    const [plan] = await db.insert(nutritionalPlans).values({
        trainerId: userId,
        studentId: data.studentId,
        title: data.title,
        dailyKcal: data.dailyKcal,
        proteinG: data.proteinG,
        carbsG: data.carbsG,
        fatG: data.fatG,
        waterGoalMl: data.waterGoalMl,
        daysOfWeek: data.daysOfWeek,
        active: true
    }).returning();

    revalidatePath(`/dashboard/students/${data.studentId}`);
    return plan;
}

export async function getNutritionalPlan(planId: string) {
    const plan = await db.query.nutritionalPlans.findFirst({
        where: eq(nutritionalPlans.id, planId),
        with: {
            meals: {
                with: {
                    items: true
                },
                orderBy: (meals, { asc }) => [asc(meals.order)]
            }
        }
    });
    return plan;
}

export async function addMeal(planId: string, name: string, time: string, order: number) {
    const [meal] = await db.insert(meals).values({
        planId,
        name,
        time,
        order
    }).returning();
    revalidatePath(`/dashboard/nutrition/${planId}`);
    return meal;
}

export async function addFoodToMeal(data: {
    mealId: string;
    foodId?: string;
    foodName: string;
    portion: number; // in baseUnit (g)
    unit?: string;
    // Pre-calculated macros for this portion
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}) {
    await db.insert(mealItems).values({
        mealId: data.mealId,
        foodId: data.foodId,
        foodName: data.foodName,
        portion: data.portion,
        unit: data.unit || 'g',
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat
    });
    // revalidatePath happens on client usually or parent page
}


// Full Plan Save (Transactional-ish)
export async function saveFullNutritionalPlan(data: {
    planId?: string; // Optional for updates
    studentId?: string | null;
    isTemplate?: boolean;
    title: string;
    dailyKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    waterGoalMl: number;
    daysOfWeek: string[];
    meals: {
        name: string;
        time: string;
        order: number;
        items: {
            foodId?: string;
            name: string;
            portion: number;
            unit: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
        }[]
    }[]
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    let planId = data.planId;

    if (planId) {
        // Update existing plan
        await db.update(nutritionalPlans).set({
            title: data.title,
            studentId: data.studentId || null,
            dailyKcal: data.dailyKcal,
            proteinG: data.proteinG,
            carbsG: data.carbsG,
            fatG: data.fatG,
            waterGoalMl: data.waterGoalMl,
            daysOfWeek: data.daysOfWeek,
            isTemplate: data.isTemplate || false,
            updatedAt: new Date()
        }).where(eq(nutritionalPlans.id, planId));

        // Delete existing meals (cascade items) to replace with new structure
        await db.delete(meals).where(eq(meals.planId, planId));
    } else {
        // Create Plan
        const [newPlan] = await db.insert(nutritionalPlans).values({
            trainerId: userId,
            studentId: data.studentId || null,
            title: data.title,
            dailyKcal: data.dailyKcal,
            proteinG: data.proteinG,
            carbsG: data.carbsG,
            fatG: data.fatG,
            waterGoalMl: data.waterGoalMl,
            daysOfWeek: data.daysOfWeek,
            isTemplate: data.isTemplate || false,
            active: true
        }).returning();
        planId = newPlan.id;
    }

    if (!planId) throw new Error("Failed to resolve Plan ID");

    // 2. Create Meals & Items
    for (const mealData of data.meals) {
        const [meal] = await db.insert(meals).values({
            planId: planId, // Use resolved planId
            name: mealData.name,
            time: mealData.time,
            order: mealData.order
        }).returning();

        if (mealData.items && mealData.items.length > 0) {
            await db.insert(mealItems).values(
                mealData.items.map(item => ({
                    mealId: meal.id,
                    foodId: item.foodId,
                    foodName: item.name,
                    portion: item.portion,
                    unit: item.unit,
                    calories: item.calories,
                    protein: item.protein,
                    carbs: item.carbs,
                    fat: item.fat
                }))
            );
        }
    }

    if (data.studentId) {
        revalidatePath(`/dashboard/students/${data.studentId}`);
    } else {
        revalidatePath('/dashboard/nutrition/templates');
    }
    return { id: planId };
}

// Metrics for Calculator
export async function getStudentMetrics(studentId: string) {
    const student = await db.query.students.findFirst({
        where: eq(students.id, studentId),
        columns: {
            birthDate: true,
            gender: true,
            name: true,
            photoUrl: true,
        }
    });

    if (!student) return null;

    // Get latest assessment for Weight/Height
    const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.studentId, studentId),
        orderBy: [desc(assessments.date)],
        columns: {
            weight: true, // grams
            height: true, // cm
            basalMetabolicRate: true, // cached BMR
            bodyFat: true, // Percentage * 100
        }
    });

    const age = student.birthDate ? differenceInYears(new Date(), new Date(student.birthDate)) : null;

    return {
        name: student.name,
        photoUrl: student.photoUrl,
        gender: student.gender as 'male' | 'female' | null,
        age,
        weight: assessment ? assessment.weight / 1000 : null, // convert g to kg
        height: assessment ? assessment.height : null, // cm
        savedBmr: assessment?.basalMetabolicRate || null,
        bodyFat: assessment?.bodyFat ? assessment.bodyFat / 100 : null, // convert 1555 -> 15.55
    };
}


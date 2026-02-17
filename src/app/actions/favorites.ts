'use server';

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { favoriteFoods, favoriteExercises, foods, exercises } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ── Foods ──────────────────────────────────────────────

export async function toggleFavoriteFood(foodId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Não autenticado');

    const existing = await db.select({ id: favoriteFoods.id })
        .from(favoriteFoods)
        .where(and(
            eq(favoriteFoods.trainerId, userId),
            eq(favoriteFoods.foodId, foodId),
        ))
        .limit(1);

    if (existing.length > 0) {
        await db.delete(favoriteFoods).where(eq(favoriteFoods.id, existing[0].id));
    } else {
        await db.insert(favoriteFoods).values({
            trainerId: userId,
            foodId,
        });
    }

    revalidatePath('/dashboard/nutrition/library');
    return { favorited: existing.length === 0 };
}

export async function getFavoriteFoodIds(): Promise<string[]> {
    const { userId } = await auth();
    if (!userId) return [];

    const rows = await db.select({ foodId: favoriteFoods.foodId })
        .from(favoriteFoods)
        .where(eq(favoriteFoods.trainerId, userId));

    return rows.map(r => r.foodId);
}

export async function getFavoriteFoods() {
    const { userId } = await auth();
    if (!userId) return [];

    const favIds = await db.select({ foodId: favoriteFoods.foodId })
        .from(favoriteFoods)
        .where(eq(favoriteFoods.trainerId, userId));

    if (favIds.length === 0) return [];

    const ids = favIds.map(r => r.foodId);
    const result = await db.select().from(foods).where(inArray(foods.id, ids));
    return result;
}

// ── Exercises ──────────────────────────────────────────

export async function toggleFavoriteExercise(exerciseId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Não autenticado');

    const existing = await db.select({ id: favoriteExercises.id })
        .from(favoriteExercises)
        .where(and(
            eq(favoriteExercises.trainerId, userId),
            eq(favoriteExercises.exerciseId, exerciseId),
        ))
        .limit(1);

    if (existing.length > 0) {
        await db.delete(favoriteExercises).where(eq(favoriteExercises.id, existing[0].id));
    } else {
        await db.insert(favoriteExercises).values({
            trainerId: userId,
            exerciseId,
        });
    }

    revalidatePath('/dashboard/workouts/library');
    return { favorited: existing.length === 0 };
}

export async function getFavoriteExerciseIds(): Promise<string[]> {
    const { userId } = await auth();
    if (!userId) return [];

    const rows = await db.select({ exerciseId: favoriteExercises.exerciseId })
        .from(favoriteExercises)
        .where(eq(favoriteExercises.trainerId, userId));

    return rows.map(r => r.exerciseId);
}

export async function getFavoriteExercises() {
    const { userId } = await auth();
    if (!userId) return [];

    const favIds = await db.select({ exerciseId: favoriteExercises.exerciseId })
        .from(favoriteExercises)
        .where(eq(favoriteExercises.trainerId, userId));

    if (favIds.length === 0) return [];

    const ids = favIds.map(r => r.exerciseId);
    const result = await db.select().from(exercises).where(inArray(exercises.id, ids));
    return result;
}

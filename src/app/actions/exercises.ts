'use server';

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createExercise(data: {
    name: string;
    muscleGroup: string;
    videoUrl?: string | null;
    imageUrl?: string | null;
    description?: string | null;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error('Não autenticado');

    if (!data.name || !data.muscleGroup) {
        throw new Error('Nome e grupo muscular são obrigatórios');
    }

    const [newExercise] = await db.insert(exercises).values({
        trainerId: userId,
        name: data.name.trim(),
        muscleGroup: data.muscleGroup,
        videoUrl: data.videoUrl?.trim() || null,
        imageUrl: data.imageUrl?.trim() || null,
        description: data.description?.trim() || null,
    }).returning();

    revalidatePath('/dashboard/workouts/library');
    return newExercise;
}

export async function updateExercise(
    exerciseId: string,
    data: {
        name?: string;
        muscleGroup?: string;
        videoUrl?: string | null;
        imageUrl?: string | null;
        description?: string | null;
    }
) {
    const { userId } = await auth();
    if (!userId) throw new Error('Não autenticado');

    // Verify ownership — trainers can only edit their own exercises
    const [existing] = await db.select().from(exercises).where(eq(exercises.id, exerciseId));
    if (!existing) throw new Error('Exercício não encontrado');

    // System exercises (trainerId null) can be edited by anyone → creates a copy logic could be added,
    // but for now allow editing only own exercises
    if (existing.trainerId && existing.trainerId !== userId) {
        throw new Error('Sem permissão para editar este exercício');
    }

    // If it's a system exercise, we create a copy for the trainer instead
    if (!existing.trainerId) {
        const [copy] = await db.insert(exercises).values({
            trainerId: userId,
            name: data.name?.trim() || existing.name,
            muscleGroup: data.muscleGroup || existing.muscleGroup,
            videoUrl: data.videoUrl !== undefined ? (data.videoUrl?.trim() || null) : existing.videoUrl,
            imageUrl: data.imageUrl !== undefined ? (data.imageUrl?.trim() || null) : existing.imageUrl,
            description: data.description !== undefined ? (data.description?.trim() || null) : existing.description,
        }).returning();
        revalidatePath('/dashboard/workouts/library');
        return copy;
    }

    const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.muscleGroup !== undefined) updateData.muscleGroup = data.muscleGroup;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl?.trim() || null;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl?.trim() || null;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;

    await db.update(exercises).set(updateData).where(eq(exercises.id, exerciseId));

    revalidatePath('/dashboard/workouts/library');
    return { ...existing, ...updateData };
}

export async function deleteExercise(exerciseId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Não autenticado');

    const [existing] = await db.select().from(exercises).where(eq(exercises.id, exerciseId));
    if (!existing) throw new Error('Exercício não encontrado');

    // Only allow deleting own exercises, not system ones
    if (!existing.trainerId || existing.trainerId !== userId) {
        throw new Error('Sem permissão para excluir este exercício');
    }

    await db.delete(exercises).where(eq(exercises.id, exerciseId));
    revalidatePath('/dashboard/workouts/library');
    return { success: true };
}

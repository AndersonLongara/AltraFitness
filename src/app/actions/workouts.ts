'use server';

import { db } from "@/db";
import { workouts, workoutItems, trainers } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

interface CreateWorkoutData {
    title: string;
    studentId: string;
    trainerId: string;
    items: {
        exerciseId: string;
        sets: number;
        reps: string;
        rpe?: number;
        restSeconds?: number;
        notes?: string;
        order: number;
    }[];
}

export async function createWorkout(data: CreateWorkoutData) {
    if (!data.title || !data.studentId || !data.trainerId) {
        throw new Error("Missing required fields");
    }

    // Ensure trainer exists in DB (sync with Clerk)
    const existingTrainer = await db.select().from(trainers).where(eq(trainers.id, data.trainerId)).limit(1);

    if (existingTrainer.length === 0) {
        const user = await currentUser();
        if (user && user.id === data.trainerId) {
            const email = user.emailAddresses[0]?.emailAddress || "no-email@example.com";
            const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Trainer";

            await db.insert(trainers).values({
                id: user.id,
                name,
                email,
            });
        } else {
            // Fallback or error if we can't get user details to create trainer
            console.error("Trainer record missing and could not fetch user details.");
            // Potentially continue and let it fail or throw
        }
    }

    try {
        await db.transaction(async (tx: any) => {
            // 1. Create Workout Header
            const [newWorkout] = await tx.insert(workouts).values({
                title: data.title,
                studentId: data.studentId,
                trainerId: data.trainerId,
                status: "pending",
                scheduledDate: new Date(), // For now, defaults to today
            }).returning();

            // 2. Create Workout Items
            if (data.items.length > 0) {
                await tx.insert(workoutItems).values(
                    data.items.map((item) => ({
                        workoutId: newWorkout.id,
                        exerciseId: item.exerciseId,
                        sets: item.sets,
                        reps: item.reps,
                        rpe: item.rpe,
                        restSeconds: item.restSeconds,
                        notes: item.notes,
                        order: item.order,
                    }))
                );
            }
        });

        revalidatePath("/dashboard/students");
        revalidatePath(`/dashboard/students/${data.studentId}`);
    } catch (error) {
        console.error("Failed to create workout:", error);
        throw new Error("Failed to create workout");
    }

    redirect(`/dashboard/students/${data.studentId}`);
}
// ... existing createWorkout code ...

export async function updateWorkout(workoutId: string, data: CreateWorkoutData) {
    if (!workoutId || !data.title || !data.studentId || !data.trainerId) {
        throw new Error("Missing required fields");
    }

    try {
        await db.transaction(async (tx: any) => {
            // 1. Verify ownership/existence (optional safety check, but generally good)
            // For now, we trust the ID passed and the update will fail if ID doesn't exist or we can add a check.

            // 2. Update Workout Header
            await tx.update(workouts)
                .set({
                    title: data.title,
                    studentId: data.studentId,
                    updatedAt: new Date(),
                })
                .where(eq(workouts.id, workoutId));

            // 3. Replace Items (Delete All + Insert New)
            await tx.delete(workoutItems).where(eq(workoutItems.workoutId, workoutId));

            if (data.items.length > 0) {
                await tx.insert(workoutItems).values(
                    data.items.map((item) => ({
                        workoutId: workoutId,
                        exerciseId: item.exerciseId,
                        sets: item.sets,
                        reps: item.reps,
                        rpe: item.rpe,
                        restSeconds: item.restSeconds,
                        notes: item.notes,
                        order: item.order,
                    }))
                );
            }
        });

        revalidatePath("/dashboard/students");
        revalidatePath(`/dashboard/students/${data.studentId}`);
        revalidatePath("/dashboard/workouts"); // Also revalidate the main list
    } catch (error) {
        console.error("Failed to update workout:", error);
        throw new Error("Failed to update workout");
    }

    // redirect is handled on client side now for updates to allow dynamic return paths
}

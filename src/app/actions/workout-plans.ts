'use server';

import { db } from "@/db";
import { workoutPlans, workouts, workoutItems, trainers } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { eq, sql, inArray } from "drizzle-orm";

interface WorkoutItemInput {
    exerciseId: string;
    sets: number;
    warmupSets?: number;
    preparatorySets?: number;
    reps: string;
    rpe?: number;
    restSeconds?: number;
    isSuperset?: boolean;
    advancedTechniques?: string; // JSON string
    notes?: string;
    order: number;
}

interface WorkoutInput {
    id?: string; // Optional for updates
    title: string;
    items: WorkoutItemInput[];
}

interface CreatePlanData {
    studentId?: string;
    isTemplate?: boolean;
    name: string;
    cardio: {
        frequency: 'weekly' | 'daily';
        type: 'time' | 'distance';
        duration: number;
        unit: 'minutes' | 'hours' | 'km';
        days?: string[];
        notes?: string;
    };
    observations?: string;
    workouts: WorkoutInput[];
}

export async function createWorkoutPlan(data: CreatePlanData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const trainerId = user.id;

    // Ensure trainer exists
    const existingTrainer = await db.select().from(trainers).where(eq(trainers.id, trainerId)).limit(1);
    if (existingTrainer.length === 0) {
        await db.insert(trainers).values({
            id: trainerId,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.emailAddresses[0].emailAddress,
        });
    }

    let newPlanId = "";

    try {
        await db.transaction(async (tx: any) => {
            // 1. Create Plan
            const [newPlan] = await tx.insert(workoutPlans).values({
                trainerId,
                studentId: data.studentId || null,
                name: data.name,
                isTemplate: data.isTemplate || false,
                cardio: data.cardio,
                observations: data.observations,
                active: true,
            }).returning();
            newPlanId = newPlan.id;

            // 2. Create Workouts & Items
            for (const workout of data.workouts) {
                const [newWorkout] = await tx.insert(workouts).values({
                    trainerId,
                    studentId: data.studentId || null,
                    planId: newPlan.id,
                    title: workout.title,
                    status: 'pending',
                }).returning();

                if (workout.items.length > 0) {
                    await tx.insert(workoutItems).values(
                        workout.items.map(item => ({
                            workoutId: newWorkout.id,
                            exerciseId: item.exerciseId,
                            sets: item.sets,
                            warmupSets: item.warmupSets || 0,
                            preparatorySets: item.preparatorySets || 0,
                            reps: item.reps,
                            rpe: item.rpe || 0,
                            restSeconds: item.restSeconds || 0,
                            isSuperset: item.isSuperset || false,
                            advancedTechniques: item.advancedTechniques || null,
                            notes: item.notes || '',
                            order: item.order,
                        }))
                    );
                }
            }
        });

        revalidatePath("/dashboard/students");
        if (data.studentId) revalidatePath(`/dashboard/students/${data.studentId}`);
        revalidatePath("/dashboard/workouts/templates");

        return { success: true, planId: newPlanId };
    } catch (error) {
        console.error("Failed to create workout plan:", error);
        throw new Error("Failed to create workout plan");
    }
}

export async function updateWorkoutPlan(planId: string, data: CreatePlanData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const trainerId = user.id;

    try {
        await db.transaction(async (tx: any) => {
            // 1. Update Plan Header
            await tx.update(workoutPlans)
                .set({
                    name: data.name,
                    studentId: data.studentId || null, // In case it changed
                    isTemplate: data.isTemplate || false,
                    cardio: data.cardio,
                    observations: data.observations,
                    updatedAt: new Date(),
                })
                .where(eq(workoutPlans.id, planId));

            // 2. Update Workouts
            const existingWorkouts = await tx.select().from(workouts).where(eq(workouts.planId, planId));
            const incomingIds = data.workouts.map(w => w.id).filter(Boolean);
            const toDeleteIds = existingWorkouts.map((w: any) => w.id).filter((id: string) => !incomingIds.includes(id));

            // Delete removed workouts
            if (toDeleteIds.length > 0) {
                await tx.delete(workouts).where(inArray(workouts.id, toDeleteIds));
            }

            for (const workout of data.workouts) {
                let workoutId = workout.id;

                if (workoutId && existingWorkouts.find((w: any) => w.id === workoutId)) {
                    // Update existing workout
                    await tx.update(workouts)
                        .set({ title: workout.title })
                        .where(eq(workouts.id, workoutId));

                    // Replace items (easier than diffing items)
                    await tx.delete(workoutItems).where(eq(workoutItems.workoutId, workoutId));
                } else {
                    // Create new workout
                    const [newW] = await tx.insert(workouts).values({
                        trainerId,
                        studentId: data.studentId || null,
                        planId: planId,
                        title: workout.title,
                        status: 'pending',
                    }).returning();
                    workoutId = newW.id;
                }

                // Insert items
                if (workout.items.length > 0) {
                    await tx.insert(workoutItems).values(
                        workout.items.map(item => ({
                            workoutId: workoutId,
                            exerciseId: item.exerciseId,
                            sets: item.sets,
                            warmupSets: item.warmupSets || 0,
                            preparatorySets: item.preparatorySets || 0,
                            reps: item.reps,
                            rpe: item.rpe || 0,
                            restSeconds: item.restSeconds || 0,
                            isSuperset: item.isSuperset || false,
                            advancedTechniques: item.advancedTechniques || null,
                            notes: item.notes || '',
                            order: item.order,
                        }))
                    );
                }
            }
        });

        revalidatePath("/dashboard/students");
        if (data.studentId) revalidatePath(`/dashboard/students/${data.studentId}`);
        revalidatePath("/dashboard/workouts/templates");

        return { success: true, planId };
    } catch (error) {
        console.error("Failed to update workout plan:", error);
        throw new Error("Failed to update workout plan");
    }
}

export async function applyWorkoutPlanTemplate(templateId: string, studentId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const trainerId = user.id;

    try {
        await db.transaction(async (tx: any) => {
            // 1. Fetch Template
            const templates = await tx.select().from(workoutPlans).where(eq(workoutPlans.id, templateId)).limit(1);
            if (templates.length === 0) throw new Error("Template not found");
            const template = templates[0];

            // 2. Clone Plan
            const [newPlan] = await tx.insert(workoutPlans).values({
                trainerId,
                studentId,
                name: template.name, // Use same name or "Cópia de "
                isTemplate: false,
                cardio: template.cardio,
                observations: template.observations,
                active: true,
            }).returning();

            // 3. Fetch Template Workouts
            const templateWorkouts = await tx.select().from(workouts).where(eq(workouts.planId, templateId));

            for (const tWorkout of templateWorkouts) {
                // 4. Clone Workout
                const [newWorkout] = await tx.insert(workouts).values({
                    trainerId,
                    studentId,
                    planId: newPlan.id,
                    title: tWorkout.title,
                    status: 'pending',
                }).returning();

                // 5. Fetch Template Items
                const tItems = await tx.select().from(workoutItems).where(eq(workoutItems.workoutId, tWorkout.id));

                if (tItems.length > 0) {
                    // 6. Clone Items
                    await tx.insert(workoutItems).values(
                        tItems.map((item: any) => ({
                            workoutId: newWorkout.id,
                            exerciseId: item.exerciseId,
                            sets: item.sets,
                            warmupSets: item.warmupSets,
                            preparatorySets: item.preparatorySets,
                            reps: item.reps,
                            rpe: item.rpe,
                            restSeconds: item.restSeconds,
                            isSuperset: item.isSuperset,
                            advancedTechniques: item.advancedTechniques,
                            notes: item.notes,
                            order: item.order,
                        }))
                    );
                }
            }
        });

        revalidatePath("/dashboard/students");
        revalidatePath(`/dashboard/students/${studentId}`);
    } catch (error) {
        console.error("Failed to apply template:", error);
        throw new Error("Failed to apply template");
    }

    redirect(`/dashboard/students/${studentId}`);
}

export async function deleteWorkoutPlan(planId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await db.delete(workoutPlans).where(eq(workoutPlans.id, planId));

        revalidatePath("/dashboard/students");
        revalidatePath("/dashboard/workouts");
        revalidatePath("/dashboard/workouts/templates");

        return { success: true };
    } catch (error) {
        console.error("Failed to delete workout plan:", error);
        throw new Error("Failed to delete workout plan");
    }
}

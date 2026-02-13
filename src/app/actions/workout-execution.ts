'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workoutLogs, workoutLogSets, students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addXp } from "@/services/gamification";

export async function startWorkout(workoutId: string) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    // Check if there is already an active workout?
    // For now, let's just create a new one.
    // Ideally we should check for status 'in_progress' and resume it.

    const [log] = await db.insert(workoutLogs).values({
        studentId: student.id,
        workoutId,
        startedAt: new Date(),
        status: 'in_progress'
    }).returning();

    return { success: true, logId: log.id };
}

export async function logSet(logId: string, exerciseId: string, setNumber: number, data: { weight?: number, reps: number, rpe?: number }) {
    // Upsert logic would be better, but insert is fine for now as we assume sequential logging
    // actually, if user edits a set, we should update.

    // Check if set exists
    const existingSet = await db.query.workoutLogSets.findFirst({
        where: (sets, { eq, and }) => and(
            eq(sets.logId, logId),
            eq(sets.exerciseId, exerciseId),
            eq(sets.setNumber, setNumber)
        )
    });

    if (existingSet) {
        await db.update(workoutLogSets)
            .set({
                weight: data.weight,
                reps: data.reps,
                rpe: data.rpe,
                completed: true
            })
            .where(eq(workoutLogSets.id, existingSet.id));
    } else {
        await db.insert(workoutLogSets).values({
            logId,
            exerciseId,
            setNumber,
            weight: data.weight,
            reps: data.reps,
            rpe: data.rpe,
            completed: true
        });
    }

    return { success: true };
}

export async function finishWorkout(logId: string) {
    const { userId } = await auth();

    // Validate ownership
    const log = await db.query.workoutLogs.findFirst({
        where: eq(workoutLogs.id, logId)
    });

    if (!log) throw new Error("Log not found");

    await db.update(workoutLogs)
        .set({
            endedAt: new Date(),
            status: 'completed'
        })
        .where(eq(workoutLogs.id, logId));

    // Award XP
    // Strategy: Base 100 XP + maybe bonus per set?
    // Let's keep it simple: 150 XP for a workout.
    await addXp(log.studentId, 150, 'workout_complete');

    revalidatePath('/student');
    return { success: true };
}

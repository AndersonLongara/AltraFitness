'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workoutLogs, workoutLogSets, students } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");
    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({ where: eq(students.email, email), columns: { id: true } });
    if (!student) throw new Error("Student not found");
    const log = await db.query.workoutLogs.findFirst({ where: eq(workoutLogs.id, logId), columns: { studentId: true } });
    if (!log || log.studentId !== student.id) throw new Error("Log não encontrado ou não pertence a você.");

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
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");
    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({ where: eq(students.email, email), columns: { id: true } });
    if (!student) throw new Error("Student not found");
    const log = await db.query.workoutLogs.findFirst({ where: eq(workoutLogs.id, logId) });
    if (!log) throw new Error("Log not found");
    if (log.studentId !== student.id) throw new Error("Este treino não pertence a você.");

    await db.update(workoutLogs)
        .set({
            endedAt: new Date(),
            status: 'completed'
        })
        .where(eq(workoutLogs.id, logId));

    const xpEarned = 150;
    await addXp(log.studentId, xpEarned, 'workout_complete');

    revalidatePath('/student');
    return { success: true, xpEarned };
}

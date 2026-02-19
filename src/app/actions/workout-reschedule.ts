'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students, workouts, workoutDateOverrides } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { startOfDay } from "date-fns";

/**
 * Aluno define que quer fazer este treino em outra data (substituir o dia).
 * Cria ou atualiza o override para (studentId, date) -> workoutId.
 */
export async function setWorkoutDayOverride(workoutId: string, dateStr: string) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Não autorizado");

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("E-mail não encontrado");

    const student = await db.query.students.findFirst({
        where: eq(students.email, email),
    });
    if (!student) throw new Error("Aluno não encontrado");

    const workout = await db.query.workouts.findFirst({
        where: eq(workouts.id, workoutId),
    });
    if (!workout || workout.studentId !== student.id) {
        throw new Error("Treino não encontrado ou não pertence a você");
    }

    const date = startOfDay(new Date(dateStr));
    const targetDateSeconds = Math.floor(date.getTime() / 1000); // Unix seconds

    const existing = await db.query.workoutDateOverrides.findFirst({
        where: and(
            eq(workoutDateOverrides.studentId, student.id),
            eq(workoutDateOverrides.targetDate, targetDateSeconds)
        ),
    });

    if (existing) {
        await db.update(workoutDateOverrides)
            .set({ workoutId })
            .where(eq(workoutDateOverrides.id, existing.id));
    } else {
        await db.insert(workoutDateOverrides).values({
            studentId: student.id,
            targetDate: targetDateSeconds,
            workoutId,
        });
    }

    revalidatePath("/student");
    revalidatePath("/student/workouts");
    return { success: true };
}

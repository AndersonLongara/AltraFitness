'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { hydrationLogs, students, moodLogs } from "@/db/schema";
import { eq, sql, gte, lte, and } from "drizzle-orm";
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

    // Check if already logged today? Or allow multiple?
    // Let's allow multiple but only award XP once per day?
    // For simplicity, just log it.

    await db.insert(moodLogs).values({
        studentId: student.id,
        mood,
        note,
        createdAt: new Date(),
    });

    // Award XP
    await addXp(student.id, 5, 'mood_log');

    revalidatePath('/student');
    return { success: true };
}

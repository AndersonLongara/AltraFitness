'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students, workoutLogs, mealLogs, assessments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getStudentProfile() {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    // Fetch Stats
    // 1. Total Workouts
    const totalWorkouts = await db.$count(workoutLogs, and(
        eq(workoutLogs.studentId, student.id),
        eq(workoutLogs.status, 'completed')
    ));

    // 2. Total Meals Logged
    const totalMeals = await db.$count(mealLogs, eq(mealLogs.studentId, student.id));

    // 3. First Activity Date (Joined essentially, or first log)
    // For now using student created_at if available, or fallback
    const joinedAt = student.createdAt || new Date();

    return {
        ...student,
        photoUrl: user.imageUrl, // Use Clerk image as source of truth for now, or student.photoUrl if we sync it
        stats: {
            totalWorkouts,
            totalMeals,
            joinedAt
        }
    };
}

export async function updateStudentProfile(data: { name?: string; phone?: string }) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    await db.update(students)
        .set({
            name: data.name || student.name,
            phone: data.phone || student.phone,
        })
        .where(eq(students.id, student.id));

    revalidatePath('/student/profile');
    revalidatePath('/student');
    return { success: true };
}

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

export async function updateStudentProfile(data: {
    name?: string;
    phone?: string;
    cpf?: string;
    birthDate?: string; // ISO string or dd/mm/yyyy
    gender?: 'male' | 'female';
    height?: number; // cm
    weight?: number; // kg (will be stored as grams)
}) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    const updateData: Record<string, unknown> = {};

    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.cpf) updateData.cpf = data.cpf;
    if (data.gender) updateData.gender = data.gender;
    if (data.height) updateData.height = data.height;
    if (data.weight) updateData.weight = Math.round(data.weight * 1000); // kg → grams

    if (data.birthDate) {
        // Support both ISO and dd/mm/yyyy
        let date: Date;
        if (data.birthDate.includes('/')) {
            const [day, month, year] = data.birthDate.split('/').map(Number);
            date = new Date(year, month - 1, day);
        } else {
            date = new Date(data.birthDate);
        }
        if (!isNaN(date.getTime())) {
            updateData.birthDate = date;
        }
    }

    await db.update(students)
        .set(updateData)
        .where(eq(students.id, student.id));

    revalidatePath('/student/profile');
    revalidatePath('/student');
    return { success: true };
}

/**
 * Check if the student has completed their essential profile fields.
 * Returns which fields are missing.
 */
export async function checkStudentProfileComplete() {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return { complete: true, missing: [] };

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) return { complete: true, missing: [] };

    const missing: string[] = [];

    if (!student.phone) missing.push('phone');
    if (!student.cpf) missing.push('cpf');
    if (!student.birthDate) missing.push('birthDate');
    if (!student.gender) missing.push('gender');
    if (!student.height) missing.push('height');
    if (!student.weight) missing.push('weight');

    return {
        complete: missing.length === 0,
        missing,
        student: {
            name: student.name,
            phone: student.phone,
            cpf: student.cpf,
            birthDate: student.birthDate ? student.birthDate.toISOString().split('T')[0] : null,
            gender: student.gender,
            height: student.height,
            weight: student.weight ? student.weight / 1000 : null, // grams → kg
        }
    };
}

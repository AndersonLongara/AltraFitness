'use server';

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workoutLogs, assessments, students, assessmentPhotos } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export async function getWorkoutHistory() {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    // Fetch all completed workouts
    const logs = await db.query.workoutLogs.findMany({
        where: and(
            eq(workoutLogs.studentId, student.id),
            eq(workoutLogs.status, 'completed')
        ),
        orderBy: [desc(workoutLogs.endedAt)],
        columns: {
            endedAt: true
        }
    });

    // Return just dates for the calendar
    // Format: YYYY-MM-DD
    return logs
        .filter(l => l.endedAt)
        .map(l => l.endedAt!.toISOString().split('T')[0]);
}

export async function getStudentStats() {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    // Fetch assessments for charts
    const history = await db.query.assessments.findMany({
        where: eq(assessments.studentId, student.id),
        orderBy: [asc(assessments.date)],
        columns: {
            date: true,
            weight: true,
            bodyFat: true,
            leanMass: true,
            fatMass: true,
            // Circumferences could be added here
        }
    });

    return history.map(h => ({
        date: h.date.toISOString().split('T')[0],
        weight: h.weight / 1000, // Convert g to kg
        bodyFat: h.bodyFat ? h.bodyFat / 100 : null, // Convert integer % to float
        leanMass: h.leanMass ? h.leanMass / 1000 : null,
        fatMass: h.fatMass ? h.fatMass / 1000 : null,
    }));
}

export async function getStudentPhotos() {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) throw new Error("Student not found");

    // Fetch photos with assessment date
    // We join manually or just fetch assessments with photos
    const history = await db.query.assessments.findMany({
        where: eq(assessments.studentId, student.id),
        orderBy: [desc(assessments.date)],
        with: {
            photos: true
        }
    });

    const photos = history.flatMap(a => a.photos.map(p => ({
        id: p.id,
        url: p.photoUrl,
        type: p.type,
        date: a.date.toISOString().split('T')[0]
    })));

    return photos;
}

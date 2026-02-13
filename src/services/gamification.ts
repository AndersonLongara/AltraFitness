import { db } from "@/db";
import { students, gamificationLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const XP_PER_LEVEL = 1000;

export async function addXp(studentId: string, amount: number, action: string) {
    // 1. Log the action
    await db.insert(gamificationLogs).values({
        studentId,
        action,
        xpEarned: amount,
        createdAt: new Date(),
    });

    // 2. Get current student data
    const student = await db.query.students.findFirst({
        where: eq(students.id, studentId),
    });

    if (!student) throw new Error("Student not found");

    // 3. Calculate new stats
    const newXp = (student.currentXp || 0) + amount;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    const levelUp = newLevel > (student.level || 1);

    // 4. Update Streak Logic
    const today = new Date();
    const lastActivity = student.lastActivityDate ? new Date(student.lastActivityDate) : null;

    let currentStreak = student.currentStreak || 0;
    let longestStreak = student.longestStreak || 0;

    // Check if activity is on a new day
    if (lastActivity) {
        const isToday = lastActivity.toDateString() === today.toDateString();
        const isYesterday = new Date(today.setDate(today.getDate() - 1)).toDateString() === lastActivity.toDateString();

        if (!isToday) {
            if (isYesterday) {
                currentStreak += 1;
            } else {
                currentStreak = 1; // Reset streak if missed a day
            }
        }
    } else {
        currentStreak = 1; // First activity ever
    }

    if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
    }

    // 5. Update Student Record
    await db.update(students)
        .set({
            currentXp: newXp,
            level: newLevel,
            currentStreak,
            longestStreak,
            lastActivityDate: new Date(), // Reset to now
            updatedAt: new Date(),
        })
        .where(eq(students.id, studentId));

    return {
        success: true,
        newLevel,
        levelUp,
        newXp,
        currentStreak
    };
}

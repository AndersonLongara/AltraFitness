"use server";

import { db } from "@/db";
import { trainers } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

/**
 * Ensures the current authenticated trainer exists in our local database.
 * Fetches data from Clerk and performs an upsert.
 */
export async function syncTrainer() {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await currentUser();
    if (!user) return null;

    const email = user.emailAddresses[0]?.emailAddress;
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Treinador AltraFit";

    // Check if trainer exists with same email but different Clerk ID
    const existingByEmail = await db.query.trainers.findFirst({
        where: eq(trainers.email, email),
        columns: { id: true },
    });
    if (existingByEmail && existingByEmail.id !== userId) {
        await db.update(trainers)
            .set({ id: userId, name, updatedAt: new Date() })
            .where(eq(trainers.id, existingByEmail.id));
        const updated = await db.query.trainers.findFirst({ where: eq(trainers.id, userId) });
        return updated || null;
    }

    // Upsert trainer record
    const [syncedTrainer] = await db.insert(trainers)
        .values({
            id: userId,
            name,
            email,
            theme: 'system',
        })
        .onConflictDoUpdate({
            target: trainers.id,
            set: {
                name,
                email,
                updatedAt: new Date(),
            }
        })
        .returning();

    return syncedTrainer;
}

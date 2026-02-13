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

    // Upsert trainer record
    const [syncedTrainer] = await db.insert(trainers)
        .values({
            id: userId,
            name,
            email,
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

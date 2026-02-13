import { db } from "@/db";
import { students, leads } from "@/db/schema";
import { eq, isNull, and } from "drizzle-orm";

async function syncPhotos() {
    console.log("Starting photo sync...");

    // 1. Get all students without a photo
    const studentsWithoutPhoto = await db.query.students.findMany({
        where: isNull(students.photoUrl),
    });

    console.log(`Found ${studentsWithoutPhoto.length} students without photo.`);

    let updatedCount = 0;

    for (const student of studentsWithoutPhoto) {
        // 2. Find matching lead by name (and trainer)
        // Note: Using name is risky if duplicates, but for this specific use case it's likely fine.
        // Better: match email or phone if available.
        // Let's try name first as it's definitely there.

        const matchingLead = await db.query.leads.findFirst({
            where: and(
                eq(leads.name, student.name),
                eq(leads.trainerId, student.trainerId)
            ),
            orderBy: (leads, { desc }) => [desc(leads.createdAt)] // Get most recent lead if duplicates
        });

        if (matchingLead && matchingLead.photoUrl) {
            console.log(`Syncing photo for ${student.name} from lead...`);

            await db.update(students)
                .set({ photoUrl: matchingLead.photoUrl })
                .where(eq(students.id, student.id));

            updatedCount++;
        }
    }

    console.log(`Sync complete. Updated ${updatedCount} students.`);
}

syncPhotos();

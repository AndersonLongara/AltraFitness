import { db } from "./src/db";
import { exercises } from "./src/db/schema";
import { eq, isNull, or } from "drizzle-orm";

async function check() {
    console.log("Checking exercises...");

    // 1. Count total
    const all = await db.select().from(exercises);
    console.log(`Total exercises: ${all.length}`);
    console.log("Sample trainerIds:", all.slice(0, 5).map(e => ({ name: e.name, trainerId: e.trainerId })));

    // 2. Check null trainerId specifically
    const publicEx = await db.select().from(exercises).where(isNull(exercises.trainerId));
    console.log(`Public exercises (trainerId is null): ${publicEx.length}`);

    // 3. Check invalid trainerId?
    // ...
}

check().catch(console.error);

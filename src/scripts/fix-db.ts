
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function fixDb() {
    try {
        await db.run(sql`ALTER TABLE nutritional_plans ADD COLUMN is_template INTEGER DEFAULT 0`);
        console.log("Added 'is_template' column to nutritional_plans");
    } catch (e) {
        console.log("Error adding 'is_template':", e);
    }

    try {
        await db.run(sql`ALTER TABLE foods ADD COLUMN trainer_id TEXT REFERENCES trainers(id)`);
        console.log("Added 'trainer_id' column to foods");
    } catch (e) {
        console.log("Error adding 'trainer_id':", e);
    }
}

fixDb();


import { db } from "@/db";
import { sql } from "drizzle-orm";

async function fixDb() {
    try {
        await db.run(sql`ALTER TABLE students ADD COLUMN birth_date INTEGER`); // Timestamp
        console.log("Added 'birth_date' column to students");
    } catch (e) {
        console.log("Error adding 'birth_date':", e);
    }

    try {
        await db.run(sql`ALTER TABLE students ADD COLUMN gender TEXT`);
        console.log("Added 'gender' column to students");
    } catch (e) {
        console.log("Error adding 'gender':", e);
    }
}

fixDb();

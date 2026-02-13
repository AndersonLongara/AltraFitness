import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Dropping meal_logs tables...");
    try {
        await db.run(sql`DROP TABLE IF EXISTS meal_logs`);
        await db.run(sql`DROP TABLE IF EXISTS __new_meal_logs`);
        console.log("Tables dropped successfully.");
    } catch (error) {
        console.error("Error dropping tables:", error);
    }
}

main();

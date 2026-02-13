import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Fixing schema...");

    try {
        // 1. Create foods table if not exists
        await db.run(sql`
            CREATE TABLE IF NOT EXISTS "foods" (
                "id" text PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "calories" integer NOT NULL,
                "protein" integer NOT NULL,
                "carbs" integer NOT NULL,
                "fat" integer NOT NULL,
                "base_unit" text DEFAULT 'g',
                "base_amount" integer DEFAULT 100,
                "category" text,
                "source" text DEFAULT 'system',
                "created_at" integer DEFAULT (strftime('%s', 'now'))
            );
        `);
        console.log("Created foods table.");

        // 2. Add columns to nutritional_plans (if not exist)
        try {
            await db.run(sql`ALTER TABLE "nutritional_plans" ADD COLUMN "water_goal_ml" integer DEFAULT 2500;`);
            console.log("Added water_goal_ml to nutritional_plans.");
        } catch (e) {
            console.log("water_goal_ml likely exists or error:", e);
        }

        try {
            await db.run(sql`ALTER TABLE "nutritional_plans" ADD COLUMN "days_of_week" text;`);
            console.log("Added days_of_week to nutritional_plans.");
        } catch (e) {
            console.log("days_of_week likely exists or error:", e);
        }

        // 3. Drop and Recreate meal_items (simplest way to update schema given no data loss concern for dev)
        // Check if food_id column exists, if not, recreate table
        try {
            await db.run(sql`ALTER TABLE "meal_items" ADD COLUMN "food_id" text;`);
            console.log("Added food_id to meal_items.");
        } catch (e) {
            console.log("food_id likely exists or error:", e);
        }

    } catch (error) {
        console.error("Schema fix failed:", error);
    }
}

main();

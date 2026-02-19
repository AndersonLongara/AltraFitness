/**
 * Migração: adiciona suggested_day_of_week aos treinos e tabela workout_date_overrides.
 * Executar: npx tsx src/scripts/add-workout-day-and-overrides.ts
 */
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding suggested_day_of_week and workout_date_overrides...");

    try {
        await db.run(sql`ALTER TABLE workouts ADD COLUMN suggested_day_of_week integer;`);
        console.log("Added suggested_day_of_week to workouts.");
    } catch (e: any) {
        if (e?.message?.includes("duplicate column")) console.log("suggested_day_of_week already exists.");
        else console.error("workouts alter:", e);
    }

    await db.run(sql`
        CREATE TABLE IF NOT EXISTS workout_date_overrides (
            id text PRIMARY KEY NOT NULL,
            student_id text NOT NULL REFERENCES students(id) ON DELETE CASCADE,
            target_date integer NOT NULL,
            workout_id text NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
            created_at integer DEFAULT (strftime('%s', 'now'))
        );
    `);
    console.log("Created workout_date_overrides table (target_date).");

    try {
        await db.run(sql`ALTER TABLE workout_date_overrides RENAME COLUMN date TO target_date`);
        console.log("Renamed workout_date_overrides.date -> target_date.");
    } catch (e: any) {
        if (!e?.message?.includes("no such column") && !e?.message?.includes("duplicate column")) {
            console.log("Rename date->target_date skipped (column may not exist or already renamed):", e?.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });

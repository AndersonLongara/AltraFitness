import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
        throw new Error("TURSO_DATABASE_URL not found in .env.local");
    }

    const client = createClient({
        url: url,
    });

    console.log("Migrating workouts table to allow NULL student_id...");

    try {
        await client.execute("PRAGMA foreign_keys=OFF");

        // 1. Get current columns
        const tableInfo = await client.execute("PRAGMA table_info(workouts)");
        console.log("Current structure:", tableInfo.rows);

        // 2. Create new table
        // We need to be careful with the exact structure.
        // from schema.ts:
        /*
        export const workouts = sqliteTable('workouts', {
            id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
            trainerId: text('trainer_id').notNull().references(() => trainers.id),
            studentId: text('student_id').references(() => students.id), // Nullable for templates
            planId: text('plan_id').references(() => workoutPlans.id, { onDelete: 'cascade' }), // Optional for backward compatibility, but ideally required for new logic
            title: text('title').notNull(), // e.g., "Treino A - Peito"
            status: text('status').default('pending'), // pending, completed, skipped
            scheduledDate: integer('scheduled_date', { mode: 'timestamp' }),
            completedAt: integer('completed_at', { mode: 'timestamp' }),
            createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
            updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
        });
        */

        // Check columns again to make sure everything is there
        const columns = tableInfo.rows.map(r => r.name);
        console.log("Columns to migrate:", columns);

        // Define the new table SQL based on the columns found
        // Note: we must include plan_id if it exists
        const hasPlanId = columns.includes('plan_id');

        await client.execute(`
            CREATE TABLE workouts_new (
                id text PRIMARY KEY NOT NULL,
                trainer_id text NOT NULL,
                student_id text,
                ${hasPlanId ? 'plan_id text,' : ''}
                title text NOT NULL,
                status text DEFAULT 'pending',
                scheduled_date integer,
                completed_at integer,
                created_at integer DEFAULT (strftime('%s', 'now')),
                updated_at integer DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
                FOREIGN KEY (student_id) REFERENCES students(id) ON UPDATE NO ACTION ON DELETE NO ACTION
                ${hasPlanId ? ',FOREIGN KEY (plan_id) REFERENCES workout_plans(id) ON UPDATE NO ACTION ON DELETE CASCADE' : ''}
            )
        `);

        // 3. Move data
        const colsStr = columns.join(', ');
        await client.execute(`INSERT INTO workouts_new (${colsStr}) SELECT ${colsStr} FROM workouts`);

        // 4. Swap tables
        await client.execute("DROP TABLE workouts");
        await client.execute("ALTER TABLE workouts_new RENAME TO workouts");

        await client.execute("PRAGMA foreign_keys=ON");

        console.log("Migration successful!");
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

main().catch(console.error);

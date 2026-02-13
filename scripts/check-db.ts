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

    console.log(`Connecting to: ${url}`);

    const client = createClient({
        url: url,
    });

    const tables = ['workouts', 'workout_items', 'workout_plans'];

    for (const table of tables) {
        console.log(`\nTable: ${table}`);
        const result = await client.execute(`PRAGMA table_info(${table})`);
        result.rows.forEach(row => {
            console.log(JSON.stringify(row));
        });
    }
}

main().catch(console.error);

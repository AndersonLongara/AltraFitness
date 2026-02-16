/**
 * One-off: add price_per_student_cents to platform_plans if missing.
 * Run: npx tsx scripts/add-price-per-student-column.ts
 * Uses same TURSO_DATABASE_URL / .env.local as the app.
 */
import "dotenv/config";
import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env.local" });

const url = (process.env.TURSO_DATABASE_URL || "file:local.db").trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

const client = createClient({ url, authToken });

const sql = "ALTER TABLE platform_plans ADD COLUMN price_per_student_cents integer";

async function main() {
  try {
    await client.execute(sql);
    console.log("[OK] Column platform_plans.price_per_student_cents added.");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("duplicate column name") || msg.includes("already exists")) {
      console.log("[OK] Column already exists, nothing to do.");
      process.exit(0);
      return;
    }
    console.error("[ERROR]", e);
    process.exit(1);
  } finally {
    client.close();
  }
}

main();

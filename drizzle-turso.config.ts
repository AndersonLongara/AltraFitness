import { defineConfig } from "drizzle-kit";

// This config is used to push schema to the remote Turso database.
// It reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from environment variables directly.
// Do NOT load .env.local here.

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    },
});

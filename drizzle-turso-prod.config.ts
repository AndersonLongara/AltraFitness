import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "turso",
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL!.trim().replace(/["'\r\n]/g, ''),
        authToken: process.env.TURSO_AUTH_TOKEN!.trim().replace(/["'\r\n]/g, ''),
    },
});

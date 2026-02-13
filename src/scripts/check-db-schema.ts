
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function checkSchema() {
    const mealItemsInfo = await db.run(sql`PRAGMA table_info(meal_items)`);
    console.log("Meal Items Schema:", mealItemsInfo);

    const foodsInfo = await db.run(sql`PRAGMA table_info(foods)`);
    console.log("Foods Schema:", foodsInfo);

    // Also check nutritional_plans
    const plansInfo = await db.run(sql`PRAGMA table_info(nutritional_plans)`);
    console.log("Nutritional Plans Schema:", plansInfo);
}

checkSchema();


import { db } from "@/db";
import { foods } from "@/db/schema";
import { sql } from "drizzle-orm";

async function checkCategories() {
    const categories = await db.select({
        category: foods.category,
        count: sql<number>`count(*)`
    })
        .from(foods)
        .groupBy(foods.category);

    console.log("Categories found:", categories);
}

checkCategories();

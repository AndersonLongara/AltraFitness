import { db } from "@/db";
import { students } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import NewPlanFlow from "@/components/nutrition/NewPlanFlow";

export default async function NewNutritionPlanPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const studentsList = await db.select({
        id: students.id,
        name: students.name,
        photoUrl: students.photoUrl,
        active: students.active
    })
        .from(students)
        .where(eq(students.trainerId, userId));

    return <NewPlanFlow studentsList={studentsList} />;
}

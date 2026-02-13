import NutritionViewer from "@/components/nutrition/NutritionViewer";
import { db } from "@/db";
import { nutritionalPlans } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentNutritionPage(props: PageProps) {
    const params = await props.params;
    const planId = params.id;

    const plan = await db.query.nutritionalPlans.findFirst({
        where: eq(nutritionalPlans.id, planId),
        with: {
            meals: {
                with: {
                    items: true
                },
                orderBy: (meals, { asc }) => [asc(meals.order)]
            }
        }
    });

    if (!plan) return notFound();

    return <NutritionViewer plan={plan as any} />;
}

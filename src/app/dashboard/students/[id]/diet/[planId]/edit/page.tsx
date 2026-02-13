import SmartMealBuilder from "@/components/trainer/diet/SmartMealBuilder";
import Sidebar from "@/components/layout/Sidebar";
import BackButton from "@/components/ui/BackButton";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getNutritionalPlan } from "@/app/actions/dietUtils";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string; planId: string }>;
}

export default async function EditDietPage({ params }: PageProps) {
    const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    const { id, planId } = await params;

    const student = await db.query.students.findFirst({
        where: eq(students.id, id)
    });

    if (!student) return redirect("/dashboard/students");

    const planData = await getNutritionalPlan(planId);

    if (!planData) {
        return redirect(`/dashboard/students/${id}`);
    }

    // MAP DATA TO MATCH SMARTBUILDER INTERFACE
    // DB: meals -> items -> foodName
    // UI: meals -> items -> name
    const mappedPlan = {
        id: planData.id,
        title: planData.title,
        waterGoalMl: planData.waterGoalMl,
        dailyKcal: planData.dailyKcal,
        proteinG: planData.proteinG,
        carbsG: planData.carbsG,
        fatG: planData.fatG,
        daysOfWeek: planData.daysOfWeek,
        isTemplate: planData.isTemplate,
        meals: planData.meals.map((meal: any) => ({
            id: meal.id,
            name: meal.name,
            time: meal.time,
            items: meal.items.map((item: any) => ({
                id: item.id,
                name: item.foodName,
                foodName: item.foodName,
                portion: item.portion,
                unit: item.unit,
                calories: item.calories,
                protein: item.protein,
                carbs: item.carbs,
                fat: item.fat,
                foodId: item.foodId
            }))
        }))
    };

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />
            <div className="max-w-[1600px] mx-auto p-6 md:p-8">
                <header className="flex items-center gap-4 mb-8">
                    <BackButton />
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                            Editar Dieta
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Atualize o plano nutricional do aluno.
                        </p>
                    </div>
                </header>
                <SmartMealBuilder studentId={student.id} initialPlan={mappedPlan} />
            </div>
        </div>
    );
}

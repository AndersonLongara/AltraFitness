import Sidebar from "@/components/layout/Sidebar";
import WorkoutSheetBuilder from "@/components/workouts/WorkoutSheetBuilder";
import BackButton from "@/components/ui/BackButton";
import { db } from "@/db";
import { students, exercises, workoutPlans } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, or, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditWorkoutPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { userId } = await auth();
    if (!userId) return null;

    const { id } = await params;
    const { from } = await searchParams;

    // Fetch existing plan with workouts and items
    const plan = await db.query.workoutPlans.findFirst({
        where: eq(workoutPlans.id, id),
        with: {
            workouts: {
                with: {
                    items: {
                        with: {
                            exercise: true
                        },
                        orderBy: (items, { asc }) => [asc(items.order)],
                    }
                }
            }
        }
    });

    if (!plan || plan.trainerId !== userId) {
        redirect("/dashboard/workouts");
    }

    const studentsList = await db.select({
        id: students.id,
        name: students.name
    })
        .from(students)
        .where(eq(students.trainerId, userId));

    const exercisesList = await db.select({
        id: exercises.id,
        name: exercises.name,
        muscleGroup: exercises.muscleGroup
    })
        .from(exercises)
        .where(
            or(
                eq(exercises.trainerId, userId),
                isNull(exercises.trainerId)
            )
        );

    const backPath = plan.isTemplate
        ? "/dashboard/workouts/templates"
        : (plan.studentId ? `/dashboard/students/${plan.studentId}` : "/dashboard/workouts");

    const backLink = typeof from === 'string' ? from : backPath;

    // Transform plan for the builder (flat item names)
    const formattedPlan = {
        ...plan,
        workouts: plan.workouts.map(w => ({
            ...w,
            items: w.items.map(i => ({
                ...i,
                name: i.exercise.name
            }))
        }))
    };

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-6">
                <header className="flex items-center gap-4">
                    <BackButton href={backLink} />
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                            {plan.isTemplate ? "Editar Modelo" : "Editar Ficha"}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {plan.isTemplate ? "Atualize as definições do template." : "Atualize a rotina do aluno."}
                        </p>
                    </div>
                </header>

                <div className="bg-white rounded-3xl p-1 md:p-6 shadow-sm">
                    <WorkoutSheetBuilder
                        students={studentsList}
                        exercises={exercisesList as any}
                        trainerId={userId}
                        initialData={formattedPlan as any}
                        returnTo={backLink}
                    />
                </div>
            </main>
        </div>
    );
}

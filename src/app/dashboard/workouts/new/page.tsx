import Sidebar from "@/components/layout/Sidebar";
import WorkoutSheetBuilder from "@/components/workouts/WorkoutSheetBuilder";
import BackButton from "@/components/ui/BackButton";
import { db } from "@/db";
import { students, exercises } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, or, isNull } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function NewWorkoutPage() {
    const { userId } = await auth();
    if (!userId) return null;

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

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-6">
                <header className="flex items-center gap-4 mb-4">
                    <BackButton href="/dashboard/workouts" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                            Cadastro de ficha de treino
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Nova ficha de treino ✎
                        </p>
                    </div>
                </header>

                <div className="bg-white rounded-3xl p-1 md:p-6 shadow-sm">
                    <WorkoutSheetBuilder
                        students={studentsList}
                        exercises={exercisesList as any}
                        trainerId={userId}
                    />
                </div>
            </main>
        </div>
    );
}

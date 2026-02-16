import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import Link from "next/link";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, or, isNull } from "drizzle-orm";
import ExerciseLibraryList from "@/components/workouts/ExerciseLibraryList";
import { getExerciseCategories, getFilterCategories } from "@/lib/exercise-categories";

export const dynamic = 'force-dynamic';

export default async function ExerciseLibraryPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const [dbExercises, filterCategories, muscleGroups] = await Promise.all([
        db.select({
            id: exercises.id,
            trainerId: exercises.trainerId,
            name: exercises.name,
            muscleGroup: exercises.muscleGroup,
            videoUrl: exercises.videoUrl,
            imageUrl: exercises.imageUrl,
            description: exercises.description,
        }).from(exercises).where(
            or(
                eq(exercises.trainerId, userId),
                isNull(exercises.trainerId)
            )
        ),
        getFilterCategories(),
        getExerciseCategories(),
    ]);

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                        <Link href="/dashboard/workouts" className="p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <ArrowLeft size={24} weight="bold" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                                Biblioteca de Exercícios
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                                Gerencie os movimentos e vídeos instrucionais.
                            </p>
                        </div>
                    </div>
                </header>

                <ExerciseLibraryList
                    initialExercises={dbExercises}
                    categories={filterCategories}
                    muscleGroups={muscleGroups}
                />
            </main>
        </div>
    );
}

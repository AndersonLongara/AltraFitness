import { Plus, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, or, isNull } from "drizzle-orm";
import ExerciseLibraryList from "@/components/workouts/ExerciseLibraryList";

export const dynamic = 'force-dynamic';

export default async function ExerciseLibraryPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const dbExercises = await db.select().from(exercises).where(
        or(
            eq(exercises.trainerId, userId),
            isNull(exercises.trainerId)
        )
    );

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                        <Link href="/dashboard/workouts" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                            <ArrowLeft size={24} weight="bold" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                                Biblioteca de Exercícios
                            </h1>
                            <p className="text-slate-500 font-medium mt-2">
                                Gerencie os movimentos e vídeos instrucionais.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/workouts/new"
                        className="px-6 py-4 bg-graphite-dark text-white font-bold rounded-2xl hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-slate-200"
                    >
                        <Plus size={20} weight="bold" />
                        Nova Prescrição
                    </Link>
                </header>

                <ExerciseLibraryList initialExercises={dbExercises as any} />
            </main>
        </div>
    );
}

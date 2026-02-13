import { Plus, Copy, CaretLeft } from "@phosphor-icons/react/dist/ssr";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { db } from "@/db";
import { workoutPlans, students } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";
import TemplateList from "@/components/workouts/TemplateList";
import BackButton from "@/components/ui/BackButton";

export const dynamic = 'force-dynamic';

export default async function WorkoutTemplatesPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const templates = await db.query.workoutPlans.findMany({
        where: and(
            eq(workoutPlans.trainerId, userId),
            eq(workoutPlans.isTemplate, true)
        ),
        with: {
            workouts: {
                columns: {
                    id: true
                }
            }
        },
        orderBy: (plans: any, { desc }: any) => [desc(plans.createdAt)],
    });

    const studentsList = await db.select({
        id: students.id,
        name: students.name,
    }).from(students).where(eq(students.trainerId, userId)).orderBy(students.name);

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton href="/dashboard/workouts" />
                        <div>
                            <h1 className="text-3xl font-extrabold text-graphite-dark tracking-tight">
                                Modelos de Treino
                            </h1>
                            <p className="text-slate-500 font-medium mt-1">
                                Crie templates para agilizar suas prescrições.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/dashboard/workouts/new"
                        className="px-6 py-4 bg-amber-400 text-graphite-dark font-bold rounded-2xl hover:brightness-110 transition-colors flex items-center gap-2 shadow-lg shadow-amber-100"
                    >
                        <Plus size={20} weight="bold" />
                        Novo Modelo
                    </Link>
                </header>

                <TemplateList templates={templates as any} students={studentsList} />
            </main>
        </div>
    );
}

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students, workoutPlans, workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import WorkoutList from "@/components/student/workout/WorkoutList";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default async function StudentWorkoutsPage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return redirect("/sign-in");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email),
    });

    if (!student) return redirect("/");

    // Fetch Active Workout Plan
    const activePlan = await db.query.workoutPlans.findFirst({
        where: and(
            eq(workoutPlans.studentId, student.id),
            eq(workoutPlans.active, true)
        ),
        with: {
            workouts: {
                with: {
                    items: true
                }
            }
        }
    });

    const activeWorkouts = activePlan?.workouts.map(w => ({
        id: w.id,
        title: w.title,
        exerciseCount: w.items.length,
        // TODO: lastCompleted logic needs to check logs, defaulting to null for now
        lastCompleted: null,
    })) || [];

    return (
        <main className="p-6 pb-24 font-primary">
            <header className="flex items-center gap-4 mb-8">
                <Link href="/student" className="w-10 h-10 bg-surface-grey border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeft size={20} weight="bold" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Meus Treinos</h1>
                    <p className="text-sm font-medium text-zinc-500">
                        {activePlan ? activePlan.name : "Nenhum plano ativo"}
                    </p>
                </div>
            </header>

            <WorkoutList workouts={activeWorkouts} />
        </main>
    );
}

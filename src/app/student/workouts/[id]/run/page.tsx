import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workouts, workoutLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import WorkoutRunner from "@/components/student/workout/WorkoutRunner";

export default async function WorkoutRunnerPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ logId: string }> }) {
    const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    const { id } = await params;
    const { logId } = await searchParams;

    if (!logId) {
        return redirect(`/student/workouts/${id}`);
    }

    const workout = await db.query.workouts.findFirst({
        where: eq(workouts.id, id),
        with: {
            items: {
                with: {
                    exercise: true
                },
                orderBy: (items, { asc }) => [asc(items.order)]
            }
        }
    });

    if (!workout) return redirect("/student/workouts");

    // Fetch existing log data for rehydration
    const existingLog = await db.query.workoutLogs.findFirst({
        where: eq(workoutLogs.id, logId),
        with: {
            sets: true
        }
    });

    return (
        <WorkoutRunner
            logId={logId}
            workout={workout}
            initialLogSets={existingLog?.sets || []}
        />
    );
}

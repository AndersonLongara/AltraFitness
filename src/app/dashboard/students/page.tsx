import LayoutSidebar from "@/components/layout/LayoutSidebar";
import { db } from "@/db";
import { students, plans } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import StudentsPageContent from "@/components/students/StudentsPageContent";

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const [studentsList, plansList] = await Promise.all([
        db.query.students.findMany({
            where: eq(students.trainerId, userId),
            with: {
                plan: true,
                moodLogs: {
                    orderBy: (moodLogs: any, { desc }: any) => [desc(moodLogs.createdAt)],
                    limit: 1,
                },
                workoutLogs: {
                    where: (workoutLogs: any, { eq }: any) => eq(workoutLogs.status, 'completed'),
                    orderBy: (workoutLogs: any, { desc }: any) => [desc(workoutLogs.endedAt)],
                    limit: 1,
                }
            },
            orderBy: (students: any, { desc }: any) => [desc(students.createdAt)],
        }),
        db.query.plans.findMany({
            where: eq(plans.trainerId, userId),
        }),
    ]);

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <StudentsPageContent
                    studentsList={studentsList as any}
                    plansList={plansList as any}
                />
            </main>
        </div>
    );
}

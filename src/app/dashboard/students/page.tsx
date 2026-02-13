import Sidebar from "@/components/layout/Sidebar";
import { db } from "@/db";
import { students } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import StudentsPageContent from "@/components/students/StudentsPageContent";

export default async function StudentsPage() {
    const { userId } = await auth();
    if (!userId) return null;

    const studentsList = await db.query.students.findMany({
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
    });

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <StudentsPageContent
                    studentsList={studentsList as any}
                />
            </main>
        </div>
    );
}

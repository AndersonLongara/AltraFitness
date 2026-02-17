import LayoutSidebar from "@/components/layout/LayoutSidebar";
import { db } from "@/db";
import { students, plans, studentForms } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, inArray } from "drizzle-orm";
import StudentsPageContent from "@/components/students/StudentsPageContent";

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
    const { userId } = await auth();
    if (!userId) return null;

    // First, get the list of students for this trainer
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

    // Get the student IDs for filtering forms
    const studentIds = studentsList.map(s => s.id);

    // Then get plans and student forms in parallel
    const [plansList, allStudentForms] = await Promise.all([
        db.query.plans.findMany({
            where: eq(plans.trainerId, userId),
        }),
        studentIds.length > 0
            ? db.query.studentForms.findMany({
                where: (studentForms: any, { inArray }: any) => inArray(studentForms.studentId, studentIds),
            })
            : Promise.resolve([]),
    ]);

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <StudentsPageContent
                    studentsList={studentsList as any}
                    plansList={plansList as any}
                    studentForms={allStudentForms as any}
                />
            </main>
        </div>
    );
}

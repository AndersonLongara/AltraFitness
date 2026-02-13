import Sidebar from "@/components/layout/Sidebar";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { db } from "@/db";
import { students, workoutPlans, nutritionalPlans, plans, workoutLogs, forms, studentForms } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import StudentProfileTabs from "@/components/students/StudentProfileTabs";
import { getStudentAssessments } from "@/app/actions/assessments";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentProfilePage({ params }: PageProps) {
    const { userId } = await auth();
    if (!userId) return null;

    const { id } = await params;

    const studentData = await db.query.students.findFirst({
        where: and(eq(students.id, id), eq(students.trainerId, userId)),
        with: {
            plan: true,
        },
    });

    if (!studentData) {
        notFound();
    }

    const studentPlans = await db.query.workoutPlans.findMany({
        where: and(
            eq(workoutPlans.studentId, id),
            eq(workoutPlans.isTemplate, false)
        ),
        orderBy: (plans: any, { desc }: any) => [desc(plans.createdAt)],
    });

    const studentDiets = await db.query.nutritionalPlans.findMany({
        where: eq(nutritionalPlans.studentId, id),
        orderBy: (plans: any, { desc }: any) => [desc(plans.createdAt)],
    });

    const availablePlans = await db.query.plans.findMany({
        where: eq(plans.trainerId, userId),
    });

    // Fetch Assessments (formatted)
    const studentAssessments = await getStudentAssessments(id);

    // Fetch Last Workout Log
    const lastWorkoutLog = await db.query.workoutLogs.findFirst({
        where: eq(workoutLogs.studentId, id),
        orderBy: [desc(workoutLogs.endedAt)],
        with: {
            workout: true
        }
    });

    // Fetch Forms & Assignments
    const createdForms = await db.query.forms.findMany({
        where: and(eq(forms.trainerId, userId), eq(forms.isActive, true)),
        orderBy: [desc(forms.createdAt)],
    });

    const studentAssignments = await db.query.studentForms.findMany({
        where: eq(studentForms.studentId, id),
        orderBy: [desc(studentForms.assignedAt)],
        with: {
            form: true
        }
    });

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
                {/* Header / Nav */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard/students" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={24} weight="bold" />
                    </Link>
                    <h1 className="text-2xl font-bold text-graphite-dark">Perfil do Aluno</h1>
                </div>

                <StudentProfileTabs
                    student={studentData}
                    plans={studentPlans}
                    diets={studentDiets}
                    availablePlans={availablePlans}
                    assessments={studentAssessments}
                    lastWorkout={lastWorkoutLog}
                    forms={createdForms}
                    assignedForms={studentAssignments}
                />
            </main>
        </div>
    );
}

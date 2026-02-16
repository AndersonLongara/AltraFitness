import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import AssessmentForm from "@/components/assessments/AssessmentForm";
import BackButton from "@/components/ui/BackButton";

export const dynamic = "force-dynamic";

export default async function NewAssessmentPage(props: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    if (!userId) return notFound();
    const params = await props.params;
    const { id } = params;

    const student = await db.query.students.findFirst({
        where: and(eq(students.id, id), eq(students.trainerId, userId)),
        columns: {
            id: true,
            name: true,
        },
    });

    if (!student) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />
            <main className="max-w-5xl mx-auto p-6 md:p-8">
                <div className="space-y-8 animate-fade-in pb-24">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/dashboard/students/${id}/assessments`} />
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                Nova Avaliação
                            </h1>
                            <p className="text-slate-500 font-medium">Aluno: {student.name}</p>
                        </div>
                    </div>
                    <AssessmentForm
                        studentId={student.id}
                        studentName={student.name}
                        studentGender="male"
                    />
                </div>
            </main>
        </div>
    );
}

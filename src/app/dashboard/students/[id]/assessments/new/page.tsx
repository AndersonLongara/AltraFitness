import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import AssessmentForm from "@/components/assessments/AssessmentForm";
import BackButton from "@/components/ui/BackButton";

export default async function NewAssessmentPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;

    const student = await db.query.students.findFirst({
        where: eq(students.id, id),
        columns: {
            id: true,
            name: true,
            // Gender is not in DB yet, so we don't fetch it. 
            // The form will default to 'male' and allow changing.
        }
    });

    if (!student) {
        return notFound();
    }

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <BackButton />
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Nova Avaliação</h1>
                    <p className="text-slate-500 font-medium">Aluno: {student.name}</p>
                </div>
            </div>

            {/* Form */}
            <AssessmentForm
                studentId={student.id}
                studentName={student.name}
                studentGender="male" // Default, user can change in form
            />
        </div>
    );
}

import SmartMealBuilder from "@/components/trainer/diet/SmartMealBuilder";
import { db } from "@/db";

export const dynamic = 'force-dynamic';

export default async function TestBuilderPage() {
    // Mock student ID for testing
    const student = await db.query.students.findFirst();
    const studentId = student?.id || "mock-student-id";

    return (
        <div className="h-screen bg-ice-white">
            <SmartMealBuilder studentId={studentId} />
        </div>
    );
}

import SmartMealBuilder from "@/components/trainer/diet/SmartMealBuilder";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import BackButton from "@/components/ui/BackButton";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function NewDietPage({ params }: PageProps) {
    const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    const { id } = await params;

    const student = await db.query.students.findFirst({
        where: and(eq(students.id, id), eq(students.trainerId, userId)),
    });

    if (!student) return redirect("/dashboard/students");

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />
            <main className="max-w-[1600px] mx-auto p-6 md:p-8">
                <div className="mb-6">
                    <BackButton href={`/dashboard/students/${id}`} />
                </div>
                <SmartMealBuilder studentId={student.id} />
            </main>
        </div>
    );
}

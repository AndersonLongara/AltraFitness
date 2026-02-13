
import SmartMealBuilder from "@/components/trainer/diet/SmartMealBuilder";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function NewDietPage({ params }: PageProps) {
    const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    const { id } = await params;

    const student = await db.query.students.findFirst({
        where: eq(students.id, id)
    });

    if (!student) return redirect("/dashboard/students");

    return (
        <SmartMealBuilder studentId={student.id} />
    );
}

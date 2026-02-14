"use server";

import { db } from "@/db";
import { students, payments, workouts, nutritionalPlans, studentBadges, plans } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentTrainer } from "@/lib/auth-helpers";

export async function getStudents() {
    const trainer = await getCurrentTrainer();

    return await db.query.students.findMany({
        where: eq(students.trainerId, trainer.id),
        with: {
            plan: true,
        },
        orderBy: (students: any, { desc }: any) => [desc(students.createdAt)],
    });
}

export async function getStudentById(id: string) {
    const trainer = await getCurrentTrainer();

    return await db.query.students.findFirst({
        where: and(eq(students.id, id), eq(students.trainerId, trainer.id)),
        with: {
            plan: true,
        },
    });
}

export async function createStudent(data: {
    name: string;
    email?: string;
    cpf?: string;
    phone?: string;
    planId?: string;
    planEnd?: Date;
    birthDate?: Date;
    gender?: 'male' | 'female';
    height?: number; // cm
    weight?: number; // grams
}) {
    const trainer = await getCurrentTrainer();

    // Check for duplicate CPF
    if (data.cpf) {
        const existing = await db.query.students.findFirst({
            where: and(eq(students.trainerId, trainer.id), eq(students.cpf, data.cpf))
        });
        if (existing) throw new Error("Já existe um aluno cadastrado com este CPF.");
    }

    const [newStudent] = await db.insert(students).values({
        trainerId: trainer.id,
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        planId: data.planId,
        planEnd: data.planEnd,
        birthDate: data.birthDate,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
    }).returning();

    revalidatePath("/dashboard/students");
    return newStudent;
}

export async function updateStudent(id: string, data: Partial<{
    name: string;
    email: string;
    cpf: string;
    phone: string;
    status: string;
    planId: string;
    planEnd: Date;
    active: boolean;
    birthDate: Date;
    gender: 'male' | 'female';
    height: number;
    weight: number;
}>) {
    const trainer = await getCurrentTrainer();

    // Check for duplicate CPF if being updated
    if (data.cpf) {
        const existing = await db.query.students.findFirst({
            where: and(
                eq(students.trainerId, trainer.id),
                eq(students.cpf, data.cpf),
                sql`${students.id} != ${id}`
            )
        });
        if (existing) throw new Error("Este CPF já está sendo usado por outro aluno.");
    }

    await db.update(students)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(and(eq(students.id, id), eq(students.trainerId, trainer.id)));

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${id}`);
}

export async function deleteStudent(id: string) {
    const trainer = await getCurrentTrainer();

    // Start by deleting related records
    await db.delete(studentBadges).where(eq(studentBadges.studentId, id));
    await db.delete(payments).where(eq(payments.studentId, id));
    await db.delete(workouts).where(eq(workouts.studentId, id));
    await db.delete(nutritionalPlans).where(eq(nutritionalPlans.studentId, id));

    await db.delete(students)
        .where(and(eq(students.id, id), eq(students.trainerId, trainer.id)));

    revalidatePath("/dashboard/students");
}

export async function acceptInvite(token: string, phone: string) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) throw new Error("Você precisa estar logado para aceitar o convite.");

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("Seu usuário não possui um e-mail válido.");

    const student = await db.query.students.findFirst({
        where: eq(students.inviteToken, token)
    });

    if (!student) throw new Error("Convite inválido ou expirado.");

    await db.update(students)
        .set({
            phone,
            email, // Sync email from Clerk
            active: true,
            updatedAt: new Date()
        })
        .where(eq(students.id, student.id));

    return { success: true };
}

export async function updateStudentPlan(studentId: string, planId: string, startDate: string) {
    const trainer = await getCurrentTrainer();

    // Fetch Plan details
    const plan = await db.query.plans.findFirst({
        where: eq(plans.id, planId),
    });

    if (!plan) throw new Error("Plano não encontrado.");

    // Calculate End Date
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Update Student
    await db.update(students)
        .set({
            planId: planId,
            planEnd: endDate,
            updatedAt: new Date(),
        })
        .where(and(eq(students.id, studentId), eq(students.trainerId, trainer.id)));

    // Create Initial Payment Record (Pending) for the new plan
    await db.insert(payments).values({
        trainerId: trainer.id,
        studentId: studentId,
        planId: planId,
        amount: plan.price,
        dueDate: new Date(startDate),
        status: 'pending',
        notes: `Atualização de Plano para ${plan.name}`
    });

    revalidatePath("/dashboard/students");
    revalidatePath(`/dashboard/students/${studentId}`);
    revalidatePath("/dashboard/financial");
}

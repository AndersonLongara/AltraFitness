"use server";

import { db, client } from "@/db";
import { students, payments, workouts, nutritionalPlans, studentBadges, plans, leads } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentTrainer } from "@/lib/auth-helpers";
import { auth, currentUser } from "@clerk/nextjs/server";

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
    startDate?: string;
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

    // If a planId is provided, calculate planEnd from the plan's durationMonths
    let calculatedPlanEnd = data.planEnd;
    let plan: any = null;
    if (data.planId) {
        plan = await db.query.plans.findFirst({
            where: eq(plans.id, data.planId),
        });
        if (plan && !calculatedPlanEnd) {
            const startDate = data.startDate ? new Date(data.startDate) : new Date();
            calculatedPlanEnd = new Date(startDate);
            calculatedPlanEnd.setMonth(calculatedPlanEnd.getMonth() + plan.durationMonths);
        }
    }

    const [newStudent] = await db.insert(students).values({
        trainerId: trainer.id,
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        planId: data.planId,
        planEnd: calculatedPlanEnd,
        birthDate: data.birthDate,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        active: true,
    }).returning();

    // Create initial payment if plan was selected
    if (data.planId && plan) {
        await db.insert(payments).values({
            trainerId: trainer.id,
            studentId: newStudent.id,
            planId: data.planId,
            amount: plan.price,
            dueDate: data.startDate ? new Date(data.startDate) : new Date(),
            status: 'pending',
            notes: `Mensalidade inicial - ${plan.name}`,
        });
    }

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

    // Clear studentId on any lead that was linked to this student
    // so the lead can be moved freely in the pipeline again
    await db.update(leads)
        .set({ studentId: null })
        .where(and(eq(leads.studentId, id), eq(leads.trainerId, trainer.id)));

    revalidatePath("/dashboard/students");
    revalidatePath("/dashboard/sales");
}

export async function acceptInvite(token: string, data: {
    name: string;
    email: string;
    instagram: string | null;
    phone: string;
    cpf: string;
    birthDate: number; // timestamp
    photoUrl: string | null;
}) {
    try {
        console.log('[acceptInvite] Starting with data:', { token, ...data, photoUrl: data.photoUrl ? 'present' : 'null' });
        console.log('[acceptInvite] DB URL:', process.env.TURSO_DATABASE_URL);

        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            console.error('[acceptInvite] No user found');
            throw new Error("Você precisa estar logado para aceitar o convite.");
        }

        // Ensure instagram column exists (self-healing migration)
        try {
            const tableInfo = await client.execute('PRAGMA table_info(students)');
            const columns = tableInfo.rows.map((row: any) => row.name);
            console.log('[acceptInvite] DB columns:', columns);
            if (!columns.includes('instagram')) {
                console.log('[acceptInvite] Adding missing instagram column...');
                await client.execute('ALTER TABLE students ADD COLUMN instagram TEXT');
                console.log('[acceptInvite] instagram column added successfully');
            }
        } catch (migrationErr) {
            console.error('[acceptInvite] Migration check error:', migrationErr);
        }

        const student = await db.query.students.findFirst({
            where: eq(students.inviteToken, token)
        });

        if (!student) {
            console.error('[acceptInvite] Student not found for token:', token);
            throw new Error("Convite inválido ou expirado.");
        }

        console.log('[acceptInvite] Updating student:', student.id);

        // Sanitize photoUrl - if too large, discard it
        let finalPhotoUrl = data.photoUrl;
        if (finalPhotoUrl && finalPhotoUrl.length > 5 * 1024 * 1024) {
            console.warn('[acceptInvite] PhotoUrl too large, discarding');
            finalPhotoUrl = null;
        }

        const updateData = {
            name: data.name?.trim() || '',
            email: data.email?.trim() || '',
            instagram: data.instagram?.trim() || null,
            phone: data.phone || '',
            cpf: data.cpf || '',
            birthDate: new Date(data.birthDate),
            photoUrl: finalPhotoUrl,
            active: true,
            inviteToken: null,
            updatedAt: new Date()
        };

        console.log('[acceptInvite] Update data:', { 
            ...updateData, 
            photoUrlLength: updateData.photoUrl?.length || 0,
            photoUrl: updateData.photoUrl ? 'present' : 'null'
        });

        await db.update(students)
            .set(updateData)
            .where(eq(students.id, student.id));

        console.log('[acceptInvite] Success');
        return { success: true };
    } catch (error) {
        console.error('[acceptInvite] Error:', error);
        throw error;
    }
}

export async function createStudentWithInvite(data: {
    name: string;
    planId: string;
    startDate: string;
    email?: string;
    phone?: string;
}) {
    const trainer = await getCurrentTrainer();

    const plan = await db.query.plans.findFirst({
        where: eq(plans.id, data.planId),
    });
    if (!plan) throw new Error("Plano não encontrado.");

    const endDate = new Date(data.startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const inviteToken = crypto.randomUUID();

    const [newStudent] = await db.insert(students).values({
        trainerId: trainer.id,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        planId: data.planId,
        planEnd: endDate,
        inviteToken,
        active: false,
        accessTypes: ['workout', 'nutrition'],
    }).returning();

    // Create initial pending payment
    await db.insert(payments).values({
        trainerId: trainer.id,
        studentId: newStudent.id,
        planId: data.planId,
        amount: plan.price,
        dueDate: new Date(data.startDate),
        status: 'pending',
        notes: `Mensalidade inicial - ${plan.name}`,
    });

    revalidatePath("/dashboard/students");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://altra-fitness-hub.vercel.app';
    const inviteLink = `${baseUrl}/join/${inviteToken}`;

    return { student: newStudent, inviteLink, inviteToken };
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

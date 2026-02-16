"use server";

import { db } from "@/db";
import { plans } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentTrainer } from "@/lib/auth-helpers";

export async function createPlan(data: { name: string; price: number; durationMonths: number }) {
    const trainer = await getCurrentTrainer();

    await db.insert(plans).values({
        trainerId: trainer.id,
        name: data.name,
        price: data.price,
        durationMonths: data.durationMonths,
    });

    revalidatePath("/dashboard/financial");
}

export async function togglePlanStatus(planId: string, isActive: boolean) {
    const trainer = await getCurrentTrainer();
    await db.update(plans)
        .set({ active: isActive })
        .where(and(eq(plans.id, planId), eq(plans.trainerId, trainer.id)));
    revalidatePath("/dashboard/financial");
}

export async function deletePlan(planId: string) {
    const trainer = await getCurrentTrainer();
    await db.delete(plans).where(and(eq(plans.id, planId), eq(plans.trainerId, trainer.id)));
    revalidatePath("/dashboard/financial");
}

// --- Payments ---

import { payments, students } from "@/db/schema";
import { desc } from "drizzle-orm";

const MAX_AMOUNT_CENTS = 99999999; // R$ 999.999,99

export async function createPayment(data: {
    studentId: string;
    amount: number;
    dueDate: Date;
    planId?: string;
    notes?: string;
    sendViaAsaas?: boolean;
    billingType?: string;
}): Promise<{ invoiceUrl?: string } | void> {
    const trainer = await getCurrentTrainer();
    if (!data.amount || data.amount <= 0 || data.amount > MAX_AMOUNT_CENTS) {
        throw new Error("Valor inválido. Informe um valor entre R$ 0,01 e R$ 999.999,99.");
    }
    const [student] = await db.select().from(students).where(and(eq(students.id, data.studentId), eq(students.trainerId, trainer.id)));
    if (!student) throw new Error("Aluno não encontrado ou não pertence ao seu estúdio.");

    await db.insert(payments).values({
        trainerId: trainer.id,
        studentId: data.studentId,
        amount: data.amount,
        dueDate: data.dueDate,
        planId: data.planId,
        notes: data.notes,
        status: "pending",
    });

    revalidatePath("/dashboard/financial");
    return {};
}

export async function markAsPaid(paymentId: string) {
    const trainer = await getCurrentTrainer();
    await db.update(payments)
        .set({ status: 'paid', paidAt: new Date() })
        .where(and(eq(payments.id, paymentId), eq(payments.trainerId, trainer.id)));
    revalidatePath("/dashboard/financial");
}

/** Registra um pagamento recebido (fora da plataforma: PIX, dinheiro, etc.). Opcionalmente vincula a um plano e define o plano do aluno. */
export async function createPaymentReceived(data: {
    studentId: string;
    amount: number;
    paidAt?: Date;
    planId?: string;
}) {
    const trainer = await getCurrentTrainer();
    const paidAt = data.paidAt ?? new Date();

    const [student] = await db.select().from(students).where(and(eq(students.id, data.studentId), eq(students.trainerId, trainer.id)));
    if (!student) throw new Error("Aluno não encontrado ou não pertence ao seu estúdio.");

    let planIdToUse: string | null = data.planId ?? null;
    let planEnd: Date | null = null;

    if (data.planId) {
        const [plan] = await db.select().from(plans).where(and(eq(plans.id, data.planId), eq(plans.trainerId, trainer.id)));
        if (!plan) throw new Error("Plano não encontrado.");
        planIdToUse = plan.id;
        planEnd = new Date(paidAt);
        planEnd.setMonth(planEnd.getMonth() + plan.durationMonths);
    }

    await db.insert(payments).values({
        trainerId: trainer.id,
        studentId: data.studentId,
        amount: data.amount,
        dueDate: paidAt,
        paidAt,
        status: "paid",
        planId: planIdToUse,
    });

    if (planIdToUse && planEnd) {
        await db.update(students)
            .set({ planId: planIdToUse, planEnd })
            .where(eq(students.id, data.studentId));
    }

    revalidatePath("/dashboard/financial");
}

export async function deletePayment(paymentId: string) {
    const trainer = await getCurrentTrainer();
    await db.delete(payments).where(and(eq(payments.id, paymentId), eq(payments.trainerId, trainer.id)));
    revalidatePath("/dashboard/financial");
}

// --- Subscriptions ---

export async function assignPlanToStudent(data: { studentId: string; planId: string }) {
    const trainer = await getCurrentTrainer();
    const [plan] = await db.select().from(plans).where(and(eq(plans.id, data.planId), eq(plans.trainerId, trainer.id)));
    if (!plan) throw new Error("Plano não encontrado.");
    const [student] = await db.select().from(students).where(and(eq(students.id, data.studentId), eq(students.trainerId, trainer.id)));
    if (!student) throw new Error("Aluno não encontrado.");

    const now = new Date();
    const planEnd = new Date(now);
    planEnd.setMonth(planEnd.getMonth() + plan.durationMonths);

    await db.update(students)
        .set({
            planId: data.planId,
            planEnd: planEnd,
        })
        .where(eq(students.id, data.studentId));

    revalidatePath("/dashboard/financial");
}

export async function renewSubscription(studentId: string) {
    const trainer = await getCurrentTrainer();
    const [student] = await db.select().from(students).where(and(eq(students.id, studentId), eq(students.trainerId, trainer.id)));
    if (!student || !student.planId) throw new Error("Aluno sem plano ativo.");
    const [plan] = await db.select().from(plans).where(and(eq(plans.id, student.planId), eq(plans.trainerId, trainer.id)));
    if (!plan) throw new Error("Plano não encontrado.");

    // Extend from current end date or now, whichever is later
    const baseDate = student.planEnd && new Date(student.planEnd) > new Date()
        ? new Date(student.planEnd)
        : new Date();

    const newPlanEnd = new Date(baseDate);
    newPlanEnd.setMonth(newPlanEnd.getMonth() + plan.durationMonths);

    await db.update(students)
        .set({ planEnd: newPlanEnd })
        .where(eq(students.id, studentId));

    revalidatePath("/dashboard/financial");
}

export async function cancelSubscription(studentId: string) {
    const trainer = await getCurrentTrainer();
    await db.update(students)
        .set({ planId: null, planEnd: null })
        .where(and(eq(students.id, studentId), eq(students.trainerId, trainer.id)));
    revalidatePath("/dashboard/financial");
}

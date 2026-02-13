"use server";

import { db } from "@/db";
import { plans } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPlan(data: { name: string; price: number; durationMonths: number }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.insert(plans).values({
        trainerId: userId,
        name: data.name,
        price: data.price,
        durationMonths: data.durationMonths,
    });

    revalidatePath("/dashboard/financial");
}

export async function togglePlanStatus(planId: string, isActive: boolean) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(plans)
        .set({ active: isActive })
        .where(eq(plans.id, planId));

    revalidatePath("/dashboard/financial");
}

export async function deletePlan(planId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.delete(plans).where(eq(plans.id, planId));
    revalidatePath("/dashboard/financial");
}

// --- Payments ---

import { payments } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function createPayment(data: {
    studentId: string;
    amount: number;
    dueDate: Date;
    planId?: string;
    notes?: string;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.insert(payments).values({
        trainerId: userId,
        studentId: data.studentId,
        amount: data.amount,
        dueDate: data.dueDate,
        planId: data.planId,
        notes: data.notes,
        status: 'pending'
    });

    revalidatePath("/dashboard/financial");
}

export async function markAsPaid(paymentId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(payments)
        .set({
            status: 'paid',
            paidAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

    revalidatePath("/dashboard/financial");
}

export async function deletePayment(paymentId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.delete(payments).where(eq(payments.id, paymentId));
    revalidatePath("/dashboard/financial");
}

// --- Subscriptions ---

import { students } from "@/db/schema";

export async function assignPlanToStudent(data: { studentId: string; planId: string }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get plan details to calculate end date
    const [plan] = await db.select().from(plans).where(eq(plans.id, data.planId));
    if (!plan) throw new Error("Plan not found");

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
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get current student and plan
    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (!student || !student.planId) throw new Error("Student has no active plan");

    const [plan] = await db.select().from(plans).where(eq(plans.id, student.planId));
    if (!plan) throw new Error("Plan not found");

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
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.update(students)
        .set({
            planId: null,
            planEnd: null,
        })
        .where(eq(students.id, studentId));

    revalidatePath("/dashboard/financial");
}

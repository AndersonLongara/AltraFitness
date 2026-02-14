"use server";

import { db } from "@/db";
import { trainers, students, payments, plans } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { getCurrentTrainer } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

// ─── Types ──────────────────────────────────────────────────────────
export interface TrainerProfile {
    id: string;
    name: string;
    email: string;
    imageUrl: string;
    cpf?: string | null;
    phone?: string | null;
    birthDate?: Date | null;
    presentialStudents: number;
    onlineStudents: number;
    subscriptionPlan: string;
    subscriptionStatus: string;
    trialEndsAt?: Date | null;
    teamCode?: string | null;
    createdAt: Date | null;
}

export interface SubscriptionInfo {
    plan: "free_5" | "free_trial" | "monthly" | "annual";
    status: string;
    displayName: string;
    price: string;
    features: string[];
    trialEndsAt?: Date | null;
    limits: {
        maxStudents: number | null; // null = unlimited
        hasAI: boolean;
        hasPriority: boolean;
    };
}

export interface UsageStats {
    totalStudents: number;
    activeStudents: number;
    totalPlans: number;
    totalPayments: number;
    revenueThisMonth: number;
    memberSince: Date | null;
}

// ─── Plan Definitions ───────────────────────────────────────────────
const PLAN_DETAILS: Record<string, Omit<SubscriptionInfo, "plan" | "status" | "trialEndsAt">> = {
    free_5: {
        displayName: "Free Starter",
        price: "R$ 0/mês",
        features: [
            "Até 5 alunos",
            "Dashboard Básico",
            "Gestão de treinos",
            "Gestão de nutrição",
        ],
        limits: { maxStudents: 5, hasAI: false, hasPriority: false },
    },
    free_trial: {
        displayName: "Free Trial Pro",
        price: "R$ 0 (30 dias)",
        features: [
            "Alunos Ilimitados",
            "IA Manager Completo",
            "Criação de treinos com IA",
            "Todos recursos desbloqueados",
            "Válido por 30 dias",
        ],
        limits: { maxStudents: null, hasAI: true, hasPriority: false },
    },
    free: {
        displayName: "Free (Legado)",
        price: "R$ 0/mês",
        features: [
            "Até 5 alunos",
            "Dashboard Básico",
            "Gestão de treinos",
            "Gestão de nutrição",
        ],
        limits: { maxStudents: 5, hasAI: false, hasPriority: false },
    },
    monthly: {
        displayName: "Mensal",
        price: "R$ 109,90/mês",
        features: [
            "Alunos Ilimitados",
            "IA Manager Completo",
            "Criação de treinos com IA",
            "Relatórios avançados",
            "Suporte padrão",
        ],
        limits: { maxStudents: null, hasAI: true, hasPriority: false },
    },
    annual: {
        displayName: "Anual",
        price: "R$ 959,90/ano",
        features: [
            "Todos recursos do Mensal",
            "Prioridade no Suporte",
            "Badge Pro Trainer",
            "Economia de 27%",
        ],
        limits: { maxStudents: null, hasAI: true, hasPriority: true },
    },
};

// ─── Fetch Trainer Profile ──────────────────────────────────────────
export async function getTrainerSettings(): Promise<TrainerProfile> {
    const trainer = await getCurrentTrainer();
    const user = await currentUser();

    const trainerRecord = await db.query.trainers.findFirst({
        where: eq(trainers.id, trainer.id),
    });

    // Auto-generate teamCode for existing trainers who don't have one
    let teamCode = trainerRecord?.teamCode || null;
    if (!teamCode) {
        teamCode = await generateTeamCodeForTrainer(trainer.id);
    }

    return {
        id: trainer.id,
        name: trainer.name,
        email: trainer.email,
        imageUrl: user?.imageUrl || "",
        cpf: trainerRecord?.cpf || null,
        phone: trainerRecord?.phone || null,
        birthDate: trainerRecord?.birthDate || null,
        presentialStudents: trainerRecord?.presentialStudents || 0,
        onlineStudents: trainerRecord?.onlineStudents || 0,
        subscriptionPlan: trainerRecord?.subscriptionPlan || "free_5",
        subscriptionStatus: trainerRecord?.subscriptionStatus || "active",
        trialEndsAt: trainerRecord?.trialEndsAt || null,
        teamCode,
        createdAt: trainerRecord?.createdAt || null,
    };
}

/**
 * Generate a unique team code and save it for an existing trainer
 */
async function generateTeamCodeForTrainer(trainerId: string): Promise<string> {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let attempt = 0; attempt < 5; attempt++) {
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        // Check uniqueness
        const existing = await db.query.trainers.findFirst({
            where: eq(trainers.teamCode, code),
            columns: { id: true },
        });
        if (!existing) {
            await db.update(trainers)
                .set({ teamCode: code })
                .where(eq(trainers.id, trainerId));
            return code;
        }
    }
    throw new Error("Failed to generate unique team code");
}

// ─── Fetch Subscription Details ─────────────────────────────────────
export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const trainer = await getCurrentTrainer();

    const trainerRecord = await db.query.trainers.findFirst({
        where: eq(trainers.id, trainer.id),
    });

    const plan = (trainerRecord?.subscriptionPlan || "free_5") as "free_5" | "free_trial" | "monthly" | "annual";
    const status = trainerRecord?.subscriptionStatus || "active";
    const details = PLAN_DETAILS[plan] || PLAN_DETAILS.free_5;

    return {
        plan,
        status,
        trialEndsAt: trainerRecord?.trialEndsAt || null,
        ...details,
    };
}

// ─── Fetch Usage Statistics ─────────────────────────────────────────
export async function getUsageStats(): Promise<UsageStats> {
    const trainer = await getCurrentTrainer();

    // Total students
    const totalStudents = await db.$count(
        students,
        eq(students.trainerId, trainer.id)
    );

    // Active students
    const activeStudents = await db.$count(
        students,
        and(eq(students.trainerId, trainer.id), eq(students.active, true))
    );

    // Total plans created
    const totalPlans = await db.$count(
        plans,
        eq(plans.trainerId, trainer.id)
    );

    // Total payments
    const totalPayments = await db.$count(
        payments,
        eq(payments.trainerId, trainer.id)
    );

    // Revenue this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const revenueResult = await db
        .select({ total: sql<number>`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(
            and(
                eq(payments.trainerId, trainer.id),
                eq(payments.status, "paid"),
            )
        );

    const revenueThisMonth = revenueResult[0]?.total || 0;

    // Member since
    const trainerRecord = await db.query.trainers.findFirst({
        where: eq(trainers.id, trainer.id),
        columns: { createdAt: true },
    });

    return {
        totalStudents,
        activeStudents,
        totalPlans,
        totalPayments,
        revenueThisMonth,
        memberSince: trainerRecord?.createdAt || null,
    };
}

// ─── Update Trainer Profile ─────────────────────────────────────────
export async function updateTrainerProfile(data: { name: string }) {
    const trainer = await getCurrentTrainer();

    // Update DB
    await db
        .update(trainers)
        .set({
            name: data.name,
            updatedAt: new Date(),
        })
        .where(eq(trainers.id, trainer.id));

    // Update Clerk
    const client = await clerkClient();
    const nameParts = data.name.split(" ");
    await client.users.updateUser(trainer.id, {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(" ") || undefined,
    });

    revalidatePath("/dashboard/settings");
    return { success: true };
}

// ─── Change Plan ────────────────────────────────────────────────────
export async function changeSubscriptionPlan(newPlan: "free_5" | "free_trial" | "monthly" | "annual") {
    const trainer = await getCurrentTrainer();

    const trialEndsAt = newPlan === "free_trial"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null;

    const subscriptionStatus = newPlan === "free_trial" ? "trial" : "active";

    await db
        .update(trainers)
        .set({
            subscriptionPlan: newPlan,
            subscriptionStatus,
            trialEndsAt,
            updatedAt: new Date(),
        })
        .where(eq(trainers.id, trainer.id));

    revalidatePath("/dashboard/settings");
    return { success: true, plan: newPlan };
}

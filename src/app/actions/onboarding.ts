"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trainers, plans, students, platformPlans } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { isCpfUsedByAnotherTrainer } from "@/lib/trainer-cpf";

export type PlanOption = "free_5" | "free_trial" | "monthly" | "annual";

/** Planos da plataforma (para exibir no onboarding quando vindos do servidor). */
export type PlatformPlanOption = {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    durationMonths: number;
    maxStudents: number | null;
    pricePerStudentCents: number | null;
    features: string[] | null;
    hasAi: boolean | null;
    hasPriority: boolean | null;
    trialDays: number | null;
    hasSalesPipeline?: boolean;
};

export interface ServicePlan {
    name: string;
    price: number; // in cents (R$ 150,00 = 15000)
    durationMonths: number;
}

export interface TrainerOnboardingData {
    plan: PlanOption | string;
    cpf: string;
    birthDate: string; // ISO date string
    phone: string;
    presentialStudents: number;
    onlineStudents: number;
    servicePlans?: ServicePlan[];
}

export interface StudentOnboardingData {
    cpf: string;
    birthDate: string;
    phone: string; // WhatsApp
    teamCode: string; // Trainer's team code
}

/**
 * Generate a unique 6-char alphanumeric team code for trainers
 */
function generateTeamCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 to avoid confusion
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

/**
 * Normalize plan selection to platform slug for storage.
 * free_5 -> free; free_trial/monthly -> pro-monthly; annual -> pro-yearly; else as-is.
 */
function normalizePlanToSlug(plan: PlanOption | string): string {
    switch (plan) {
        case "free_5": return "free";
        case "free_trial":
        case "monthly": return "pro-monthly";
        case "annual": return "pro-yearly";
        default: return String(plan);
    }
}

/**
 * List active platform plans for onboarding (name, price, features, trial, etc.).
 */
export async function getPlatformPlansForOnboarding(): Promise<PlatformPlanOption[]> {
    const rows = await db
        .select({
            id: platformPlans.id,
            slug: platformPlans.slug,
            name: platformPlans.name,
            priceCents: platformPlans.priceCents,
            durationMonths: platformPlans.durationMonths,
            maxStudents: platformPlans.maxStudents,
            pricePerStudentCents: platformPlans.pricePerStudentCents,
            features: platformPlans.features,
            hasAi: platformPlans.hasAi,
            hasPriority: platformPlans.hasPriority,
            trialDays: platformPlans.trialDays,
            hasSalesPipeline: platformPlans.hasSalesPipeline,
        })
        .from(platformPlans)
        .where(eq(platformPlans.active, true))
        .orderBy(asc(platformPlans.sortOrder));

    return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        priceCents: r.priceCents ?? 0,
        durationMonths: r.durationMonths ?? 1,
        maxStudents: r.maxStudents ?? null,
        pricePerStudentCents: r.pricePerStudentCents ?? null,
        features: (r.features as string[]) ?? null,
        hasAi: r.hasAi ?? false,
        hasPriority: r.hasPriority ?? false,
        trialDays: r.trialDays ?? null,
        hasSalesPipeline: r.hasSalesPipeline ?? false,
    }));
}

/**
 * Validate a trainer's team code and return the trainer
 */
export async function validateTeamCode(teamCode: string) {
    const trainer = await db.query.trainers.findFirst({
        where: eq(trainers.teamCode, teamCode.toUpperCase().trim()),
        columns: { id: true, name: true },
    });

    if (!trainer) return null;
    return { id: trainer.id, name: trainer.name };
}

export async function setUserRole(
    role: "trainer" | "student",
    trainerData?: TrainerOnboardingData,
    studentData?: StudentOnboardingData
) {
    const user = await currentUser();

    if (!user) {
        throw new Error("Not authenticated");
    }

    const client = await clerkClient();
    await client.users.updateUser(user.id, {
        publicMetadata: { role },
    });

    if (role === "trainer") {
        if (!trainerData) throw new Error("Trainer data is required");

        const subscriptionPlan = normalizePlanToSlug(trainerData.plan);
        const isTrialPlan = trainerData.plan === "free_trial" || subscriptionPlan === "pro-monthly" || subscriptionPlan === "pro-yearly";
        const trialEndsAt = isTrialPlan
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null;
        const subscriptionStatus = isTrialPlan ? "trial" : "active";

        // Uma conta por CPF na plataforma
        if (trainerData.cpf && (await isCpfUsedByAnotherTrainer(trainerData.cpf, user.id))) {
            throw new Error("Já existe uma conta cadastrada com este CPF. Não é permitido mais de uma conta por CPF.");
        }

        // Generate unique team code
        let teamCode = generateTeamCode();
        for (let i = 0; i < 5; i++) {
            const existing = await db.query.trainers.findFirst({
                where: eq(trainers.teamCode, teamCode),
                columns: { id: true },
            });
            if (!existing) break;
            teamCode = generateTeamCode();
        }

        await db.insert(trainers).values({
            id: user.id,
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || "Trainer",
            email: user.emailAddresses[0].emailAddress,
            cpf: trainerData.cpf || null,
            phone: trainerData.phone || null,
            birthDate: trainerData.birthDate ? new Date(trainerData.birthDate) : null,
            presentialStudents: trainerData.presentialStudents || 0,
            onlineStudents: trainerData.onlineStudents || 0,
            subscriptionPlan,
            subscriptionStatus,
            trialEndsAt,
            teamCode,
        }).onConflictDoUpdate({
            target: trainers.id,
            set: {
                cpf: trainerData.cpf || null,
                phone: trainerData.phone || null,
                birthDate: trainerData.birthDate ? new Date(trainerData.birthDate) : null,
                presentialStudents: trainerData.presentialStudents || 0,
                onlineStudents: trainerData.onlineStudents || 0,
                subscriptionPlan,
                subscriptionStatus,
                trialEndsAt,
                teamCode,
                updatedAt: new Date(),
            }
        });

        // Create service plans (plans the trainer offers to students)
        if (trainerData.servicePlans && trainerData.servicePlans.length > 0) {
            for (const sp of trainerData.servicePlans) {
                await db.insert(plans).values({
                    trainerId: user.id,
                    name: sp.name,
                    price: sp.price,
                    durationMonths: sp.durationMonths,
                });
            }
        }

        return "/dashboard";
    }

    if (role === "student") {
        if (!studentData) throw new Error("Student data is required");

        const code = studentData.teamCode.toUpperCase().trim();
        const trainer = await db.query.trainers.findFirst({
            where: eq(trainers.teamCode, code),
            columns: { id: true, name: true },
        });

        if (!trainer) throw new Error("Código do time inválido. Peça o código correto ao seu Personal Trainer.");

        const email = user.emailAddresses[0]?.emailAddress;
        const name = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.username || "Aluno";

        // Check if student already exists for this email + trainer
        const existingStudent = await db.query.students.findFirst({
            where: eq(students.email, email),
            columns: { id: true },
        });

        if (existingStudent) {
            // Update existing record
            await db.update(students).set({
                cpf: studentData.cpf || null,
                phone: studentData.phone || null,
                birthDate: studentData.birthDate ? new Date(studentData.birthDate) : null,
                active: true,
                updatedAt: new Date(),
            }).where(eq(students.id, existingStudent.id));
        } else {
            // Create new student record
            await db.insert(students).values({
                trainerId: trainer.id,
                name,
                email,
                cpf: studentData.cpf || null,
                phone: studentData.phone || null,
                birthDate: studentData.birthDate ? new Date(studentData.birthDate) : null,
                active: true,
                accessTypes: ["workout", "nutrition"],
            });
        }

        return "/student";
    }

    return "/";
}

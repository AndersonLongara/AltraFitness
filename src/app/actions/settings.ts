"use server";

import { db } from "@/db";
import { trainers, students, payments, plans, platformPlans } from "@/db/schema";
import { eq, and, desc, count, sql, asc } from "drizzle-orm";
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
    hasAsaasKey?: boolean;
}

export interface SubscriptionInfo {
    plan: string; // slug do plano (free, free_5, pro-monthly, pro-yearly, etc.) — reflete trainers.subscription_plan
    status: string;
    displayName: string;
    price: string;
    features: string[];
    trialEndsAt?: Date | null;
    pricePerStudentCents?: number | null;
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

/** Planos da plataforma para exibir na tela de configurações (troca de plano). */
export interface PlatformPlanForSettings {
    id: string;
    slug: string;
    name: string;
    priceCents: number;
    durationMonths: number;
    maxStudents: number | null;
    pricePerStudentCents: number | null;
    trialDays: number | null;
    features: string[];
    hasAi: boolean;
    hasPriority: boolean;
    hasSalesPipeline: boolean;
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
    "pro-monthly": {
        displayName: "Pro Mensal",
        price: "R$ 99,90/mês",
        features: [
            "Alunos Ilimitados",
            "IA Manager Completo",
            "Criação de treinos com IA",
            "Relatórios avançados",
        ],
        limits: { maxStudents: null, hasAI: true, hasPriority: false },
    },
    "pro-yearly": {
        displayName: "Pro Anual",
        price: "R$ 851,15/ano",
        features: [
            "Todos recursos do Pro Mensal",
            "Prioridade no Suporte",
            "Economia no ano",
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
        hasAsaasKey: !!(trainerRecord && "asaasApiKey" in trainerRecord && (trainerRecord as { asaasApiKey?: string | null }).asaasApiKey),
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
/** Retorna as informações da assinatura do personal: reflete o plano salvo no banco (trainers.subscription_plan).
 * Se o slug existir em platform_plans, usa nome, preço e features do banco; senão usa PLAN_DETAILS (fallback). */
export async function getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const trainer = await getCurrentTrainer();

    const trainerRecord = await db.query.trainers.findFirst({
        where: eq(trainers.id, trainer.id),
        columns: { subscriptionPlan: true, subscriptionStatus: true, trialEndsAt: true },
    });

    const planSlug = trainerRecord?.subscriptionPlan || "free";
    const status = trainerRecord?.subscriptionStatus || "active";
    const trialEndsAt = trainerRecord?.trialEndsAt || null;

    // Preferir dados do platform_plans (plano escolhido no banco)
    const platformPlan = await db.query.platformPlans.findFirst({
        where: eq(platformPlans.slug, planSlug),
        columns: {
            name: true,
            priceCents: true,
            durationMonths: true,
            maxStudents: true,
            pricePerStudentCents: true,
            trialDays: true,
            features: true,
            hasAi: true,
            hasPriority: true,
        },
    });

    if (platformPlan) {
        const priceCents = platformPlan.priceCents ?? 0;
        const durationMonths = platformPlan.durationMonths ?? 1;
        const trialDays = platformPlan.trialDays ?? 0;
        let priceStr: string;
        if (priceCents === 0 && trialDays > 0) priceStr = `R$ 0 (${trialDays} dias grátis)`;
        else if (priceCents === 0) priceStr = "R$ 0/mês";
        else if (durationMonths >= 12) priceStr = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100) + "/ano";
        else priceStr = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceCents / 100) + "/mês";

        const featuresList = Array.isArray(platformPlan.features) ? platformPlan.features : [];

        return {
            plan: planSlug,
            status,
            trialEndsAt,
            displayName: platformPlan.name,
            price: priceStr,
            features: featuresList.length > 0 ? featuresList : ["Recursos do plano"],
            pricePerStudentCents: platformPlan.pricePerStudentCents ?? null,
            limits: {
                maxStudents: platformPlan.maxStudents ?? null,
                hasAI: !!platformPlan.hasAi,
                hasPriority: !!platformPlan.hasPriority,
            },
        };
    }

    // Fallback: slugs legados (free_5, free_trial, monthly, annual, free, pro-monthly, pro-yearly)
    const details = PLAN_DETAILS[planSlug] ?? PLAN_DETAILS.free_5;
    return {
        plan: planSlug,
        status,
        trialEndsAt,
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

/** Status para o tutorial de configuração (Asaas, planos, alunos). */
export interface ConfigTutorialStatus {
    hasAsaasKey: boolean;
    plansCount: number;
    studentsCount: number;
}

export async function getConfigTutorialStatus(): Promise<ConfigTutorialStatus> {
    try {
        const trainer = await getCurrentTrainer();
        const [trainerRecord, plansCount, studentsCount] = await Promise.all([
            db.query.trainers.findFirst({
                where: eq(trainers.id, trainer.id),
                columns: { asaasApiKey: true },
            }),
            db.$count(plans, eq(plans.trainerId, trainer.id)),
            db.$count(students, eq(students.trainerId, trainer.id)),
        ]);
        return {
            hasAsaasKey: !!(trainerRecord?.asaasApiKey),
            plansCount: plansCount ?? 0,
            studentsCount: studentsCount ?? 0,
        };
    } catch (err) {
        console.error("[getConfigTutorialStatus] Error:", err instanceof Error ? err.message : String(err));
        return { hasAsaasKey: false, plansCount: 0, studentsCount: 0 };
    }
}

/** Retorna se o personal tem acesso ao pipeline de vendas (conforme plano da plataforma). */
export async function hasSalesAccess(): Promise<boolean> {
    const trainer = await getCurrentTrainer();
    const trainerRecord = await db.query.trainers.findFirst({
        where: eq(trainers.id, trainer.id),
        columns: { subscriptionPlan: true },
    });
    const planSlug = trainerRecord?.subscriptionPlan || "free_5";
    const platformPlan = await db.query.platformPlans.findFirst({
        where: eq(platformPlans.slug, planSlug),
        columns: { hasSalesPipeline: true },
    });
    return !!platformPlan?.hasSalesPipeline;
}

/** Planos ativos da plataforma para a página de configurações (troca de plano). */
export async function getPlatformPlansForSettings(): Promise<PlatformPlanForSettings[]> {
    const rows = await db
        .select({
            id: platformPlans.id,
            slug: platformPlans.slug,
            name: platformPlans.name,
            priceCents: platformPlans.priceCents,
            durationMonths: platformPlans.durationMonths,
            maxStudents: platformPlans.maxStudents,
            pricePerStudentCents: platformPlans.pricePerStudentCents,
            trialDays: platformPlans.trialDays,
            features: platformPlans.features,
            hasAi: platformPlans.hasAi,
            hasPriority: platformPlans.hasPriority,
            hasSalesPipeline: platformPlans.hasSalesPipeline,
        })
        .from(platformPlans)
        .where(eq(platformPlans.active, true))
        .orderBy(asc(platformPlans.sortOrder));

    return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        priceCents: r.priceCents,
        durationMonths: r.durationMonths,
        maxStudents: r.maxStudents ?? null,
        pricePerStudentCents: r.pricePerStudentCents ?? null,
        trialDays: r.trialDays ?? null,
        features: (r.features as string[]) ?? [],
        hasAi: r.hasAi ?? false,
        hasPriority: r.hasPriority ?? false,
        hasSalesPipeline: r.hasSalesPipeline ?? false,
    }));
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

/** Atualiza o tema do personal (light | dark | system) e persiste no DB. */
export async function updateTheme(theme: "light" | "dark" | "system") {
    const trainer = await getCurrentTrainer();
    await db
        .update(trainers)
        .set({ theme, updatedAt: new Date() })
        .where(eq(trainers.id, trainer.id));
    revalidatePath("/dashboard/settings");
}

/** Retorna o tema salvo no DB para sincronizar cookie/contexto (evita flash). */
export async function syncThemeCookie(): Promise<"light" | "dark" | "system"> {
    const trainer = await getCurrentTrainer();
    const row = await db.query.trainers.findFirst({
        where: eq(trainers.id, trainer.id),
        columns: { theme: true },
    });
    const t = row?.theme;
    return t === "light" || t === "dark" || t === "system" ? t : "system";
}

/** Atualiza a chave de API Asaas do personal (opcional para cobranças PIX/Boleto/Cartão). */
export async function updateAsaasApiKey(apiKey: string | null) {
    const trainer = await getCurrentTrainer();
    await db
        .update(trainers)
        .set({
            asaasApiKey: apiKey,
            updatedAt: new Date(),
        })
        .where(eq(trainers.id, trainer.id));
    revalidatePath("/dashboard/settings");
}

// ─── Change Plan ────────────────────────────────────────────────────
export async function changeSubscriptionPlan(newPlan: string) {
    const trainer = await getCurrentTrainer();

    // Se for slug de plano com trial (ex.: free_trial ou slug com trial_days), definir trialEndsAt
    let trialEndsAt: Date | null = null;
    if (newPlan === "free_trial") {
        trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
        const plan = await db.query.platformPlans.findFirst({
            where: eq(platformPlans.slug, newPlan),
            columns: { trialDays: true },
        });
        if (plan?.trialDays && plan.trialDays > 0) {
            trialEndsAt = new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000);
        }
    }

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

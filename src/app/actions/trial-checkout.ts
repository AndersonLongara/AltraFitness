"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { platformPlans, trainers, userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { reassignOrphanedTrainer } from "@/lib/reclaim-trainer";
import { isSuperAdminEmail } from "@/lib/auth-helpers";
import { isCpfUsedByAnotherTrainer } from "@/lib/trainer-cpf";
import { getPlatformAsaasConfig } from "@/lib/platform-asaas-config";
import {
  createCustomer,
  createSubscription,
  getSubscriptionPayments,
  type SubscriptionCycle,
} from "@/lib/asaas";

export type TrialPlanSlug = "pro-monthly" | "pro-yearly" | "monthly" | "annual" | (string & {});

const FALLBACK_PLAN_CONFIG: Record<string, { valueReais: number; cycle: SubscriptionCycle; slug: string }> = {
  "pro-monthly": { valueReais: 99.9, cycle: "MONTHLY", slug: "pro-monthly" },
  "pro-yearly": { valueReais: 851.15, cycle: "YEARLY", slug: "pro-yearly" },
  "pro-trial-30": { valueReais: 99.9, cycle: "MONTHLY", slug: "pro-monthly" },
  free_trial: { valueReais: 99.9, cycle: "MONTHLY", slug: "pro-monthly" },
  monthly: { valueReais: 99.9, cycle: "MONTHLY", slug: "pro-monthly" },
  annual: { valueReais: 851.15, cycle: "YEARLY", slug: "pro-yearly" },
};

function cycleFromDurationMonths(months: number): SubscriptionCycle {
  if (months >= 12) return "YEARLY";
  if (months >= 6) return "SEMIANNUALLY";
  if (months >= 3) return "QUARTERLY";
  if (months >= 2) return "BIWEEKLY";
  return "MONTHLY";
}

export interface TrainerProfileData {
  cpf?: string;
  phone?: string;
  birthDate?: string;
  presentialStudents?: number;
  onlineStudents?: number;
}

/**
 * Cria ou atualiza trainer com dados do perfil e retorna URL de checkout para trial.
 * Usado no onboarding quando o usuário ainda não tem registro.
 * planSlug: slug do plano (pode ser de platform_plans ou pro-monthly, pro-yearly, monthly, annual).
 */
export async function createTrainerAndGetTrialCheckoutUrl(
  planSlug: string,
  profileData: TrainerProfileData
): Promise<string> {
  const user = await currentUser();
  if (!user) throw new Error("Faça login para ativar o trial.");

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) throw new Error("E-mail é obrigatório.");

  const name = user.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user.username || "Trainer";

  const existingByEmail = await db.query.trainers.findFirst({
    where: eq(trainers.email, email),
    columns: { id: true },
  });
  if (existingByEmail && existingByEmail.id !== user.id) {
    // Conta Clerk foi excluída e usuário recriou com mesmo e-mail — reassociar
    await reassignOrphanedTrainer({
      oldTrainerId: existingByEmail.id,
      newUserId: user.id,
      newTrainerData: {
        name,
        email,
        cpf: profileData.cpf || null,
        phone: profileData.phone || null,
        birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
        presentialStudents: profileData.presentialStudents ?? 0,
        onlineStudents: profileData.onlineStudents ?? 0,
        subscriptionPlan: FALLBACK_PLAN_CONFIG[planSlug]?.slug ?? planSlug,
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    const roleToSet = (await isSuperAdminEmail(email)) ? "superadmin" : "trainer";
    await db.insert(userRoles).values({ userId: user.id, role: roleToSet }).onConflictDoUpdate({
      target: userRoles.userId,
      set: { role: roleToSet, updatedAt: new Date() },
    });
    return createTrialCheckoutUrl(planSlug);
  }

  // Uma conta por CPF na plataforma
  if (profileData.cpf && (await isCpfUsedByAnotherTrainer(profileData.cpf))) {
    throw new Error("Já existe uma conta cadastrada com este CPF. Não é permitido mais de uma conta por CPF.");
  }

  const teamCode = await generateUniqueTeamCode();
  const roleToSet = (await isSuperAdminEmail(email)) ? "superadmin" : "trainer";
  await db.insert(userRoles).values({ userId: user.id, role: roleToSet }).onConflictDoUpdate({
    target: userRoles.userId,
    set: { role: roleToSet, updatedAt: new Date() },
  });

  await db
    .insert(trainers)
    .values({
      id: user.id,
      name,
      email,
      cpf: profileData.cpf || null,
      phone: profileData.phone || null,
      birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
      presentialStudents: profileData.presentialStudents ?? 0,
      onlineStudents: profileData.onlineStudents ?? 0,
      subscriptionPlan: FALLBACK_PLAN_CONFIG[planSlug]?.slug ?? planSlug,
      subscriptionStatus: "trial",
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      teamCode,
    })
    .onConflictDoUpdate({
      target: trainers.id,
      set: {
        cpf: profileData.cpf || null,
        phone: profileData.phone || null,
        birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
        presentialStudents: profileData.presentialStudents ?? 0,
        onlineStudents: profileData.onlineStudents ?? 0,
        subscriptionPlan: FALLBACK_PLAN_CONFIG[planSlug]?.slug ?? planSlug,
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        teamCode,
        updatedAt: new Date(),
      },
    });

  return createTrialCheckoutUrl(planSlug);
}

async function generateUniqueTeamCode(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    const existing = await db.query.trainers.findFirst({
      where: eq(trainers.teamCode, code),
      columns: { id: true },
    });
    if (!existing) return code;
  }
  return `T${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

/**
 * Cria checkout Asaas para trial de 30 dias.
 * Retorna URL para o usuário inserir o cartão (R$ 0 hoje, cobrança em 30 dias).
 * Suporta planos do banco (platform_plans) ou slugs fixos (pro-monthly, pro-yearly, monthly, annual).
 */
export async function createTrialCheckoutUrl(planSlug: string): Promise<string> {
  const user = await currentUser();
  if (!user) throw new Error("Faça login para ativar o trial.");

  const config = await getPlatformAsaasConfig();
  if (!config.apiKey) {
    throw new Error("Checkout indisponível. Entre em contato com o suporte.");
  }

  let planConfig: { valueReais: number; cycle: SubscriptionCycle; slug: string };
  const fallback = FALLBACK_PLAN_CONFIG[planSlug];
  if (fallback) {
    planConfig = fallback;
  } else {
    const [plan] = await db.select().from(platformPlans).where(eq(platformPlans.slug, planSlug));
    if (!plan || !plan.priceCents) throw new Error("Plano inválido ou sem preço.");
    planConfig = {
      valueReais: plan.priceCents / 100,
      cycle: cycleFromDurationMonths(plan.durationMonths || 1),
      slug: plan.slug,
    };
  }

  const trainer = await db.query.trainers.findFirst({
    where: eq(trainers.id, user.id),
    columns: { id: true, name: true, email: true, cpf: true, phone: true, asaasCustomerId: true },
  });

  if (!trainer) {
    throw new Error("Complete o cadastro antes de ativar o trial.");
  }

  const opts = { apiKey: config.apiKey, sandbox: config.sandbox };
  let asaasCustomerId = trainer.asaasCustomerId;

  if (!asaasCustomerId) {
    const created = await createCustomer(
      {
        name: trainer.name,
        email: trainer.email,
        cpfCnpj: trainer.cpf ?? undefined,
        mobilePhone: trainer.phone ?? undefined,
      },
      config.apiKey,
      opts
    );
    asaasCustomerId = created.id;
    await db
      .update(trainers)
      .set({ asaasCustomerId, updatedAt: new Date() })
      .where(eq(trainers.id, trainer.id));
  }

  const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const nextDueStr = trialEndDate.toISOString().slice(0, 10);
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3000";

  const sub = await createSubscription(
    {
      customer: asaasCustomerId,
      billingType: "CREDIT_CARD",
      value: planConfig.valueReais,
      nextDueDate: nextDueStr,
      cycle: planConfig.cycle,
      description: `AltraFit - ${planSlug === "pro-yearly" ? "AltraElite" : "AltraPerformance"} (30 dias trial)`,
      externalReference: `trainer:${trainer.id}:${planConfig.slug}`,
      callback: {
        successUrl: `${baseUrl}/onboarding/checkout-success?trainerId=${trainer.id}&plan=${planConfig.slug}`,
      },
    },
    config.apiKey,
    opts
  );

  const payments = await getSubscriptionPayments(sub.id, config.apiKey, opts);
  const firstPayment = payments.data?.[0];
  if (!firstPayment?.invoiceUrl) {
    throw new Error("Não foi possível gerar o link de checkout. Tente novamente.");
  }

  return firstPayment.invoiceUrl;
}

/**
 * Confirma o trial após o usuário voltar do checkout Asaas.
 * Atualiza o trainer com plano e status trialing.
 */
export async function confirmTrialAfterCheckout(trainerId: string, planSlug: string) {
  const user = await currentUser();
  if (!user || user.id !== trainerId) {
    throw new Error("Acesso negado.");
  }

  const validSlugs = ["pro-monthly", "pro-yearly"];
  const fromDb = await db.select({ slug: platformPlans.slug }).from(platformPlans).where(eq(platformPlans.slug, planSlug));
  if (!validSlugs.includes(planSlug) && fromDb.length === 0) {
    throw new Error("Plano inválido.");
  }

  const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db
    .update(trainers)
    .set({
      subscriptionPlan: planSlug,
      subscriptionStatus: "trial",
      trialEndsAt,
      updatedAt: new Date(),
    })
    .where(eq(trainers.id, trainerId));
}

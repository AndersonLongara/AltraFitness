"use server";

import { db } from "@/db";
import {
  trainers,
  students,
  payments,
  plans,
  platformCharges,
  platformSettings,
  platformPlans,
  userRoles,
  leads,
  exercises,
  workoutPlans,
  workouts,
  workoutItems,
  workoutLogs,
  workoutLogSets,
  nutritionalPlans,
  meals,
  mealItems,
  mealLogs,
  assessments,
  assessmentPhotos,
  hydrationLogs,
  gamificationLogs,
  moodLogs,
  studentForms,
  formAnswers,
  studentBadges,
  forms,
  foods,
} from "@/db/schema";
import { eq, desc, asc, sql, and, gte, lte, inArray } from "drizzle-orm";
import { requireSuperAdmin } from "@/lib/auth-helpers";
import { createCustomer, createPayment } from "@/lib/asaas";
import type { BillingType } from "@/lib/asaas";
import { getPlatformAsaasConfig } from "@/lib/platform-asaas-config";
import { clerkClient } from "@clerk/nextjs/server";

export async function getSuperAdminStats() {
  await requireSuperAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [trainersCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(trainers);
  const [studentsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(students);
  const [paymentsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments);

  const [revenueResult] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(
      and(
        eq(payments.status, "paid"),
        gte(payments.paidAt, startOfMonth),
        lte(payments.paidAt, endOfMonth)
      )
    );

  const [monthlyPaymentsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(payments)
    .where(
      and(
        eq(payments.status, "paid"),
        gte(payments.paidAt, startOfMonth),
        lte(payments.paidAt, endOfMonth)
      )
    );

  return {
    totalTrainers: Number(trainersCount?.count ?? 0),
    totalStudents: Number(studentsCount?.count ?? 0),
    totalPayments: Number(paymentsCount?.count ?? 0),
    revenueThisMonth: Number(revenueResult?.total ?? 0),
    paidCountThisMonth: Number(monthlyPaymentsCount?.count ?? 0),
  };
}

/** Dados para gráficos e relatórios do dashboard Super Admin */
export async function getSuperAdminDashboardCharts() {
  await requireSuperAdmin();

  const now = new Date();
  const monthsBack = 12;
  const monthLabels: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(
      d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
    );
  }

  // Receita por mês (personais → alunos, pagos)
  const paidPayments = await db
    .select({
      amount: payments.amount,
      paidAt: payments.paidAt,
    })
    .from(payments)
    .where(eq(payments.status, "paid"));
  const revenueByMonth = monthLabels.map((label, idx) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - idx), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - idx) + 1, 0, 23, 59, 59);
    const total = paidPayments
      .filter((p) => p.paidAt && p.paidAt >= start && p.paidAt <= end)
      .reduce((s, p) => s + Number(p.amount), 0);
    return { month: label, receita: total / 100, receitaPlataforma: 0 };
  });

  // Receita plataforma (cobranças ao personal, pagas)
  const paidCharges = await db
    .select({ amount: platformCharges.amount, paidAt: platformCharges.paidAt })
    .from(platformCharges)
    .where(eq(platformCharges.status, "paid"));
  for (let i = 0; i < monthLabels.length; i++) {
    const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i) + 1, 0, 23, 59, 59);
    const total = paidCharges
      .filter((c) => c.paidAt && c.paidAt >= start && c.paidAt <= end)
      .reduce((s, c) => s + Number(c.amount), 0);
    revenueByMonth[i].receitaPlataforma = total / 100;
  }

  // Pagamentos por status
  const statusRows = await db
    .select({
      status: payments.status,
      count: sql<number>`count(*)`,
    })
    .from(payments)
    .groupBy(payments.status);
  const paymentsByStatus = [
    { status: "Pago", count: Number(statusRows.find((r) => r.status === "paid")?.count ?? 0) },
    { status: "Pendente", count: Number(statusRows.find((r) => r.status === "pending")?.count ?? 0) },
    { status: "Atrasado", count: Number(statusRows.find((r) => r.status === "overdue")?.count ?? 0) },
  ].filter((r) => r.count > 0);

  // Top 8 personais por receita (pagos, todos os tempos)
  const trainerRevenueRows = await db
    .select({
      trainerId: payments.trainerId,
      total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    })
    .from(payments)
    .where(eq(payments.status, "paid"))
    .groupBy(payments.trainerId)
    .orderBy(desc(sql`COALESCE(SUM(${payments.amount}), 0)`));
  const topTrainerIds = trainerRevenueRows.slice(0, 8).map((r) => r.trainerId);
  const trainerNames =
    topTrainerIds.length > 0
      ? await db
          .select({ id: trainers.id, name: trainers.name })
          .from(trainers)
          .where(inArray(trainers.id, topTrainerIds))
      : [];
  const nameMap = Object.fromEntries(trainerNames.map((t) => [t.id, t.name]));
  const topTrainersByRevenue = trainerRevenueRows.slice(0, 8).map((r) => ({
    name: nameMap[r.trainerId] ?? r.trainerId.slice(0, 8),
    receita: Number(r.total) / 100,
  }));

  // Novos cadastros por mês (personais e alunos)
  const allTrainers = await db.select({ createdAt: trainers.createdAt }).from(trainers);
  const allStudents = await db.select({ createdAt: students.createdAt }).from(students);
  const signupsByMonth = monthLabels.map((label, idx) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - idx), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - idx) + 1, 0, 23, 59, 59);
    const trainersCount = allTrainers.filter((t) => t.createdAt && t.createdAt >= start && t.createdAt <= end).length;
    const studentsCount = allStudents.filter((s) => s.createdAt && s.createdAt >= start && s.createdAt <= end).length;
    return { month: label, personais: trainersCount, alunos: studentsCount };
  });

  // Resumo cobranças plataforma
  const [platformPending] = await db
    .select({
      count: sql<number>`count(*)`,
      total: sql<number>`COALESCE(SUM(${platformCharges.amount}), 0)`,
    })
    .from(platformCharges)
    .where(eq(platformCharges.status, "pending"));
  const [platformPaid] = await db
    .select({
      count: sql<number>`count(*)`,
      total: sql<number>`COALESCE(SUM(${platformCharges.amount}), 0)`,
    })
    .from(platformCharges)
    .where(eq(platformCharges.status, "paid"));
  const platformChargesSummary = {
    pendingCount: Number(platformPending?.count ?? 0),
    pendingAmount: Number(platformPending?.total ?? 0) / 100,
    paidCount: Number(platformPaid?.count ?? 0),
    paidAmount: Number(platformPaid?.total ?? 0) / 100,
  };

  // Últimos 10 pagamentos (personais → alunos) para tabela
  const recentPayments = await db.query.payments.findMany({
    columns: {
      id: true,
      amount: true,
      status: true,
      paidAt: true,
      dueDate: true,
      createdAt: true,
    },
    with: {
      trainer: { columns: { id: true, name: true } },
      student: { columns: { id: true, name: true } },
    },
    orderBy: [desc(payments.createdAt)],
    limit: 10,
  });

  return {
    revenueByMonth,
    paymentsByStatus,
    topTrainersByRevenue,
    signupsByMonth,
    platformChargesSummary,
    recentPayments,
  };
}

export async function getSuperAdminTrainers() {
  await requireSuperAdmin();

  const list = await db.query.trainers.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      createdAt: true,
    },
    orderBy: [desc(trainers.createdAt)],
  });

  const withCounts = await Promise.all(
    list.map(async (t) => {
      const [studentCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(students)
        .where(eq(students.trainerId, t.id));
      const [planCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(plans)
        .where(eq(plans.trainerId, t.id));
      return {
        ...t,
        studentsCount: Number(studentCount?.count ?? 0),
        plansCount: Number(planCount?.count ?? 0),
      };
    })
  );

  return withCounts;
}

export async function getSuperAdminStudents(trainerId?: string) {
  await requireSuperAdmin();

  const where = trainerId ? eq(students.trainerId, trainerId) : undefined;
  const list = await db.query.students.findMany({
    where,
    columns: {
      id: true,
      name: true,
      email: true,
      active: true,
      planEnd: true,
      createdAt: true,
      trainerId: true,
    },
    with: {
      trainer: { columns: { id: true, name: true, email: true } },
      plan: { columns: { name: true } },
    },
    orderBy: [desc(students.createdAt)],
  });

  return list;
}

export async function getSuperAdminPayments(trainerId?: string) {
  await requireSuperAdmin();

  const where = trainerId ? eq(payments.trainerId, trainerId) : undefined;
  const list = await db.query.payments.findMany({
    where,
    columns: {
      id: true,
      amount: true,
      dueDate: true,
      paidAt: true,
      status: true,
      method: true,
      notes: true,
      trainerId: true,
      studentId: true,
      planId: true,
    },
    with: {
      trainer: { columns: { id: true, name: true, email: true } },
      student: { columns: { id: true, name: true } },
      plan: { columns: { id: true, name: true } },
    },
    orderBy: [desc(payments.dueDate)],
  });

  return list;
}

/** Planos que cada personal cria para seus alunos (planos de treino/preço). Consulta por cliente. */
export async function getSuperAdminTrainerPlans(trainerId?: string) {
  await requireSuperAdmin();

  const where = trainerId ? eq(plans.trainerId, trainerId) : undefined;
  const list = await db.query.plans.findMany({
    where,
    with: {
      trainer: { columns: { id: true, name: true, email: true } },
    },
    orderBy: [desc(plans.createdAt)],
  });

  return list;
}

// --- Planos que a plataforma oferece aos personais (assinaturas) ---

export async function getSuperAdminPlatformPlans() {
  await requireSuperAdmin();

  const list = await db
    .select()
    .from(platformPlans)
    .orderBy(asc(platformPlans.sortOrder), desc(platformPlans.createdAt));

  const withCount = await Promise.all(
    list.map(async (p) => {
      const [count] = await db
        .select({ count: sql<number>`count(*)` })
        .from(trainers)
        .where(eq(trainers.subscriptionPlan, p.slug));
      return { ...p, trainersCount: Number(count?.count ?? 0) };
    })
  );

  return withCount;
}

export async function createPlatformPlan(data: {
  slug: string;
  name: string;
  priceCents: number;
  durationMonths: number;
  maxStudents?: number | null;
  pricePerStudentCents?: number | null;
  features?: string[];
  hasAi?: boolean;
  hasPriority?: boolean;
  hasSalesPipeline?: boolean;
  trialDays?: number | null;
  sortOrder?: number;
}) {
  await requireSuperAdmin();

  const slug = data.slug.trim().toLowerCase().replace(/\s+/g, "_");
  if (!slug) throw new Error("Identificador (slug) é obrigatório.");

  const [existing] = await db.select().from(platformPlans).where(eq(platformPlans.slug, slug));
  if (existing) throw new Error("Já existe um plano com este identificador.");

  const perStudent = data.pricePerStudentCents != null ? Math.max(0, Number(data.pricePerStudentCents)) : null;
  const trialDays = data.trialDays != null && data.trialDays > 0 ? data.trialDays : null;
  await db.insert(platformPlans).values({
    slug,
    name: data.name.trim(),
    priceCents: Number(data.priceCents) >= 0 ? Number(data.priceCents) : 0,
    durationMonths: Number(data.durationMonths) >= 0 ? Number(data.durationMonths) : 1,
    maxStudents: data.maxStudents == null ? null : Number(data.maxStudents),
    pricePerStudentCents: perStudent === 0 ? null : perStudent,
    features: Array.isArray(data.features) ? data.features : [],
    hasAi: !!data.hasAi,
    hasPriority: !!data.hasPriority,
    hasSalesPipeline: !!data.hasSalesPipeline,
    trialDays,
    sortOrder: data.sortOrder ?? 0,
    active: true,
    updatedAt: new Date(),
  });
}

export async function updatePlatformPlan(
  id: string,
  data: {
    name?: string;
    priceCents?: number;
    durationMonths?: number;
    maxStudents?: number | null;
    pricePerStudentCents?: number | null;
    features?: string[];
    hasAi?: boolean;
    hasPriority?: boolean;
    hasSalesPipeline?: boolean;
    trialDays?: number | null;
    active?: boolean;
    sortOrder?: number;
  }
) {
  await requireSuperAdmin();

  const perStudent = data.pricePerStudentCents !== undefined
    ? (data.pricePerStudentCents == null ? null : Math.max(0, Number(data.pricePerStudentCents)))
    : undefined;
  await db
    .update(platformPlans)
    .set({
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.priceCents !== undefined && { priceCents: Math.max(0, data.priceCents) }),
      ...(data.durationMonths !== undefined && { durationMonths: Math.max(0, data.durationMonths) }),
      ...(data.maxStudents !== undefined && { maxStudents: data.maxStudents == null ? null : data.maxStudents }),
      ...(perStudent !== undefined && { pricePerStudentCents: perStudent === 0 ? null : perStudent }),
      ...(data.features !== undefined && { features: Array.isArray(data.features) ? data.features : [] }),
      ...(data.hasAi !== undefined && { hasAi: data.hasAi }),
      ...(data.hasPriority !== undefined && { hasPriority: data.hasPriority }),
      ...(data.hasSalesPipeline !== undefined && { hasSalesPipeline: data.hasSalesPipeline }),
      ...(data.trialDays !== undefined && { trialDays: data.trialDays == null || data.trialDays <= 0 ? null : data.trialDays }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      updatedAt: new Date(),
    })
    .where(eq(platformPlans.id, id));
}

export async function deletePlatformPlan(id: string) {
  await requireSuperAdmin();

  const [plan] = await db.select().from(platformPlans).where(eq(platformPlans.id, id));
  if (!plan) return;

  const [count] = await db
    .select({ count: sql<number>`count(*)` })
    .from(trainers)
    .where(eq(trainers.subscriptionPlan, plan.slug));
  if (Number(count?.count ?? 0) > 0) {
    throw new Error("Não é possível excluir: há personais usando este plano. Desative o plano ou altere a assinatura deles.");
  }

  await db.delete(platformPlans).where(eq(platformPlans.id, id));
}

export async function getSuperAdminTrainerById(id: string) {
  await requireSuperAdmin();

  const trainer = await db.query.trainers.findFirst({
    where: eq(trainers.id, id),
  });
  if (!trainer) return null;

  const [studentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(students)
    .where(eq(students.trainerId, id));
  const trainerPlans = await db.select().from(plans).where(eq(plans.trainerId, id));
  const trainerPayments = await db.query.payments.findMany({
    where: eq(payments.trainerId, id),
    with: { student: { columns: { name: true } }, plan: { columns: { name: true } } },
    orderBy: [desc(payments.dueDate)],
    limit: 20,
  });

  return {
    ...trainer,
    studentsCount: Number(studentCount?.count ?? 0),
    plans: trainerPlans,
    recentPayments: trainerPayments,
  };
}

// --- Cobranças da plataforma ao personal (Asaas) ---

export async function getSuperAdminPlatformCharges(trainerId?: string) {
  await requireSuperAdmin();

  const where = trainerId ? eq(platformCharges.trainerId, trainerId) : undefined;
  const list = await db.query.platformCharges.findMany({
    where,
    with: {
      trainer: { columns: { id: true, name: true, email: true } },
    },
    orderBy: [desc(platformCharges.dueDate)],
  });
  return list;
}

const MAX_CHARGE_CENTS = 999_999_99; // R$ 999.999,99

export async function createPlatformCharge(data: {
  trainerId: string;
  amount: number;
  dueDate: Date;
  description?: string;
  billingType?: BillingType;
}) {
  await requireSuperAdmin();

  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor da cobrança deve ser maior que zero.");
  }
  if (amount > MAX_CHARGE_CENTS) {
    throw new Error("Valor máximo permitido é R$ 999.999,99.");
  }

  const config = await getPlatformAsaasConfig();
  if (!config.apiKey) {
    throw new Error("Configure a integração Asaas em Configurações (Super Admin) antes de criar cobranças.");
  }

  const opts = { apiKey: config.apiKey, sandbox: config.sandbox };

  const trainer = await db.query.trainers.findFirst({
    where: eq(trainers.id, data.trainerId),
    columns: { id: true, name: true, email: true, cpf: true, phone: true, asaasCustomerId: true, subscriptionPlan: true },
  });
  if (!trainer) throw new Error("Cliente (personal) não encontrado.");

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
    await db.update(trainers).set({ asaasCustomerId, updatedAt: new Date() }).where(eq(trainers.id, trainer.id));
  }

  // Regra do Trial: pro-monthly ou pro-yearly — primeiro pagamento com vencimento em 30 dias
  const planSlug = trainer.subscriptionPlan ?? "";
  const isTrialPlan = planSlug === "pro-monthly" || planSlug === "pro-yearly";
  const [existingCharge] = await db
    .select({ id: platformCharges.id })
    .from(platformCharges)
    .where(eq(platformCharges.trainerId, data.trainerId))
    .limit(1);
  let dueDate = data.dueDate instanceof Date ? data.dueDate : new Date(String(data.dueDate));
  if (isTrialPlan && !existingCharge) {
    const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    dueDate = trialEnd;
  }

  const dueDateStr = dueDate instanceof Date ? dueDate.toISOString().slice(0, 10) : String(dueDate).slice(0, 10);
  const valueReais = amount / 100;

  const asaas = await createPayment(
    {
      customer: asaasCustomerId,
      value: valueReais,
      dueDate: dueDateStr,
      billingType: data.billingType ?? "UNDEFINED",
      description: data.description ?? "Cobrança plataforma",
    },
    config.apiKey,
    opts
  );

  const [charge] = await db
    .insert(platformCharges)
    .values({
      trainerId: data.trainerId,
      amount,
      dueDate,
      description: data.description ?? null,
      status: "pending",
      asaasPaymentId: asaas.id,
      asaasInvoiceUrl: asaas.invoiceUrl ?? asaas.bankSlipUrl ?? null,
      billingType: data.billingType ?? "UNDEFINED",
    })
    .returning();

  return {
    charge,
    invoiceUrl: asaas.invoiceUrl ?? asaas.bankSlipUrl,
  };
}

// --- Configuração Asaas (painel) ---

const ASAAS_CONFIG_MAX_LENGTH = 200;
const PLATFORM_KEYS = {
  API_KEY: "asaas_api_key",
  SANDBOX: "asaas_sandbox",
  WEBHOOK_TOKEN: "asaas_webhook_token",
} as const;

/** Retorna a config Asaas para exibição no painel (sem revelar chaves). */
export async function getPlatformAsaasConfigForSettings() {
  await requireSuperAdmin();
  const config = await getPlatformAsaasConfig();
  return {
    hasApiKey: config.hasApiKey,
    sandbox: config.sandbox,
    hasWebhookToken: config.hasWebhookToken,
  };
}

/**
 * Salva configuração Asaas pelo painel.
 * apiKey/webhookToken: string | undefined — undefined = não alterar; "" = limpar; texto = definir (máx. 200 chars).
 */
export async function savePlatformAsaasConfig(data: {
  apiKey?: string;
  sandbox?: boolean;
  webhookToken?: string;
}) {
  await requireSuperAdmin();

  const now = new Date();

  if (data.apiKey !== undefined) {
    const trimmed = data.apiKey.trim();
    if (trimmed.length > ASAAS_CONFIG_MAX_LENGTH) {
      throw new Error("Chave API muito longa. Máximo 200 caracteres.");
    }
    await db
      .insert(platformSettings)
      .values({
        key: PLATFORM_KEYS.API_KEY,
        value: trimmed || null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value: trimmed || null, updatedAt: now },
      });
  }

  if (data.sandbox !== undefined) {
    await db
      .insert(platformSettings)
      .values({
        key: PLATFORM_KEYS.SANDBOX,
        value: data.sandbox ? "true" : "false",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value: data.sandbox ? "true" : "false", updatedAt: now },
      });
  }

  if (data.webhookToken !== undefined) {
    const trimmed = data.webhookToken.trim();
    if (trimmed.length > ASAAS_CONFIG_MAX_LENGTH) {
      throw new Error("Token do webhook muito longo. Máximo 200 caracteres.");
    }
    await db
      .insert(platformSettings)
      .values({
        key: PLATFORM_KEYS.WEBHOOK_TOKEN,
        value: trimmed || null,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value: trimmed || null, updatedAt: now },
      });
  }
}

// --- Usuários (lista e exclusão) ---

export type SuperAdminUserRow = {
  userId: string;
  name: string;
  email: string | null;
  role: "superadmin" | "trainer" | "student";
  createdAt: string | null;
  hasTrainerRecord: boolean;
};

export async function getSuperAdminUsers(): Promise<SuperAdminUserRow[]> {
  await requireSuperAdmin();

  const roles = await db.select().from(userRoles);
  const trainerIds = new Set(roles.filter((r) => r.role === "trainer").map((r) => r.userId));
  const trainerRows = await db
    .select({ id: trainers.id, name: trainers.name, email: trainers.email, createdAt: trainers.createdAt })
    .from(trainers)
    .where(inArray(trainers.id, Array.from(trainerIds)));

  const trainerMap = Object.fromEntries(trainerRows.map((t) => [t.id, t]));

  const result: SuperAdminUserRow[] = [];
  for (const row of roles) {
    const role = row.role as "superadmin" | "trainer" | "student";
    let name = "";
    let email: string | null = null;
    let createdAt: string | null = row.updatedAt ? new Date(row.updatedAt).toISOString() : null;

    if (role === "trainer" && trainerMap[row.userId]) {
      const t = trainerMap[row.userId];
      name = t.name;
      email = t.email;
      if (t.createdAt) createdAt = new Date(t.createdAt).toISOString();
    } else {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(row.userId);
        name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.emailAddresses[0]?.emailAddress || row.userId;
        email = user.emailAddresses[0]?.emailAddress ?? null;
        if (user.createdAt) createdAt = new Date(user.createdAt).toISOString();
      } catch {
        name = row.userId.slice(0, 12) + "…";
      }
    }

    result.push({
      userId: row.userId,
      name,
      email,
      role,
      createdAt,
      hasTrainerRecord: role === "trainer",
    });
  }

  result.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return result;
}

/** Exclui usuário por Clerk userId: remove da nossa base e do Clerk. Personal: remove trainer + alunos + dependentes. Aluno: remove student + dependentes + user_roles + Clerk. */
export async function deleteUserByUserId(
  userId: string
): Promise<{ ok: true } | { error: string }> {
  await requireSuperAdmin();

  const roleRow = await db.query.userRoles.findFirst({
    where: eq(userRoles.userId, userId),
    columns: { role: true },
  });
  if (!roleRow) {
    await db.delete(userRoles).where(eq(userRoles.userId, userId));
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    } catch {
      // Pode já não existir no Clerk
    }
    return { ok: true };
  }

  const role = roleRow.role as "superadmin" | "trainer" | "student";
  if (role === "superadmin") {
    return { error: "Não é permitido excluir um superadmin por aqui." };
  }

  if (role === "trainer") {
    return deleteTrainerUser(userId);
  }

  // student: encontrar student por email (Clerk user) e excluir dados do aluno + user_roles + Clerk
  let email: string | null = null;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    email = user.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    // Usuário pode já ter sido removido do Clerk
  }

  if (email) {
    const student = await db.query.students.findFirst({
      where: eq(students.email, email),
      columns: { id: true },
    });
    if (student) {
      const out = await deleteStudentByStudentId(student.id);
      if ("error" in out) return out;
    }
  }

  await db.delete(userRoles).where(eq(userRoles.userId, userId));
  try {
    const client = await clerkClient();
    await client.users.deleteUser(userId);
  } catch {
    // Pode já não existir
  }
  return { ok: true };
}

/** Exclui cliente (personal): trainer + todos os alunos e dependentes + user_roles + Clerk. */
export async function deleteTrainerUser(
  trainerId: string
): Promise<{ ok: true } | { error: string }> {
  await requireSuperAdmin();

  const trainer = await db.query.trainers.findFirst({
    where: eq(trainers.id, trainerId),
    columns: { id: true },
  });
  if (!trainer) {
    await db.delete(userRoles).where(eq(userRoles.userId, trainerId));
    try {
      const client = await clerkClient();
      await client.users.deleteUser(trainerId);
    } catch {}
    return { ok: true };
  }

  const studentIds = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.trainerId, trainerId));
  for (const { id } of studentIds) {
    await deleteStudentByStudentId(id);
  }

  await db.delete(payments).where(eq(payments.trainerId, trainerId));
  await db.delete(plans).where(eq(plans.trainerId, trainerId));
  await db.delete(platformCharges).where(eq(platformCharges.trainerId, trainerId));
  await db.delete(leads).where(eq(leads.trainerId, trainerId));
  await db.delete(exercises).where(eq(exercises.trainerId, trainerId));

  const planIds = await db
    .select({ id: workoutPlans.id })
    .from(workoutPlans)
    .where(eq(workoutPlans.trainerId, trainerId));
  for (const { id } of planIds) {
    const workoutIds = await db.select({ id: workouts.id }).from(workouts).where(eq(workouts.planId, id));
    for (const w of workoutIds) {
      await db.delete(workoutItems).where(eq(workoutItems.workoutId, w.id));
    }
    await db.delete(workouts).where(eq(workouts.planId, id));
  }
  await db.delete(workoutPlans).where(eq(workoutPlans.trainerId, trainerId));

  const nutPlanIds = await db
    .select({ id: nutritionalPlans.id })
    .from(nutritionalPlans)
    .where(eq(nutritionalPlans.trainerId, trainerId));
  for (const { id } of nutPlanIds) {
    const mealIds = await db.select({ id: meals.id }).from(meals).where(eq(meals.planId, id));
    for (const m of mealIds) {
      await db.delete(mealItems).where(eq(mealItems.mealId, m.id));
    }
    await db.delete(meals).where(eq(meals.planId, id));
  }
  await db.delete(nutritionalPlans).where(eq(nutritionalPlans.trainerId, trainerId));

  const assessmentIds = await db
    .select({ id: assessments.id })
    .from(assessments)
    .where(eq(assessments.trainerId, trainerId));
  for (const { id } of assessmentIds) {
    await db.delete(assessmentPhotos).where(eq(assessmentPhotos.assessmentId, id));
  }
  await db.delete(assessments).where(eq(assessments.trainerId, trainerId));
  await db.delete(forms).where(eq(forms.trainerId, trainerId));
  await db.delete(foods).where(eq(foods.trainerId, trainerId));

  await db.delete(trainers).where(eq(trainers.id, trainerId));
  await db.delete(userRoles).where(eq(userRoles.userId, trainerId));

  try {
    const client = await clerkClient();
    await client.users.deleteUser(trainerId);
  } catch (e) {
    return { error: "Conta removida do sistema, mas falha ao remover no Clerk: " + String(e) };
  }
  return { ok: true };
}

/** Exclui aluno por student.id: todos os dados do aluno na base. Não remove conta Clerk (aluno é identificado por e-mail no login). */
export async function deleteStudentByStudentId(
  studentId: string
): Promise<{ ok: true } | { error: string }> {
  await requireSuperAdmin();

  const student = await db.query.students.findFirst({
    where: eq(students.id, studentId),
    columns: { id: true },
  });
  if (!student) return { ok: true };

  const logIds = await db.select({ id: workoutLogs.id }).from(workoutLogs).where(eq(workoutLogs.studentId, studentId));
  for (const { id } of logIds) {
    await db.delete(workoutLogSets).where(eq(workoutLogSets.logId, id));
  }
  await db.delete(workoutLogs).where(eq(workoutLogs.studentId, studentId));
  const workoutIds = await db.select({ id: workouts.id }).from(workouts).where(eq(workouts.studentId, studentId));
  for (const w of workoutIds) {
    await db.delete(workoutItems).where(eq(workoutItems.workoutId, w.id));
  }
  await db.delete(workouts).where(eq(workouts.studentId, studentId));
  await db.delete(workoutPlans).where(eq(workoutPlans.studentId, studentId));

  await db.delete(mealLogs).where(eq(mealLogs.studentId, studentId));
  const nutPlans = await db
    .select({ id: nutritionalPlans.id })
    .from(nutritionalPlans)
    .where(eq(nutritionalPlans.studentId, studentId));
  for (const p of nutPlans) {
    const mealIds = await db.select({ id: meals.id }).from(meals).where(eq(meals.planId, p.id));
    for (const m of mealIds) {
      await db.delete(mealItems).where(eq(mealItems.mealId, m.id));
    }
    await db.delete(meals).where(eq(meals.planId, p.id));
  }
  await db.delete(nutritionalPlans).where(eq(nutritionalPlans.studentId, studentId));

  const assessmentIds = await db
    .select({ id: assessments.id })
    .from(assessments)
    .where(eq(assessments.studentId, studentId));
  for (const { id } of assessmentIds) {
    await db.delete(assessmentPhotos).where(eq(assessmentPhotos.assessmentId, id));
  }
  await db.delete(assessments).where(eq(assessments.studentId, studentId));
  await db.delete(payments).where(eq(payments.studentId, studentId));
  await db.delete(studentBadges).where(eq(studentBadges.studentId, studentId));
  await db.delete(hydrationLogs).where(eq(hydrationLogs.studentId, studentId));
  await db.delete(gamificationLogs).where(eq(gamificationLogs.studentId, studentId));
  await db.delete(moodLogs).where(eq(moodLogs.studentId, studentId));

  const formResponses = await db
    .select({ id: studentForms.id })
    .from(studentForms)
    .where(eq(studentForms.studentId, studentId));
  for (const r of formResponses) {
    await db.delete(formAnswers).where(eq(formAnswers.responseId, r.id));
  }
  await db.delete(studentForms).where(eq(studentForms.studentId, studentId));
  await db.delete(students).where(eq(students.id, studentId));

  return { ok: true };
}

/** Ativa ou inativa um cliente (personal): altera subscriptionStatus para 'active' ou 'inactive'. */
export async function setTrainerSubscriptionStatus(
  trainerId: string,
  status: "active" | "inactive"
): Promise<{ ok: true } | { error: string }> {
  await requireSuperAdmin();

  const trainer = await db.query.trainers.findFirst({
    where: eq(trainers.id, trainerId),
    columns: { id: true },
  });
  if (!trainer) return { error: "Cliente não encontrado." };

  await db
    .update(trainers)
    .set({ subscriptionStatus: status, updatedAt: new Date() })
    .where(eq(trainers.id, trainerId));
  return { ok: true };
}

/** Ativa ou inativa um aluno (active = true/false). */
export async function setStudentActive(
  studentId: string,
  active: boolean
): Promise<{ ok: true } | { error: string }> {
  await requireSuperAdmin();

  const student = await db.query.students.findFirst({
    where: eq(students.id, studentId),
    columns: { id: true },
  });
  if (!student) return { error: "Aluno não encontrado." };

  await db
    .update(students)
    .set({ active, updatedAt: new Date() })
    .where(eq(students.id, studentId));
  return { ok: true };
}

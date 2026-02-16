/**
 * Garante que os 4 planos existam em platform_plans, incluindo "AltraPRO Trial (30 dias grátis)".
 * Execute: npx tsx scripts/seed-platform-plans.ts
 */
import "../src/db/load-env";
import { db } from "../src/db";
import { platformPlans } from "../src/db/schema";
import { eq } from "drizzle-orm";

const PLANS = [
  {
    slug: "free",
    name: "AltraStart (Grátis)",
    priceCents: 0,
    durationMonths: 1,
    maxStudents: 5,
    pricePerStudentCents: null,
    features: [
      "Até 5 alunos ativos",
      "Gestão de treinos essencial",
      "Dashboard básico de métricas",
      "Suporte via comunidade",
      "Acesso ao App do Aluno",
    ],
    hasAi: false,
    hasPriority: false,
    trialDays: null,
    sortOrder: 0,
  },
  {
    slug: "pro-trial-30",
    name: "AltraPRO Trial (30 dias grátis)",
    priceCents: 9990,
    durationMonths: 1,
    maxStudents: null,
    pricePerStudentCents: 199,
    features: [
      "30 dias grátis para testar",
      "Alunos ilimitados",
      "Smart Meal Builder (TACO/TBCA)",
      "Pipeline Kanban de Vendas",
      "IA Manager",
    ],
    hasAi: true,
    hasPriority: false,
    trialDays: 30,
    sortOrder: 1,
  },
  {
    slug: "pro-monthly",
    name: "AltraPerformance (Mensal)",
    priceCents: 9990,
    durationMonths: 1,
    maxStudents: null,
    pricePerStudentCents: 199,
    features: [
      "Alunos ilimitados",
      "30 dias grátis para testar",
      "Smart Meal Builder (TACO/TBCA)",
      "Pipeline Kanban de Vendas",
      "Insights preditivos de Churn",
      "IA Manager",
    ],
    hasAi: true,
    hasPriority: false,
    trialDays: 30,
    sortOrder: 2,
  },
  {
    slug: "pro-yearly",
    name: "AltraElite (Anual)",
    priceCents: 85115,
    durationMonths: 12,
    maxStudents: null,
    pricePerStudentCents: 199,
    features: [
      "Economia de 29% (4 meses grátis)",
      "Alunos ilimitados",
      "Atendimento Prioritário VIP",
      "Smart Meal Builder (TACO/TBCA)",
      "CRM completo com Social Seller",
      "AI Manager Full Access",
    ],
    hasAi: true,
    hasPriority: true,
    trialDays: 30,
    sortOrder: 3,
  },
];

async function main() {
  console.log("🌱 Seeding platform_plans...");
  for (const p of PLANS) {
    const [existing] = await db.select().from(platformPlans).where(eq(platformPlans.slug, p.slug));
    if (existing) {
      console.log(`  ⏭️  ${p.slug} já existe`);
      continue;
    }
    await db.insert(platformPlans).values({
      slug: p.slug,
      name: p.name,
      priceCents: p.priceCents,
      durationMonths: p.durationMonths,
      maxStudents: p.maxStudents,
      pricePerStudentCents: p.pricePerStudentCents,
      features: p.features,
      hasAi: p.hasAi,
      hasPriority: p.hasPriority,
      trialDays: p.trialDays,
      sortOrder: p.sortOrder,
      active: true,
    });
    console.log(`  ✅ Inserido: ${p.name} (${p.slug})`);
  }
  console.log("✅ platform_plans seed concluído.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

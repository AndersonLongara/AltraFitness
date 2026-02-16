/**
 * Corrige os preços dos planos de plataforma no onboarding.
 * R$ 99,90/mês (AltraPerformance) e R$ 851,15/ano (AltraElite).
 * Execute: npx tsx scripts/fix-platform-plan-prices.ts
 */
import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { platformPlans } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const all = await db.select({
    id: platformPlans.id,
    slug: platformPlans.slug,
    name: platformPlans.name,
    priceCents: platformPlans.priceCents,
    durationMonths: platformPlans.durationMonths,
  }).from(platformPlans);
  console.log("Planos atuais:", all.map((p) => `${p.name} (${p.slug}): ${p.priceCents} centavos`));

  for (const plan of all) {
    let newPriceCents: number | null = null;
    const name = (plan.name || "").toLowerCase();
    if ((plan.slug === "pro-monthly" || plan.slug === "monthly" || name.includes("performance") && name.includes("mensal")) && plan.priceCents !== 9990) {
      newPriceCents = 9990; // R$ 99,90
    } else if ((plan.slug === "pro-yearly" || plan.slug === "annual" || name.includes("elite") && name.includes("anual")) && plan.priceCents !== 85115) {
      newPriceCents = 85115; // R$ 851,15
    }
    if (newPriceCents != null) {
      await db.update(platformPlans).set({ priceCents: newPriceCents, updatedAt: new Date() }).where(eq(platformPlans.id, plan.id));
      console.log(`[OK] ${plan.name} (${plan.slug}): R$ ${(newPriceCents / 100).toFixed(2).replace(".", ",")}`);
    }
  }
  console.log("Concluído.");
}

main().catch(console.error).finally(() => process.exit(0));

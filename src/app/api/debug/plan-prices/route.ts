/**
 * Debug: mostra os preços atuais dos planos (para verificar se o DB foi corrigido).
 * Acesse: /api/debug/plan-prices
 */
import { NextResponse } from "next/server";
import { db } from "@/db";
import { platformPlans } from "@/db/schema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const rows = await db
    .select({
      slug: platformPlans.slug,
      name: platformPlans.name,
      priceCents: platformPlans.priceCents,
      durationMonths: platformPlans.durationMonths,
    })
    .from(platformPlans)
    .orderBy(platformPlans.sortOrder);

  const dbPath = (process.env.TURSO_DATABASE_URL || "file:local.db").trim();
  return NextResponse.json({
    dbPath,
    plans: rows.map((r) => ({
      ...r,
      priceDisplay: r.priceCents === 0 ? "R$ 0" : `R$ ${(r.priceCents / 100).toFixed(2).replace(".", ",")}`,
    })),
    esperado: {
      "pro-monthly": "R$ 99,90",
      "pro-yearly": "R$ 851,15",
    },
  });
}

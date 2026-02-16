import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments, platformCharges } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlatformAsaasWebhookToken } from "@/lib/platform-asaas-config";

type AsaasWebhookPayload = {
  event: string;
  payment?: { id: string; status?: string };
};

/** Asaas payment IDs are typically pay_xxxxxxxx (alphanumeric + underscore). Reject anything that could be path injection or invalid. */
const ASAAS_PAYMENT_ID_REGEX = /^pay_[a-zA-Z0-9_]+$/;

function isValidAsaasPaymentId(id: string): boolean {
  return typeof id === "string" && id.length <= 64 && ASAAS_PAYMENT_ID_REGEX.test(id);
}

export async function POST(req: Request) {
  try {
    const webhookToken = await getPlatformAsaasWebhookToken();
    if (webhookToken) {
      const received = req.headers.get("asaas-access-token");
      if (received !== webhookToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await req.json()) as AsaasWebhookPayload;
    const event = body.event;
    const paymentId = body.payment?.id;

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment id" }, { status: 400 });
    }
    if (!isValidAsaasPaymentId(paymentId)) {
      return NextResponse.json({ error: "Invalid payment id format" }, { status: 400 });
    }

    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      const now = new Date();

      // Idempotency: only update payments that are still pending
      const updatedPayment = await db
        .update(payments)
        .set({ status: "paid", paidAt: now, method: "asaas", updatedAt: now })
        .where(
          and(eq(payments.asaasPaymentId, paymentId), eq(payments.status, "pending"))
        )
        .returning({ id: payments.id });

      if (updatedPayment.length > 0) {
        return NextResponse.json({ ok: true, type: "payment" });
      }

      const updatedCharge = await db
        .update(platformCharges)
        .set({ status: "paid", paidAt: now })
        .where(
          and(
            eq(platformCharges.asaasPaymentId, paymentId),
            eq(platformCharges.status, "pending")
          )
        )
        .returning({ id: platformCharges.id });

      if (updatedCharge.length > 0) {
        return NextResponse.json({ ok: true, type: "platform_charge" });
      }
    }

    return NextResponse.json({ ok: true, ignored: true });
  } catch (e) {
    console.error("[Webhook Asaas]", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

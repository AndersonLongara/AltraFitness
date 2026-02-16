/**
 * Configuração Asaas da plataforma (cobranças Super Admin).
 * Lê do banco (platform_settings); se não houver valor, usa variáveis de ambiente.
 */

import { db } from "@/db";
import { platformSettings } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

const KEYS = {
  API_KEY: "asaas_api_key",
  SANDBOX: "asaas_sandbox",
  WEBHOOK_TOKEN: "asaas_webhook_token",
} as const;

export type PlatformAsaasConfig = {
  apiKey: string | null;
  sandbox: boolean;
  webhookToken: string | null;
  /** Para exibição no painel: se a chave está definida (sem revelar o valor) */
  hasApiKey: boolean;
  hasWebhookToken: boolean;
};

export async function getPlatformAsaasConfig(): Promise<PlatformAsaasConfig> {
  const rows = await db
    .select()
    .from(platformSettings)
    .where(inArray(platformSettings.key, [KEYS.API_KEY, KEYS.SANDBOX, KEYS.WEBHOOK_TOKEN]));

  // platformSettings has key primary, so we get at most 3 rows - one per key
  const byKey: Record<string, string | null> = {};
  for (const r of rows) {
    byKey[r.key] = r.value;
  }

  const dbApiKey = byKey[KEYS.API_KEY] ?? null;
  const dbSandbox = byKey[KEYS.SANDBOX];
  const dbWebhookToken = byKey[KEYS.WEBHOOK_TOKEN] ?? null;

  const apiKeyDb = dbApiKey?.trim() || null;
  const apiKeyEnv = process.env.ASAAS_API_KEY?.trim() || null;
  const apiKey = apiKeyDb ?? apiKeyEnv;

  const sandbox =
    dbSandbox !== undefined && dbSandbox !== null
      ? dbSandbox === "true"
      : process.env.ASAAS_SANDBOX === "true";

  const webhookTokenDb = dbWebhookToken?.trim() || null;
  const webhookTokenEnv = process.env.ASAAS_WEBHOOK_TOKEN?.trim() || null;
  const webhookToken = webhookTokenDb ?? webhookTokenEnv;

  return {
    apiKey,
    sandbox,
    webhookToken,
    hasApiKey: !!apiKey,
    hasWebhookToken: !!webhookToken,
  };
}

/**
 * Retorna apenas o token do webhook (para validação no endpoint).
 * Usa banco primeiro, depois env.
 */
export async function getPlatformAsaasWebhookToken(): Promise<string | null> {
  const row = await db
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, KEYS.WEBHOOK_TOKEN))
    .limit(1);

  const dbVal = row[0]?.value?.trim() || null;
  if (dbVal) return dbVal;
  return process.env.ASAAS_WEBHOOK_TOKEN?.trim() || null;
}

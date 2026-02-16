/**
 * Cliente API Asaas — cobranças PIX, Boleto, Cartão
 * Docs: https://docs.asaas.com/
 */

const SANDBOX_URL = "https://api-sandbox.asaas.com/api/v3";
const PRODUCTION_URL = "https://api.asaas.com/api/v3";

function getBaseUrl(sandbox?: boolean): string {
  if (sandbox !== undefined) return sandbox ? SANDBOX_URL : PRODUCTION_URL;
  return process.env.ASAAS_SANDBOX === "true" ? SANDBOX_URL : PRODUCTION_URL;
}

export type BillingType = "PIX" | "BOLETO" | "CREDIT_CARD" | "DEBIT_CARD" | "UNDEFINED";

export type AsaasOptions = { apiKey?: string | null; sandbox?: boolean };

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj?: string;
  email?: string;
  mobilePhone?: string;
}

export interface CreateCustomerInput {
  name: string;
  cpfCnpj?: string;
  email?: string;
  mobilePhone?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  province?: string;
  city?: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  dueDate: string;
  status: string;
  billingType: BillingType;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  invoiceNumber?: string;
}

export interface CreatePaymentInput {
  customer: string;
  value: number; // em reais (ex: 99.90)
  dueDate: string; // YYYY-MM-DD
  billingType: BillingType;
  description?: string;
}

function getApiKey(apiKey?: string | null): string {
  const key = apiKey ?? process.env.ASAAS_API_KEY;
  if (!key) throw new Error("Chave API Asaas não configurada. Configure em Super Admin → Configurações.");
  return key;
}

async function asaasFetch<T>(
  path: string,
  options: RequestInit & { apiKey?: string | null; sandbox?: boolean } = {}
): Promise<T> {
  const { apiKey, sandbox, ...rest } = options;
  const key = getApiKey(apiKey);
  const base = getBaseUrl(sandbox);
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      access_token: key,
      ...rest.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.errors?.[0]?.description ?? data.message ?? res.statusText;
    throw new Error(`Asaas: ${msg}`);
  }
  return data as T;
}

/**
 * Cria ou atualiza cliente no Asaas (por nome, CPF/CNPJ, email, telefone).
 * Retorna o id do customer para usar em cobranças.
 */
export async function createCustomer(
  input: CreateCustomerInput,
  apiKey?: string | null,
  opts?: AsaasOptions
): Promise<{ id: string }> {
  const key = apiKey ?? opts?.apiKey;
  const body: Record<string, string | undefined> = {
    name: input.name,
    cpfCnpj: input.cpfCnpj?.replace(/\D/g, "").slice(0, 14) || undefined,
    email: input.email || undefined,
    mobilePhone: input.mobilePhone?.replace(/\D/g, "").slice(0, 11) || undefined,
    postalCode: input.postalCode?.replace(/\D/g, "").slice(0, 8) || undefined,
    address: input.address,
    addressNumber: input.addressNumber,
    province: input.province,
    city: input.city,
  };
  const created = await asaasFetch<{ id: string }>("/customers", {
    method: "POST",
    body: JSON.stringify(body),
    apiKey: key,
    sandbox: opts?.sandbox,
  });
  return { id: created.id };
}

/**
 * Cria uma cobrança no Asaas.
 * value em reais; dueDate YYYY-MM-DD.
 * Retorna id, invoiceUrl (link para pagar), status.
 */
export async function createPayment(
  input: CreatePaymentInput,
  apiKey?: string | null,
  opts?: AsaasOptions
): Promise<{ id: string; invoiceUrl?: string; bankSlipUrl?: string; status: string }> {
  const key = apiKey ?? opts?.apiKey;
  const body = {
    customer: input.customer,
    value: Number(input.value),
    dueDate: input.dueDate,
    billingType: input.billingType,
    description: input.description ?? undefined,
  };
  const created = await asaasFetch<{
    id: string;
    invoiceUrl?: string;
    bankSlipUrl?: string;
    status: string;
  }>("/payments", {
    method: "POST",
    body: JSON.stringify(body),
    apiKey: key,
    sandbox: opts?.sandbox,
  });
  return {
    id: created.id,
    invoiceUrl: created.invoiceUrl,
    bankSlipUrl: created.bankSlipUrl,
    status: created.status,
  };
}

/**
 * Consulta status de um pagamento no Asaas.
 */
export async function getPayment(
  paymentId: string,
  apiKey?: string | null,
  opts?: AsaasOptions
): Promise<{ status: string; value: number; paidValue?: number; paymentDate?: string }> {
  const key = apiKey ?? opts?.apiKey;
  const data = await asaasFetch<{
    status: string;
    value: number;
    paidValue?: number;
    paymentDate?: string;
  }>(`/payments/${paymentId}`, { apiKey: key, sandbox: opts?.sandbox });
  return data;
}

export type SubscriptionCycle = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "QUARTERLY" | "SEMIANNUALLY" | "YEARLY";

/** Lista pagamentos de uma assinatura (para obter invoiceUrl do primeiro). */
export async function getSubscriptionPayments(
  subscriptionId: string,
  apiKey?: string | null,
  opts?: AsaasOptions
): Promise<{ data: Array<{ id: string; invoiceUrl?: string; status: string }> }> {
  const key = apiKey ?? opts?.apiKey;
  const res = await asaasFetch<{ data: Array<{ id: string; invoiceUrl?: string; status: string }> }>(
    `/subscriptions/${subscriptionId}/payments`,
    { apiKey: key, sandbox: opts?.sandbox }
  );
  return res ?? { data: [] };
}

export interface CreateSubscriptionInput {
  customer: string;
  billingType: BillingType;
  value: number;
  nextDueDate: string; // YYYY-MM-DD
  cycle: SubscriptionCycle;
  description?: string;
  externalReference?: string;
  callback?: { successUrl?: string };
}

/** Cria assinatura no Asaas (cobrança recorrente). Retorna id da assinatura. */
export async function createSubscription(
  input: CreateSubscriptionInput,
  apiKey?: string | null,
  opts?: AsaasOptions
): Promise<{ id: string }> {
  const key = apiKey ?? opts?.apiKey;
  const body = {
    customer: input.customer,
    billingType: input.billingType,
    value: input.value,
    nextDueDate: input.nextDueDate,
    cycle: input.cycle,
    description: input.description ?? undefined,
    externalReference: input.externalReference ?? undefined,
    callback: input.callback ?? undefined,
  };
  const created = await asaasFetch<{ id: string }>("/subscriptions", {
    method: "POST",
    body: JSON.stringify(body),
    apiKey: key,
    sandbox: opts?.sandbox,
  });
  return { id: created.id };
}

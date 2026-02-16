import { db } from "@/db";
import { trainers } from "@/db/schema";
import { isNotNull } from "drizzle-orm";

/**
 * Normaliza CPF para apenas dígitos (11 caracteres) para comparação.
 */
export function normalizeCpf(cpf: string | null | undefined): string {
  if (!cpf) return "";
  return String(cpf).replace(/\D/g, "").slice(0, 11);
}

/**
 * Verifica se o CPF já está em uso por outro personal na plataforma.
 * @param cpf CPF (pode ser formatado ou só números)
 * @param excludeTrainerId Se informado, ignora este trainer (ex.: atualização ou reclaim)
 * @returns true se outro trainer já usa este CPF
 */
export async function isCpfUsedByAnotherTrainer(
  cpf: string | null | undefined,
  excludeTrainerId?: string
): Promise<boolean> {
  const normalized = normalizeCpf(cpf);
  if (!normalized || normalized.length < 11) return false;
  const rows = await db
    .select({ id: trainers.id, cpf: trainers.cpf })
    .from(trainers)
    .where(isNotNull(trainers.cpf));
  return rows.some(
    (r) => r.id !== excludeTrainerId && normalizeCpf(r.cpf) === normalized
  );
}

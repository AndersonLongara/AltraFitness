/**
 * Reassocia um personal "órfão" (conta Clerk excluída) à nova conta do usuário.
 * Usado quando o e-mail já existe em trainers mas com outro user.id (Clerk).
 */
import { db } from "@/db";
import {
  trainers,
  userRoles,
  plans,
  payments,
  platformCharges,
  students,
  leads,
  exercises,
  workoutPlans,
  workouts,
  nutritionalPlans,
  assessments,
  foods,
  forms,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { isCpfUsedByAnotherTrainer } from "@/lib/trainer-cpf";

export interface ReassignTrainerInput {
  oldTrainerId: string;
  newUserId: string;
  newTrainerData: {
    name: string;
    email: string;
    cpf?: string | null;
    phone?: string | null;
    birthDate?: Date | null;
    presentialStudents?: number;
    onlineStudents?: number;
    subscriptionPlan: string;
    subscriptionStatus: string;
    trialEndsAt?: Date | null;
  };
}

/**
 * Reassocia o personal órfão (conta antiga excluída no Clerk) à nova conta.
 * Preserva teamCode e dados dos alunos/planos.
 */
export async function reassignOrphanedTrainer(input: ReassignTrainerInput): Promise<void> {
  const { oldTrainerId, newUserId, newTrainerData } = input;

  const oldTrainer = await db.query.trainers.findFirst({
    where: eq(trainers.id, oldTrainerId),
    columns: { teamCode: true, asaasCustomerId: true },
  });
  if (!oldTrainer) throw new Error("Personal antigo não encontrado.");

  // Uma conta por CPF: o CPF do novo cadastro não pode estar em outro personal (que não o que estamos reassociando)
  if (
    newTrainerData.cpf &&
    (await isCpfUsedByAnotherTrainer(newTrainerData.cpf, oldTrainerId))
  ) {
    throw new Error("Já existe uma conta cadastrada com este CPF. Não é permitido mais de uma conta por CPF.");
  }

  const tempEmail = `${oldTrainerId}_reclaim_${Date.now()}@orphaned.local`;

  // 1. Liberar e-mail único: atualizar o antigo com e-mail temporário
  await db
    .update(trainers)
    .set({ email: tempEmail, updatedAt: new Date() })
    .where(eq(trainers.id, oldTrainerId));

  // 2. Inserir novo personal com o e-mail do usuário
  await db.insert(trainers).values({
    id: newUserId,
    name: newTrainerData.name,
    email: newTrainerData.email,
    cpf: newTrainerData.cpf ?? null,
    phone: newTrainerData.phone ?? null,
    birthDate: newTrainerData.birthDate ?? null,
    presentialStudents: newTrainerData.presentialStudents ?? 0,
    onlineStudents: newTrainerData.onlineStudents ?? 0,
    teamCode: oldTrainer.teamCode,
    subscriptionPlan: newTrainerData.subscriptionPlan,
    subscriptionStatus: newTrainerData.subscriptionStatus,
    trialEndsAt: newTrainerData.trialEndsAt ?? null,
    asaasCustomerId: oldTrainer.asaasCustomerId,
    theme: 'system',
  });

  // 3. Atualizar referências em todas as tabelas
  await db.update(plans).set({ trainerId: newUserId }).where(eq(plans.trainerId, oldTrainerId));
  await db.update(payments).set({ trainerId: newUserId }).where(eq(payments.trainerId, oldTrainerId));
  await db.update(platformCharges).set({ trainerId: newUserId }).where(eq(platformCharges.trainerId, oldTrainerId));
  await db.update(students).set({ trainerId: newUserId }).where(eq(students.trainerId, oldTrainerId));
  await db.update(leads).set({ trainerId: newUserId }).where(eq(leads.trainerId, oldTrainerId));
  await db.update(exercises).set({ trainerId: newUserId }).where(eq(exercises.trainerId, oldTrainerId));
  await db.update(workoutPlans).set({ trainerId: newUserId }).where(eq(workoutPlans.trainerId, oldTrainerId));
  await db.update(workouts).set({ trainerId: newUserId }).where(eq(workouts.trainerId, oldTrainerId));
  await db.update(nutritionalPlans).set({ trainerId: newUserId }).where(eq(nutritionalPlans.trainerId, oldTrainerId));
  await db.update(assessments).set({ trainerId: newUserId }).where(eq(assessments.trainerId, oldTrainerId));
  await db.update(forms).set({ trainerId: newUserId }).where(eq(forms.trainerId, oldTrainerId));
  // foods pode ter trainerId null (sistema)
  await db.update(foods).set({ trainerId: newUserId }).where(eq(foods.trainerId, oldTrainerId));

  // 4. Remover user_roles do antigo
  await db.delete(userRoles).where(eq(userRoles.userId, oldTrainerId));

  // 5. Deletar o registro antigo do personal
  await db.delete(trainers).where(eq(trainers.id, oldTrainerId));
}

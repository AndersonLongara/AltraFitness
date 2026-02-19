import { db } from "@/db";
import { workouts, workoutPlans, workoutDateOverrides } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { startOfDay } from "date-fns";

/**
 * 0 = Segunda, 1 = Terça, ... 6 = Domingo (JS getDay(): 0=Dom, 1=Seg -> (getDay()+6)%7)
 */
function getDayOfWeekPT(date: Date): number {
    return (date.getDay() + 6) % 7;
}

/**
 * Retorna o treino do dia para o aluno na data dada.
 * Ordem: 1) override do aluno (substituir dia), 2) scheduledDate (legado), 3) suggestedDayOfWeek do plano ativo.
 */
export async function getDailyWorkout(studentId: string, date: Date) {
    const queryDate = startOfDay(date);
    const queryDateSeconds = Math.floor(queryDate.getTime() / 1000); // Unix seconds para comparação
    const dayOfWeek = getDayOfWeekPT(date);

    // 1) Override do aluno: "neste dia quero fazer este treino" (ignora se tabela não existir ou query falhar)
    try {
        const override = await db.query.workoutDateOverrides.findFirst({
            where: and(
                eq(workoutDateOverrides.studentId, studentId),
                eq(workoutDateOverrides.targetDate, queryDateSeconds)
            ),
        });
        if (override) {
            const w = await db.query.workouts.findFirst({
                where: eq(workouts.id, override.workoutId),
                with: { items: true },
            });
            return w ?? null;
        }
    } catch {
        // Tabela workout_date_overrides pode não existir ou formato de data incompatível; segue sem override
    }

    // 2) Legado: treino com scheduledDate = esta data
    const byScheduled = await db.query.workouts.findFirst({
        where: and(
            eq(workouts.studentId, studentId),
            eq(workouts.scheduledDate, queryDate)
        ),
        with: { items: true },
    });
    if (byScheduled) return byScheduled;

    // 3) Por dia da semana sugerido no plano ativo
    const activePlan = await db.query.workoutPlans.findFirst({
        where: and(
            eq(workoutPlans.studentId, studentId),
            eq(workoutPlans.active, true)
        ),
        with: {
            workouts: {
                with: { items: true },
            },
        },
    });
    if (!activePlan?.workouts?.length) return null;

    const bySuggested = activePlan.workouts.find(
        (w) => w.suggestedDayOfWeek != null && w.suggestedDayOfWeek === dayOfWeek
    );
    return bySuggested ?? null;
}

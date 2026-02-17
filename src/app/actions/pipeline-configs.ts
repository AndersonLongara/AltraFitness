"use server";

import { db } from "@/db";
import { pipelineConfigs, forms } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTrainer } from "@/lib/auth-helpers";

/**
 * Get pipeline configurations for the current trainer
 */
export async function getPipelineConfigs() {
    const trainer = await getCurrentTrainer();
    
    const configs = await db.query.pipelineConfigs.findMany({
        where: eq(pipelineConfigs.trainerId, trainer.id),
        with: {
            form: true,
        },
        orderBy: (configs, { asc }) => [asc(configs.pipelineStage)],
    });
    
    return configs;
}

/**
 * Update or create pipeline configuration for a specific stage
 */
export async function updatePipelineConfig(
    pipelineStage: string,
    formId: string | null
) {
    const trainer = await getCurrentTrainer();
    
    // Check if config already exists
    const existing = await db.query.pipelineConfigs.findFirst({
        where: and(
            eq(pipelineConfigs.trainerId, trainer.id),
            eq(pipelineConfigs.pipelineStage, pipelineStage)
        ),
    });
    
    if (existing) {
        // Update existing
        await db.update(pipelineConfigs)
            .set({
                formId,
                updatedAt: new Date(),
            })
            .where(eq(pipelineConfigs.id, existing.id));
    } else {
        // Create new
        await db.insert(pipelineConfigs).values({
            trainerId: trainer.id,
            pipelineStage,
            formId,
        });
    }
    
    return { success: true };
}

/**
 * Get the configured questionnaire for a specific pipeline stage
 */
export async function getQuestionnaireForStage(trainerId: string, pipelineStage: string) {
    const config = await db.query.pipelineConfigs.findFirst({
        where: and(
            eq(pipelineConfigs.trainerId, trainerId),
            eq(pipelineConfigs.pipelineStage, pipelineStage),
            eq(pipelineConfigs.isActive, true)
        ),
        with: {
            form: true,
        },
    });
    
    return config?.form || null;
}

/**
 * Toggle pipeline config active status
 */
export async function togglePipelineConfig(configId: string, isActive: boolean) {
    const trainer = await getCurrentTrainer();
    
    // Verify ownership
    const config = await db.query.pipelineConfigs.findFirst({
        where: and(
            eq(pipelineConfigs.id, configId),
            eq(pipelineConfigs.trainerId, trainer.id)
        ),
    });
    
    if (!config) throw new Error("Configuração não encontrada");
    
    await db.update(pipelineConfigs)
        .set({
            isActive,
            updatedAt: new Date(),
        })
        .where(eq(pipelineConfigs.id, configId));
    
    return { success: true };
}

'use server';

import { db } from "@/db";
import { assessments, assessmentPhotos } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { AssessmentInput, calculateAssessment } from "@/services/assessments";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

// --- Types ---

export type CreateAssessmentData = AssessmentInput & {
    studentId: string;
    date: Date;
    method: 'pollock3' | 'pollock7' | 'guedes' | 'bioimpedance';
    circumferences?: {
        neck?: number;
        shoulder?: number;
        chestCircumference?: number;
        waist?: number;
        abdomen?: number;
        hips?: number;
        armRight?: number;
        armLeft?: number;
        forearmRight?: number;
        forearmLeft?: number;
        thighRight?: number;
        thighLeft?: number;
        calfRight?: number;
        calfLeft?: number;
    };
    observations?: string;
    photos?: {
        type: 'front' | 'back' | 'side_left' | 'side_right' | 'other';
        url: string;
    }[];
};

// --- Actions ---

export async function createAssessment(data: CreateAssessmentData) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const trainerId = user.id;

    try {
        // 1. Calculate Results
        const results = calculateAssessment(data, data.method);

        // 2. Prepare DB Object (converting units if necessary)
        const assessmentId = crypto.randomUUID();

        await db.transaction(async (tx) => {
            // Insert Assessment
            await tx.insert(assessments).values({
                id: assessmentId,
                trainerId,
                studentId: data.studentId,
                date: data.date,
                method: data.method,

                // Anthropometry
                weight: Math.round(data.weight * 1000), // kg -> grams
                height: Math.round(data.height), // cm

                // Skinfolds
                triceps: data.skinfolds?.triceps,
                subscapular: data.skinfolds?.subscapular,
                chest: data.skinfolds?.chest,
                axillary: data.skinfolds?.axillary,
                suprailiac: data.skinfolds?.suprailiac,
                abdominal: data.skinfolds?.abdominal,
                thigh: data.skinfolds?.thigh,

                // Bioimpedance
                bioimpedanceBodyFat: data.bioimpedance?.bodyFat ? Math.round(data.bioimpedance.bodyFat * 100) : null,
                bioimpedanceLeanMass: data.bioimpedance?.leanMass ? Math.round(data.bioimpedance.leanMass * 1000) : null,

                // Circumferences
                ...data.circumferences,

                // Calculated Results
                bodyFat: Math.round(results.bodyFat * 100),
                leanMass: Math.round(results.leanMass * 1000), // g
                fatMass: Math.round(results.fatMass * 1000), // g
                bmi: Math.round(results.bmi * 100),
                basalMetabolicRate: results.bmr.katchMcArdle || results.bmr.harrisBenedict, // Prefer Katch if available
                density: results.density ? Math.round(results.density * 10000) : null,

                observations: data.observations,
            });

            // Insert Photos
            if (data.photos && data.photos.length > 0) {
                await tx.insert(assessmentPhotos).values(
                    data.photos.map(photo => ({
                        assessmentId,
                        type: photo.type,
                        photoUrl: photo.url,
                    }))
                );
            }
        });

        revalidatePath(`/dashboard/students/${data.studentId}`);
        revalidatePath(`/dashboard/students/${data.studentId}/assessments`);

        return { success: true, assessmentId };

    } catch (error) {
        console.error("Failed to create assessment:", error);
        throw new Error("Failed to create assessment");
    }
}

export async function deleteAssessment(assessmentId: string, studentId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    try {
        await db.delete(assessments).where(and(eq(assessments.id, assessmentId), eq(assessments.trainerId, user.id)));
        revalidatePath(`/dashboard/students/${studentId}`);
        revalidatePath(`/dashboard/students/${studentId}/assessments`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete assessment:", error);
        throw new Error("Failed to delete assessment");
    }
}

export async function getStudentAssessments(studentId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const data = await db.query.assessments.findMany({
        where: eq(assessments.studentId, studentId),
        orderBy: [desc(assessments.date)],
        with: {
            photos: true
        }
    });

    return data.map(assessment => ({
        ...assessment,
        weight: assessment.weight / 1000,
        bodyFat: assessment.bodyFat ? assessment.bodyFat / 100 : null,
        leanMass: assessment.leanMass ? assessment.leanMass / 1000 : null,
        fatMass: assessment.fatMass ? assessment.fatMass / 1000 : null,
        bmi: assessment.bmi ? assessment.bmi / 100 : null,
        density: assessment.density ? assessment.density / 10000 : null,
        bioimpedanceBodyFat: assessment.bioimpedanceBodyFat ? assessment.bioimpedanceBodyFat / 100 : null,
        bioimpedanceLeanMass: assessment.bioimpedanceLeanMass ? assessment.bioimpedanceLeanMass / 1000 : null,
    }));
}

export async function getAssessment(id: string) {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.id, id),
        with: {
            photos: true
        }
    });

    if (!assessment) return null;

    return {
        ...assessment,
        weight: assessment.weight / 1000,
        bodyFat: assessment.bodyFat ? assessment.bodyFat / 100 : null,
        leanMass: assessment.leanMass ? assessment.leanMass / 1000 : null,
        fatMass: assessment.fatMass ? assessment.fatMass / 1000 : null,
        bmi: assessment.bmi ? assessment.bmi / 100 : null,
        density: assessment.density ? assessment.density / 10000 : null,
        bioimpedanceBodyFat: assessment.bioimpedanceBodyFat ? assessment.bioimpedanceBodyFat / 100 : null,
        bioimpedanceLeanMass: assessment.bioimpedanceLeanMass ? assessment.bioimpedanceLeanMass / 1000 : null,
    };
}

// --- Intelligence & Reports ---

export async function generateComparisonReport(currentId: string, previousId: string) {
    // Fetch both
    const [current, previous] = await Promise.all([
        db.query.assessments.findFirst({ where: eq(assessments.id, currentId) }),
        db.query.assessments.findFirst({ where: eq(assessments.id, previousId) })
    ]);

    if (!current || !previous) return null;

    // Helper to format values
    const fmt = (val: number | null, div = 1) => val ? (val / div) : 0;

    // Calculate Deltas
    const deltas = {
        weight: fmt(current.weight, 1000) - fmt(previous.weight, 1000),
        bodyFat: fmt(current.bodyFat, 100) - fmt(previous.bodyFat, 100),
        leanMass: fmt(current.leanMass, 1000) - fmt(previous.leanMass, 1000),
        fatMass: fmt(current.fatMass, 1000) - fmt(previous.fatMass, 1000),
    };

    // Prepare Context for AI
    const prompt = `
    Analyze the physical evolution of this student between two assessments.
    
    PREVIOUS (${previous.date.toLocaleDateString()}):
    - Weight: ${fmt(previous.weight, 1000)}kg
    - Body Fat: ${fmt(previous.bodyFat, 100)}%
    - Lean Mass: ${fmt(previous.leanMass, 1000)}kg
    - Fat Mass: ${fmt(previous.fatMass, 1000)}kg

    CURRENT (${current.date.toLocaleDateString()}):
    - Weight: ${fmt(current.weight, 1000)}kg
    - Body Fat: ${fmt(current.bodyFat, 100)}%
    - Lean Mass: ${fmt(current.leanMass, 1000)}kg
    - Fat Mass: ${fmt(current.fatMass, 1000)}kg

    DELTAS (Change):
    - Weight: ${deltas.weight.toFixed(2)}kg
    - Body Fat: ${deltas.bodyFat.toFixed(2)}%
    - Lean Mass: ${deltas.leanMass.toFixed(2)}kg
    - Fat Mass: ${deltas.fatMass.toFixed(2)}kg

    Generate a short, motivating summary for the trainer to send to the student. 
    Focus on the "Wins" (e.g. lost fat, gained muscle).
    If the goal was met (e.g. active fat loss), suggest a next step.
    Language: Portuguese (Brazil). Tone: Professional, Encouraging, Coach-like.
    Max length: 3 sentences.
    `;

    try {
        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: prompt,
        });
        return { deltas, aiSummary: text };
    } catch (e) {
        console.error("AI Generation failed", e);
        return { deltas, aiSummary: "Parabéns pela evolução! Continue focado nos treinos." };
    }
}

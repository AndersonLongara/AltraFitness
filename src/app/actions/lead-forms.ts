"use server";

import { db } from "@/db";
import { leadForms, leadFormAnswers, forms, formQuestions, leads, pipelineConfigs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTrainer } from "@/lib/auth-helpers";

/**
 * Assign a form to a lead, generating a public access token
 */
export async function assignFormToLead(formId: string, leadId: string) {
    const trainer = await getCurrentTrainer();
    
    // Verify the form belongs to this trainer
    const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, formId), eq(forms.trainerId, trainer.id))
    });
    
    if (!form) throw new Error("Formulário não encontrado");
    
    // Verify the lead belongs to this trainer
    const lead = await db.query.leads.findFirst({
        where: and(eq(leads.id, leadId), eq(leads.trainerId, trainer.id))
    });
    
    if (!lead) throw new Error("Lead não encontrado");
    
    // Check if there's already a pending form for this lead
    const existingAssignment = await db.query.leadForms.findFirst({
        where: and(
            eq(leadForms.leadId, leadId),
            eq(leadForms.formId, formId),
            eq(leadForms.status, 'pending')
        )
    });
    
    if (existingAssignment) {
        return { token: existingAssignment.token };
    }
    
    // Create new assignment
    const [assignment] = await db.insert(leadForms).values({
        leadId,
        formId,
        token: crypto.randomUUID(),
        status: 'pending',
        assignedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }).returning();
    
    return { token: assignment.token };
}

/**
 * Get lead form by token (PUBLIC - no auth required)
 * Used by the public form page /f/[token]
 */
export async function getLeadFormByToken(token: string) {
    const assignment = await db.query.leadForms.findFirst({
        where: eq(leadForms.token, token),
        with: {
            form: {
                with: {
                    questions: {
                        orderBy: (questions, { asc }) => [asc(questions.order)]
                    },
                    trainer: true
                }
            },
            lead: true
        }
    });
    
    if (!assignment) return null;
    
    // Check if expired
    if (assignment.expiresAt && assignment.expiresAt < new Date()) {
        return null;
    }
    
    // Check if already completed
    if (assignment.status === 'completed') {
        return { ...assignment, alreadyCompleted: true };
    }
    
    return assignment;
}

/**
 * Submit lead form response (PUBLIC - no auth required)
 */
export async function submitLeadFormResponse(
    token: string,
    answers: { questionId: string; answer: string }[]
) {
    const assignment = await db.query.leadForms.findFirst({
        where: eq(leadForms.token, token)
    });
    
    if (!assignment) throw new Error("Formulário não encontrado");
    
    if (assignment.status === 'completed') {
        throw new Error("Este formulário já foi respondido");
    }
    
    if (assignment.expiresAt && assignment.expiresAt < new Date()) {
        throw new Error("Este formulário expirou");
    }
    
    // Save answers
    await db.insert(leadFormAnswers).values(
        answers.map(a => ({
            responseId: assignment.id,
            questionId: a.questionId,
            answer: a.answer
        }))
    );
    
    // Mark as completed
    await db.update(leadForms)
        .set({
            status: 'completed',
            completedAt: new Date()
        })
        .where(eq(leadForms.id, assignment.id));
    
    return { success: true };
}

/**
 * Get all form responses for a lead (trainer-only)
 */
export async function getLeadFormResponses(leadId: string) {
    const trainer = await getCurrentTrainer();
    
    // Verify lead belongs to trainer
    const lead = await db.query.leads.findFirst({
        where: and(eq(leads.id, leadId), eq(leads.trainerId, trainer.id))
    });
    
    if (!lead) throw new Error("Lead não encontrado");
    
    const responses = await db.query.leadForms.findMany({
        where: eq(leadForms.leadId, leadId),
        with: {
            form: true,
            answers: {
                with: {
                    question: true
                }
            }
        },
        orderBy: (leadForms, { desc }) => [desc(leadForms.assignedAt)]
    });
    
    return responses;
}

/**
 * Get all lead questionnaire templates for the current trainer
 */
export async function getLeadQuestionnaireTemplates() {
    const trainer = await getCurrentTrainer();
    
    const templates = await db.query.forms.findMany({
        where: and(
            eq(forms.trainerId, trainer.id),
            eq(forms.type, 'lead_questionnaire')
        ),
        with: {
            questions: {
                orderBy: (questions, { asc }) => [asc(questions.order)]
            }
        },
        orderBy: (forms, { desc }) => [desc(forms.createdAt)]
    });
    
    return templates;
}

/**
 * Auto-assign forms when a lead moves to a specific stage (based on pipeline configs)
 */
export async function assignFormToLeadOnStageChange(leadId: string, newStage: string) {
    // Get the lead to find the trainer
    const lead = await db.query.leads.findFirst({
        where: eq(leads.id, leadId)
    });
    
    if (!lead) return;
    
    // Check if there's a pipeline config for this stage
    const config = await db.query.pipelineConfigs.findFirst({
        where: and(
            eq(pipelineConfigs.trainerId, lead.trainerId),
            eq(pipelineConfigs.pipelineStage, newStage),
            eq(pipelineConfigs.isActive, true)
        ),
        with: {
            form: true
        }
    });
    
    // If no config or no form assigned, return
    if (!config || !config.formId) return;
    
    // Check if already assigned
    const existing = await db.query.leadForms.findFirst({
        where: and(
            eq(leadForms.leadId, leadId),
            eq(leadForms.formId, config.formId)
        )
    });
    
    if (existing) return;
    
    // Assign the form
    await db.insert(leadForms).values({
        leadId,
        formId: config.formId,
        token: crypto.randomUUID(),
        status: 'pending',
        assignedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
}

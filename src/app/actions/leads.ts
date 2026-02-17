'use server';

import { db } from "@/db";
import { leads, students, trainers, forms, studentForms, plans, payments } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createLead(data: { name: string; phone?: string; socialHandle?: string; photoUrl?: string }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    let finalPhotoUrl = data.photoUrl;

    // Persist Instagram image as Base64 to avoid expiration/hotlinking
    if (data.photoUrl && data.photoUrl.includes('cdninstagram') || data.photoUrl?.includes('fbcdn.net')) {
        try {
            const response = await fetch(data.photoUrl);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString('base64');
                const contentType = response.headers.get('content-type') || 'image/jpeg';
                finalPhotoUrl = `data:${contentType};base64,${base64}`;
            }
        } catch (error) {
            console.error("Failed to download/persist Instagram image:", error);
            // Fallback to original URL
        }
    }

    await db.insert(leads).values({
        trainerId: userId,
        name: data.name,
        phone: data.phone || "",
        socialHandle: data.socialHandle,
        photoUrl: finalPhotoUrl,
        status: "new",
    });

    revalidatePath("/dashboard/students");
    revalidatePath("/dashboard/sales");
}

export async function getLeads() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await db.query.leads.findMany({
        where: eq(leads.trainerId, userId),
        orderBy: [desc(leads.createdAt)],
    });
}

// CRM Actions
export async function updateLeadStage(id: string, stage: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    // Get the lead to check if it's already converted
    const lead = await db.query.leads.findFirst({
        where: and(eq(leads.id, id), eq(leads.trainerId, userId)),
    });
    
    if (!lead) throw new Error("Lead not found");
    
    // Prevent moving converted leads back to pipeline stages
    if (lead.studentId) {
        // Only allow moving between won/lost for converted leads
        const allowedStages = ['won', 'lost'];
        const currentStage = lead.pipelineStage || 'new';
        
        if (!allowedStages.includes(currentStage) || !allowedStages.includes(stage)) {
            console.log('⚠️ Cannot move converted lead back to pipeline:', {
                leadId: id,
                currentStage,
                attemptedStage: stage,
                studentId: lead.studentId
            });
            throw new Error("Este lead já foi convertido em aluno e não pode retornar ao pipeline. Para ajustar, edite o aluno diretamente.");
        }
    }
    
    await db.update(leads)
        .set({ pipelineStage: stage, status: stage, updatedAt: new Date() })
        .where(and(eq(leads.id, id), eq(leads.trainerId, userId)));
    revalidatePath("/dashboard/sales");
}

export async function updateLeadMetadata(id: string, data: { temperature?: string; estimatedValue?: number; closedValue?: number | null; planId?: string | null }) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    console.log('💾 updateLeadMetadata called:', { id, data, userId });
    
    await db.update(leads)
        .set({ ...data, updatedAt: new Date() } as Record<string, unknown>)
        .where(and(eq(leads.id, id), eq(leads.trainerId, userId)));
    
    console.log('✅ updateLeadMetadata update completed');
    
    // Verify the data was saved
    const verifyLead = await db.query.leads.findFirst({
        where: and(eq(leads.id, id), eq(leads.trainerId, userId))
    });
    
    console.log('🔍 Verification - Lead after update:', {
        id: verifyLead?.id,
        planId: verifyLead?.planId,
        temperature: verifyLead?.temperature,
        estimatedValue: verifyLead?.estimatedValue,
        closedValue: verifyLead?.closedValue
    });
    
    revalidatePath("/dashboard/sales");
    console.log('✅ revalidatePath completed');
}

export async function updateLeadStageData(id: string, stageData: Record<string, any>) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Merge with existing data or replace? 
    // Usually replacing the stage-specific data is fine, but maybe we want to keep history?
    // For now, let's assume we are updating the current stage's data.
    // Drizzle SQLite JSON support might overwrite. 
    // Let's read first? Or just simple update.
    // The requirement implies documenting the current stage.
    // Let's do a simple update for now. 

    // Actually, to be safe, let's merge if possible, or just overwrite `stageData` field.
    // Given the prompt "cada fila tem campos novos", it implies the data changes as it moves.
    // Accessing `leads.stageData` might need casting.

    await db.update(leads)
        .set({ stageData: stageData as Record<string, unknown>, updatedAt: new Date() })
        .where(and(eq(leads.id, id), eq(leads.trainerId, userId)));
    revalidatePath("/dashboard/sales");
}

export async function updateLeadStatus(id: string, status: string) {
    // Legacy support, redirects to stage update
    return updateLeadStage(id, status);
}

// Migrated to convertLeadToStudent
export async function convertLead(leadId: string, accessTypes?: string[]) {
    // Legacy wrapper if needed, or remove if unused. 
    // SalesPageContent was using it, I will update it to usage convertLeadToStudent or deprecate this.
    // For now, let's keep it but ideally we switch to the new one.
    return null;
}

export async function convertLeadToStudent(leadId: string, planId: string, startDate: string, accessTypes?: string[]) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const lead = await db.query.leads.findFirst({
        where: and(eq(leads.id, leadId), eq(leads.trainerId, userId)),
    });

    if (!lead) throw new Error("Lead not found");

    // Check if lead was already converted to prevent duplicates
    if (lead.studentId) {
        console.log('⚠️ Lead already converted to student:', lead.studentId);
        
        // Return the existing student instead of creating a duplicate
        const existingStudent = await db.query.students.findFirst({
            where: eq(students.id, lead.studentId),
        });
        
        if (existingStudent) {
            return { 
                success: true, 
                studentId: existingStudent.id, 
                inviteToken: existingStudent.inviteToken,
                alreadyConverted: true
            };
        }
        
        // If student doesn't exist anymore (edge case), allow re-conversion
        console.log('⚠️ Student record not found, allowing re-conversion');
    }

    // Use the planId from lead if available, otherwise use the provided one
    const finalPlanId = lead.planId || planId;

    // Create Student linked to Plan with INACTIVE status (awaiting activation)
    const [newStudent] = await db.insert(students).values({
        trainerId: userId,
        name: lead.name,
        phone: lead.phone,
        active: false, // ⚠️ CHANGED: Student starts inactive, activates on first login
        inviteToken: crypto.randomUUID(),
        planId: finalPlanId,
        planEnd: new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() + 1)), // Default 1 month, should fetch plan duration ideally
        accessTypes: accessTypes || ['workout', 'nutrition'], // Default access
        photoUrl: lead.photoUrl,
        createdAt: new Date(),
    }).returning();

    // Fetch Plan to calculate end date correctly
    const plan = await db.query.plans.findFirst({
        where: eq(plans.id, finalPlanId),
    });

    if (plan) {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + plan.durationMonths);

        await db.update(students)
            .set({ planEnd: endDate })
            .where(eq(students.id, newStudent.id));

        // Get the proposed value from stageData (negotiation) or use plan price
        const proposedValue = lead.stageData?.proposalValue 
            ? parseFloat(String(lead.stageData.proposalValue)) * 100 // Convert R$ to cents
            : plan.price;

        // Generate Initial Payment Record (Pending) with the negotiated/proposed value
        await db.insert(payments).values({
            trainerId: userId,
            studentId: newStudent.id,
            planId: finalPlanId,
            amount: Math.round(proposedValue),
            dueDate: new Date(startDate),
            status: 'pending',
            notes: `Mensalidade inicial - Migração de Lead (${lead.name})${lead.stageData?.proposalValue ? ` - Valor negociado` : ''}`
        });
    }

    // Update Lead to 'won' and link to student to prevent duplicate conversions
    await db.update(leads)
        .set({ 
            pipelineStage: 'won', 
            status: 'converted',
            studentId: newStudent.id // ⚠️ ADDED: Link lead to student
        })
        .where(eq(leads.id, leadId));

    revalidatePath("/dashboard/sales");
    // 4. Trigger "On Signup" Forms
    const signupForms = await db.query.forms.findMany({
        where: and(eq(forms.trainerId, userId), eq(forms.triggerType, 'on_signup'), eq(forms.isActive, true)),
    });

    if (signupForms.length > 0) {
        await db.insert(studentForms).values(
            signupForms.map(f => ({
                formId: f.id,
                studentId: newStudent.id,
                status: 'pending'
            }))
        );
    }

    revalidatePath('/dashboard/leads');
    revalidatePath('/dashboard/students');

    return { success: true, studentId: newStudent.id, inviteToken: newStudent.inviteToken };
}

import { getInstagramProfile } from "@/services/instagram";

// ... (existing code)

export async function enrichInstagramProfile(handle: string) {
    try {
        // Sanitize handle (remove @ if present)
        const cleanHandle = handle.replace(/^@/, '').trim();

        if (!cleanHandle) return null;

        const profile = await getInstagramProfile(cleanHandle);
        
        if (!profile) return null;

        let finalPhotoUrl = profile.photoUrl;

        // Persist Instagram image as Base64 to avoid expiration/hotlinking
        if (profile.photoUrl && (profile.photoUrl.includes('cdninstagram') || profile.photoUrl.includes('fbcdn.net'))) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
                
                const response = await fetch(profile.photoUrl, {
                    signal: controller.signal
                });
                
                clearTimeout(timeout);
                
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const base64 = buffer.toString('base64');
                    const contentType = response.headers.get('content-type') || 'image/jpeg';
                    finalPhotoUrl = `data:${contentType};base64,${base64}`;
                }
            } catch (imgError) {
                console.error("Failed to download/persist Instagram image:", imgError);
                // Fallback to original URL
            }
        }

        return {
            ...profile,
            photoUrl: finalPhotoUrl
        };
    } catch (error) {
        console.error("Enrichment action failed:", error);
        return null;
    }
}

// Get active trainer plans for lead selection
export async function getTrainerPlans() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await db.query.plans.findMany({
        where: and(eq(plans.trainerId, userId), eq(plans.active, true)),
        orderBy: [desc(plans.createdAt)],
    });
}

// Get student created from a converted lead
export async function getStudentByLeadName(leadName: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const student = await db.query.students.findFirst({
        where: and(
            eq(students.trainerId, userId),
            eq(students.name, leadName)
        ),
        orderBy: [desc(students.createdAt)], // Get most recent
    });

    return student;
}

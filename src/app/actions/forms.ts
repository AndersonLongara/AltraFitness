'use server';

import { db } from '@/db';
import { forms, formQuestions, studentForms, formAnswers, students, trainers } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// --- Form Management (Trainer) ---

export async function getForms() {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    return await db.query.forms.findMany({
        where: eq(forms.trainerId, userId),
        orderBy: [desc(forms.createdAt)],
        with: {
            questions: {
                orderBy: (questions, { asc }) => [asc(questions.order)],
            },
            assignments: true,
        },
    });
}

export async function getFormById(formId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    return await db.query.forms.findFirst({
        where: and(eq(forms.id, formId), eq(forms.trainerId, userId)),
        with: {
            questions: {
                orderBy: (questions, { asc }) => [asc(questions.order)],
            },
        },
    });
}

export async function createForm(data: {
    title: string;
    description: string;
    type: string;
    triggerType: string;
    questions: {
        type: string;
        question: string;
        description?: string;
        options?: string[];
        required: boolean;
        order: number;
    }[];
}) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // 1. Create Form
    const [newForm] = await db.insert(forms).values({
        trainerId: userId,
        title: data.title,
        description: data.description,
        type: data.type,
        triggerType: data.triggerType,
    }).returning();

    // 2. Create Questions
    if (data.questions.length > 0) {
        await db.insert(formQuestions).values(
            data.questions.map((q) => ({
                formId: newForm.id,
                type: q.type,
                question: q.question,
                description: q.description,
                options: q.options,
                required: q.required,
                order: q.order,
            }))
        );
    }

    revalidatePath('/dashboard/forms');
    return newForm;
}

export async function updateForm(formId: string, data: {
    title: string;
    description: string;
    type: string;
    triggerType: string;
    isActive: boolean;
    questions: {
        id?: string;
        type: string;
        question: string;
        description?: string;
        options?: string[];
        required: boolean;
        order: number;
    }[];
}) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // 1. Update Form
    await db.update(forms).set({
        title: data.title,
        description: data.description,
        type: data.type,
        triggerType: data.triggerType,
        isActive: data.isActive,
        updatedAt: new Date(),
    }).where(and(eq(forms.id, formId), eq(forms.trainerId, userId)));

    // 2. Handle Questions (Complete Replacement Strategy for simplicity, or upsert)
    // For now, let's delete existing and recreate to ensure order and consistency
    // In a real app with existing specific answers linked to question IDs, we'd need to be more careful (Upsert)
    // Given we might have answers, we should try to keep IDs if possible.

    // Strategy: 
    // - Updates existing questions if ID provided.
    // - Inserts new questions if no ID.
    // - Deletes questions not in the list.

    const existingQuestions = await db.query.formQuestions.findMany({
        where: eq(formQuestions.formId, formId),
    });

    const incomingIds = data.questions.filter(q => q.id).map(q => q.id);
    const toDelete = existingQuestions.filter(q => !incomingIds.includes(q.id));

    // Delete removed questions
    if (toDelete.length > 0) {
        // Warning: This cascades deletion of answers for these questions usually
        await db.delete(formQuestions).where(
            and(eq(formQuestions.formId, formId),
                // @ts-ignore - 'inArray' should work but simple OR for list
                sql`${formQuestions.id} IN ${toDelete.map(q => q.id)}`
            ));
    }

    // Upsert
    for (const q of data.questions) {
        if (q.id) {
            await db.update(formQuestions).set({
                type: q.type,
                question: q.question,
                description: q.description,
                options: q.options,
                required: q.required,
                order: q.order,
            }).where(eq(formQuestions.id, q.id));
        } else {
            await db.insert(formQuestions).values({
                formId,
                type: q.type,
                question: q.question,
                description: q.description,
                options: q.options,
                required: q.required,
                order: q.order,
            });
        }
    }

    revalidatePath('/dashboard/forms');
    revalidatePath(`/dashboard/forms/${formId}`);
}

// --- Assignments (Trainer Logic) ---

export async function assignFormToStudent(formId: string, studentId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error('Unauthorized');

    // Verify ownership
    const form = await db.query.forms.findFirst({
        where: and(eq(forms.id, formId), eq(forms.trainerId, userId)),
    });
    if (!form) throw new Error('Form not found');

    await db.insert(studentForms).values({
        formId,
        studentId,
        status: 'pending',
    });

    revalidatePath(`/dashboard/students/${studentId}`);
}

// --- Student Actions ---

export async function getStudentPendingForms(studentId: string) {
    return await db.query.studentForms.findMany({
        where: and(eq(studentForms.studentId, studentId), eq(studentForms.status, 'pending')),
        with: {
            form: {
                with: {
                    questions: {
                        orderBy: (questions, { asc }) => [asc(questions.order)],
                    }
                }
            }
        },
    });
}

export async function submitFormResponse(assignmentId: string, answers: { questionId: string; answer: string }[]) {

    // 1. Save Answers
    if (answers.length > 0) {
        await db.insert(formAnswers).values(
            answers.map(a => ({
                responseId: assignmentId,
                questionId: a.questionId,
                answer: a.answer,
            }))
        );
    }

    // 2. Mark as Completed
    await db.update(studentForms).set({
        status: 'completed',
        completedAt: new Date(),
    }).where(eq(studentForms.id, assignmentId));

    revalidatePath('/dashboard');
}

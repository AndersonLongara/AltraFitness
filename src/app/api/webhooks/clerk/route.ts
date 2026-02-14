import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { db } from '@/db'
import { trainers, students } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
    const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!SIGNING_SECRET) {
        console.error('[Webhook] CLERK_WEBHOOK_SECRET not configured')
        return new Response('Error: Webhook secret not configured', { status: 500 })
    }

    // Create new Svix instance with verifying secret
    const wh = new Webhook(SIGNING_SECRET)

    // Get headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing Svix headers', { status: 400 })
    }

    // Get body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    let evt: WebhookEvent

    // Verify payload with headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('[Webhook] Signature verification failed:', err)
        return new Response('Error: Verification error', { status: 400 })
    }

    // Handle events
    const eventType = evt.type
    console.log(`[Webhook] Received event: ${eventType}`)

    try {
        if (eventType === 'user.created' || eventType === 'user.updated') {
            await handleUserEvent(evt)
        }

        return new Response('Webhook received', { status: 200 })
    } catch (error) {
        console.error(`[Webhook] Error processing ${eventType}:`, error)
        return new Response('Internal server error', { status: 500 })
    }
}

async function handleUserEvent(evt: WebhookEvent) {
    if (evt.type !== 'user.created' && evt.type !== 'user.updated') {
        return
    }

    const { id: userId, first_name, last_name, email_addresses, public_metadata } = evt.data as any
    
    // Skip if role already set (avoid overwriting manual assignments)
    if (public_metadata?.role) {
        console.log(`[Webhook] User ${userId} already has role: ${public_metadata.role}`)
        return
    }

    const email = email_addresses[0]?.email_address
    if (!email) {
        console.warn(`[Webhook] User ${userId} has no email address`)
        return
    }

    const name = `${first_name || ""} ${last_name || ""}`.trim() || email

    // Check if this email exists in students table
    const student = await db.query.students.findFirst({
        where: eq(students.email, email),
        columns: { id: true, trainerId: true },
    })

    let assignedRole: 'trainer' | 'student'

    if (student) {
        // User is a student
        assignedRole = 'student'
        console.log(`[Webhook] Assigning role 'student' to ${email} (found in students table)`)
    } else {
        // User is a trainer
        assignedRole = 'trainer'
        console.log(`[Webhook] Assigning role 'trainer' to ${email} (not in students table)`)

        // Sync trainer record to database
        await db.insert(trainers)
            .values({
                id: userId,
                name,
                email,
            })
            .onConflictDoUpdate({
                target: trainers.id,
                set: {
                    name,
                    email,
                    updatedAt: new Date(),
                }
            })
    }

    // Update Clerk user metadata with role
    const clerk = await clerkClient()
    await clerk.users.updateUserMetadata(userId, {
        publicMetadata: {
            role: assignedRole,
        },
    })

    console.log(`[Webhook] Successfully set role '${assignedRole}' for user ${userId}`)
}

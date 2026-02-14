/**
 * Auth Helpers - Unified Role-Based Authentication
 * Single source of truth for user roles using Clerk publicMetadata
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { students, trainers } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "trainer" | "student";

interface TrainerData {
    id: string;
    name: string;
    email: string;
    role: "trainer";
}

interface StudentData {
    id: string;
    trainerId: string;
    name: string;
    email: string;
    role: "student";
}

/**
 * Get current user's role from Clerk publicMetadata
 * Fallback to database lookup for legacy users without metadata
 */
export async function getRole(): Promise<UserRole | null> {
    try {
        const user = await currentUser();
        if (!user) return null;

        // Primary: Check Clerk publicMetadata
        const metadata = user.publicMetadata as { role?: UserRole };
        if (metadata?.role) {
            return metadata.role;
        }

        // Fallback: Database lookup for legacy users
        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) return null;

        // Check if user is a student
        const student = await db.query.students.findFirst({
            where: eq(students.email, email),
            columns: { id: true },
        });

        if (student) return "student";

        // Check if user is a trainer in DB
        const trainer = await db.query.trainers.findFirst({
            where: eq(trainers.id, user.id),
            columns: { id: true },
        });

        if (trainer) return "trainer";

        // No role found — user needs onboarding
        return null;
    } catch (error) {
        console.error("[getRole] Error:", error);
        return null;
    }
}

export async function requireRole(allowedRole: UserRole) {
    const role = await getRole();

    // If no role found (new user), redirect to onboarding
    if (!role) {
        redirect("/onboarding");
    }

    // Role mismatch
    if (role !== allowedRole) {
        // Redirect to their correct home
        if (role === "trainer") redirect("/dashboard");
        if (role === "student") redirect("/student");
    }

    return role;
}



/**
 * Get current trainer data
 * Throws if user is not a trainer
 */
export async function getCurrentTrainer(): Promise<TrainerData> {
    await requireRole("trainer");

    const { userId } = await auth();
    if (!userId) {
        throw new Error("No authenticated user");
    }

    const user = await currentUser();
    if (!user) {
        throw new Error("User not found");
    }

    // Ensure trainer record exists in DB (sync from Clerk)
    const trainer = await db.query.trainers.findFirst({
        where: eq(trainers.id, userId),
    });

    if (!trainer) {
        // Create trainer record if missing (migration case)
        const email = user.emailAddresses[0]?.emailAddress;
        const name = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || email || "Trainer";

        await db.insert(trainers).values({
            id: userId,
            email: email || "",
            name,
        }).onConflictDoNothing();

        return {
            id: userId,
            name,
            email: email || "",
            role: "trainer",
        };
    }

    return {
        id: trainer.id,
        name: trainer.name,
        email: trainer.email,
        role: "trainer",
    };
}

/**
 * Get current student data
 * Throws if user is not a student
 */
export async function getCurrentStudent(): Promise<StudentData> {
    await requireRole("student");

    const user = await currentUser();
    if (!user) {
        throw new Error("User not found");
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
        throw new Error("User email not found");
    }

    const student = await db.query.students.findFirst({
        where: eq(students.email, email),
    });

    if (!student) {
        throw new Error("Student record not found in database");
    }

    return {
        id: student.id,
        trainerId: student.trainerId,
        name: student.name,
        email: student.email || email,
        role: "student",
    };
}

/**
 * Check if current user has specific role (non-throwing)
 */
export async function hasRole(role: UserRole): Promise<boolean> {
    const currentRole = await getRole();
    return currentRole === role;
}

/**
 * Get role-specific redirect URL after sign-in
 */
export async function getRoleRedirectUrl(): Promise<string> {
    const role = await getRole();
    
    switch (role) {
        case "trainer":
            return "/dashboard";
        case "student":
            return "/student";
        default:
            return "/onboarding"; // For users without role
    }
}

import { redirect } from "next/navigation";
import { getRoleRedirectUrl } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage() {
    // Get role-specific redirect URL
    const redirectUrl = await getRoleRedirectUrl();
    redirect(redirectUrl);
}

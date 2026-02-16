import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getRoleRedirectUrl } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function Home() {
  let userId: string | null = null;
  try {
    const session = await auth();
    userId = session?.userId ?? null;
  } catch (err) {
    console.error("[Home] auth error:", err instanceof Error ? err.message : String(err));
    redirect("/sign-in");
  }

  if (!userId) {
    redirect("/sign-in");
  }

  const url = await getRoleRedirectUrl();
  redirect(url);
}


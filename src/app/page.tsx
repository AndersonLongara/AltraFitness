import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getRoleRedirectUrl } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { userId } = await auth();

  // Not authenticated → custom sign-in page
  if (!userId) {
    redirect("/sign-in");
  }

  const url = await getRoleRedirectUrl();
  redirect(url);
}


import { redirect } from "next/navigation";
import { getRoleRedirectUrl } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const url = await getRoleRedirectUrl();
  redirect(url);
}


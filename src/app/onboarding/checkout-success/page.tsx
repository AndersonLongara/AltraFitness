import { redirect } from "next/navigation";
import { confirmTrialAfterCheckout } from "@/app/actions/trial-checkout";
import { CheckoutSuccessView } from "./CheckoutSuccessView";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ trainerId?: string; plan?: string }>;
}) {
  const params = await searchParams;
  const trainerId = params.trainerId;
  const plan = params.plan;

  if (!trainerId || !plan) {
    redirect("/onboarding");
  }

  try {
    await confirmTrialAfterCheckout(trainerId, plan);
  } catch {
    // Se falhar (ex: já confirmado), redireciona mesmo assim
  }

  return <CheckoutSuccessView />;
}

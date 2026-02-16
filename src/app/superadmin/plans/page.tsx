import { getSuperAdminPlatformPlans } from "@/app/actions/superadmin";
import PlatformPlansManager from "@/components/features/superadmin/PlatformPlansManager";

export const dynamic = "force-dynamic";

export default async function SuperAdminPlansPage() {
  const plansList = await getSuperAdminPlatformPlans();

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Planos da plataforma
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Planos que oferecemos aos personais (assinaturas). O slug identifica o plano no sistema; personais são vinculados por esse slug.
        </p>
      </header>

      <PlatformPlansManager initialPlans={plansList} />
    </>
  );
}

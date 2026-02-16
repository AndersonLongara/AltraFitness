import { getSuperAdminPlatformCharges, getSuperAdminTrainers } from "@/app/actions/superadmin";
import CreatePlatformChargeForm from "@/components/features/superadmin/CreatePlatformChargeForm";
import ChargesFilter from "@/components/features/superadmin/ChargesFilter";
import ChargesListingClient from "@/components/features/superadmin/ChargesListingClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminChargesPage({
  searchParams,
}: {
  searchParams: Promise<{ trainerId?: string }>;
}) {
  const { trainerId } = await searchParams;
  const [chargesList, trainersList] = await Promise.all([
    getSuperAdminPlatformCharges(trainerId),
    getSuperAdminTrainers(),
  ]);

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pagamentos à plataforma
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Planos que os personais adquirem conosco. Cobre e acompanhe quem já pagou — PIX, Boleto ou Cartão (Asaas).
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <ChargesFilter trainers={trainersList} currentTrainerId={trainerId} />
        <CreatePlatformChargeForm trainers={trainersList} />
      </div>

      <ChargesListingClient charges={chargesList} />
    </>
  );
}

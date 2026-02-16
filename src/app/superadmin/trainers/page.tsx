import { getSuperAdminTrainers } from "@/app/actions/superadmin";
import TrainersListingClient from "./TrainersListingClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminTrainersPage() {
  const trainersList = await getSuperAdminTrainers();

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Clientes (Personal)
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Todos os trainers cadastrados na plataforma
        </p>
      </header>

      <TrainersListingClient trainers={trainersList} />
    </>
  );
}

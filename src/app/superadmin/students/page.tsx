import { getSuperAdminStudents, getSuperAdminTrainers } from "@/app/actions/superadmin";
import StudentsFilter from "./StudentsFilter";
import StudentsListingClient from "./StudentsListingClient";

export const dynamic = "force-dynamic";

export default async function SuperAdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ trainerId?: string }>;
}) {
  const { trainerId } = await searchParams;
  const [studentsList, trainersList] = await Promise.all([
    getSuperAdminStudents(trainerId),
    getSuperAdminTrainers(),
  ]);

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Alunos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Todos os alunos da plataforma
          </p>
        </div>
        <StudentsFilter trainers={trainersList} currentTrainerId={trainerId} />
      </header>

      <StudentsListingClient students={studentsList} />
    </>
  );
}

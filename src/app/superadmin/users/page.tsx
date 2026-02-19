import { getSuperAdminUsers } from "@/app/actions/superadmin";
import UsersListingClient from "./UsersListingClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SuperAdminUsersPage() {
  const users = await getSuperAdminUsers();

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Usuários
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Todos os usuários da plataforma (personais, alunos e superadmins)
        </p>
      </header>

      <UsersListingClient users={users} />
    </>
  );
}

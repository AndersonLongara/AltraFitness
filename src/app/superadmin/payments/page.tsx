import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Pagamentos no Super Admin = pagamentos que os personais fazem à plataforma (planos).
 * Redireciona para a página única de gestão (charges).
 */
export default async function SuperAdminPaymentsPage() {
  redirect("/superadmin/charges");
}

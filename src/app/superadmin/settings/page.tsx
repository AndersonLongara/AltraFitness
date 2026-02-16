import { currentUser } from "@clerk/nextjs/server";
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { SignOutButtonSafe } from "@/components/auth/SignOutButtonSafe";
import SuperAdminSettingsContent from "@/components/features/superadmin/SuperAdminSettingsContent";
import { getPlatformAsaasConfigForSettings } from "@/app/actions/superadmin";

export const dynamic = "force-dynamic";

const defaultAsaas = { hasApiKey: false, sandbox: false, hasWebhookToken: false };

export default async function SuperAdminSettingsPage() {
  let user: Awaited<ReturnType<typeof currentUser>> = null;
  let asaas = defaultAsaas;
  try {
    const [u, a] = await Promise.all([
      currentUser(),
      getPlatformAsaasConfigForSettings(),
    ]);
    user = u;
    asaas = a ?? defaultAsaas;
  } catch (err) {
    console.error("[SuperAdminSettingsPage] Error:", err instanceof Error ? err.message : String(err));
  }

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Configurações
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Conta do Super Admin e integrações da plataforma.
            </p>
          </div>
          <SignOutButtonSafe className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors border border-rose-100 dark:border-rose-500/30 disabled:opacity-70">
            <SignOut size={20} weight="bold" />
            Sair da conta
          </SignOutButtonSafe>
        </header>

      <SuperAdminSettingsContent
        user={{
          id: user?.id ?? "",
          name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName ?? "Super Admin",
          email: user?.primaryEmailAddress?.emailAddress ?? "",
          imageUrl: user?.imageUrl ?? "",
        }}
        asaas={asaas}
      />
    </>
  );
}

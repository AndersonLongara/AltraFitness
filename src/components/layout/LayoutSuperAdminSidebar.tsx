"use client";

import {
  House,
  ChalkboardTeacher,
  Users,
  UserCircleGear,
  CreditCard,
  ShieldCheck,
  Receipt,
  Gear,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: House, label: "Painel", href: "/superadmin" },
  { icon: UserCircleGear, label: "Usuários", href: "/superadmin/users" },
  { icon: ChalkboardTeacher, label: "Clientes (Personal)", href: "/superadmin/trainers" },
  { icon: Users, label: "Alunos", href: "/superadmin/students" },
  { icon: Receipt, label: "Pagamentos à plataforma", href: "/superadmin/charges" },
  { icon: CreditCard, label: "Planos", href: "/superadmin/plans" },
  { icon: Gear, label: "Configurações", href: "/superadmin/settings" },
];

export default function LayoutSuperAdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/superadmin" && pathname === "/superadmin") return true;
    return href !== "/superadmin" && pathname.startsWith(href);
  };

  return (
    <>
      <aside className="hidden md:flex flex-col w-24 h-screen bg-slate-900 fixed left-0 top-0 border-r border-slate-700 z-50 py-8 items-center justify-between">
        <div className="w-12 h-12 bg-amber-500 text-slate-900 rounded-xl flex items-center justify-center font-extrabold text-xl">
          <ShieldCheck size={28} weight="fill" />
        </div>

        <nav className="flex flex-col gap-6">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-2xl transition-all duration-300 group relative ${
                  active
                    ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-amber-400"
                }`}
              >
                <item.icon size={28} weight={active ? "fill" : "duotone"} />
                <span className="absolute left-14 bg-slate-800 text-white text-xs font-bold py-2 px-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-slate-700">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 text-center">
          SuperADM
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-700 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-2xl transition-all ${
                  active ? "text-amber-400" : "text-slate-400"
                }`}
              >
                <item.icon size={22} weight={active ? "fill" : "duotone"} />
                <span className="text-[9px] font-bold leading-none max-w-[56px] truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

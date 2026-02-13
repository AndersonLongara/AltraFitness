'use client';

import { SignOutButton } from "@clerk/nextjs";
import { Bell, Moon, SignOut, UserGear, CaretRight } from "@phosphor-icons/react";

export default function SettingsList() {
    return (
        <div className="bg-surface-grey border border-white/5 rounded-3xl overflow-hidden">
            <h3 className="px-6 pt-6 pb-2 text-lg font-black text-white">Configurações</h3>

            <div className="divide-y divide-white/5">
                {/* Account Settings */}
                <button className="w-full flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-acid-lime group-hover:text-black transition-colors">
                            <UserGear size={20} weight="duotone" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-white">Dados Pessoais</div>
                            <div className="text-xs text-zinc-500">Nome e telefone</div>
                        </div>
                    </div>
                    <CaretRight size={20} className="text-zinc-600 group-hover:text-white" />
                </button>

                {/* Notifications (Placeholder) */}
                <button className="w-full flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <Bell size={20} weight="duotone" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-zinc-400">Notificações</div>
                            <div className="text-xs text-zinc-600">Gerenciar alertas</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded">Em breve</span>
                        <CaretRight size={20} className="text-zinc-700" />
                    </div>
                </button>

                {/* Appearance (Placeholder) */}
                <button className="w-full flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Moon size={20} weight="duotone" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-zinc-400">Aparência</div>
                            <div className="text-xs text-zinc-600">Tema escuro</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded">Em breve</span>
                        <CaretRight size={20} className="text-zinc-700" />
                    </div>
                </button>

                {/* Logout */}
                <div className="p-4 px-6">
                    <SignOutButton>
                        <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all">
                            <SignOut size={20} weight="bold" />
                            Sair da Conta
                        </button>
                    </SignOutButton>
                </div>
            </div>
        </div>
    );
}

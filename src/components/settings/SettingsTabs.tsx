"use client";

import { useState } from "react";
import { User, CreditCard, GearSix, Info } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type SettingsTab = "profile" | "subscription" | "account" | "about";

interface SettingsTabsProps {
    activeTab: SettingsTab;
    onTabChange: (tab: SettingsTab) => void;
}

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "subscription", label: "Plano", icon: CreditCard },
    { id: "account", label: "Conta", icon: GearSix },
    { id: "about", label: "Sobre", icon: Info },
];

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
    return (
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 soft-shadow border border-slate-100">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200",
                            isActive
                                ? "bg-performance-green text-white shadow-lg shadow-emerald-200"
                                : "text-slate-400 hover:text-graphite-dark hover:bg-slate-50"
                        )}
                    >
                        <tab.icon size={20} weight={isActive ? "fill" : "duotone"} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

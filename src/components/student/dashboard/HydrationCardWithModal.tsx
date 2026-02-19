'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, X } from "@phosphor-icons/react";
import HydrationTracker from "./HydrationTracker";

interface HydrationCardWithModalProps {
    hydrationTotal: number;
    waterGoal: number;
}

export default function HydrationCardWithModal({ hydrationTotal, waterGoal }: HydrationCardWithModalProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const progress = Math.min((hydrationTotal / waterGoal) * 100, 100);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full bg-surface-grey p-4 rounded-3xl border border-white/5 flex gap-4 items-center hover:bg-white/5 hover:border-white/10 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.3)] transition-all duration-200 group text-left"
            >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                    <span className="font-black text-xs">{hydrationTotal}ml</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-lg">Hidratação</h4>
                    <div className="w-full bg-deep-black h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-[width] duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">Meta: {waterGoal}ml — toque para registrar</p>
                </div>
                <div className="w-8 h-8 shrink-0 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-acid-lime group-hover:text-black group-hover:border-acid-lime transition-all">
                    <ArrowRight size={14} weight="bold" />
                </div>
            </button>

            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-h-[85vh] overflow-auto rounded-3xl border border-white/10 bg-deep-black shadow-2xl animate-in fade-in duration-200 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md focus:outline-none">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <Dialog.Title className="font-bold text-white text-lg">Registrar água</Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 rounded-xl bg-surface-grey text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" aria-label="Fechar">
                                    <X weight="bold" size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <div className="p-4">
                            <HydrationTracker
                                initialAmount={hydrationTotal}
                                dailyGoal={waterGoal}
                                onLogSuccess={() => router.refresh()}
                            />
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}

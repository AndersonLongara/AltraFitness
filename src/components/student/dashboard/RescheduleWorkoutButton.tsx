'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, X } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { setWorkoutDayOverride } from "@/app/actions/workout-reschedule";
import { addDays, format, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RescheduleWorkoutButtonProps {
    workoutId: string;
}

export default function RescheduleWorkoutButton({ workoutId }: RescheduleWorkoutButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const today = startOfDay(new Date());
    const nextDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

    const handlePick = async (date: Date) => {
        setLoading(true);
        try {
            await setWorkoutDayOverride(workoutId, date.toISOString());
            setOpen(false);
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
                className="text-xs font-bold text-zinc-400 hover:text-acid-lime transition-colors flex items-center gap-1.5"
            >
                <Calendar size={14} weight="duotone" />
                Substituir dia
            </button>

            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-h-[85vh] overflow-auto rounded-3xl border border-white/10 bg-deep-black shadow-2xl animate-in fade-in duration-200 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm focus:outline-none">
                        <Dialog.Title className="sr-only">Escolher outro dia para este treino</Dialog.Title>
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <span className="font-bold text-white">Fazer este treino em qual dia?</span>
                            <Dialog.Close asChild>
                                <button className="p-2 rounded-xl bg-surface-grey text-zinc-400 hover:text-white" aria-label="Fechar">
                                    <X weight="bold" size={20} />
                                </button>
                            </Dialog.Close>
                        </div>
                        <div className="p-4 space-y-2">
                            {nextDays.map((date) => (
                                <button
                                    key={date.getTime()}
                                    type="button"
                                    onClick={() => handlePick(date)}
                                    disabled={loading}
                                    className="w-full text-left px-4 py-3 rounded-xl bg-surface-grey border border-white/5 hover:border-acid-lime/30 hover:bg-white/5 transition-all flex items-center justify-between disabled:opacity-50"
                                >
                                    <span className="text-white font-medium">
                                        {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                    </span>
                                    <Calendar size={18} className="text-zinc-500" weight="duotone" />
                                </button>
                            ))}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}

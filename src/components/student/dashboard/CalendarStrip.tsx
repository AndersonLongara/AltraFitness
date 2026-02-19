'use client';

import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CalendarStrip() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const today = new Date();

    // Get date from URL or default to today
    const dateParam = searchParams.get('date');
    const selectedDate = dateParam ? parseISO(dateParam) : today;

    const startDate = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Sunday of the selected week

    // Generate 7 days
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const handleDateClick = (date: Date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', formatted);
        router.push(`/student?${params.toString()}`);
    };

    return (
        <div className="w-full overflow-x-auto no-scrollbar py-2 -mx-1">
            <div className="flex items-stretch gap-2 min-w-min px-1">
                {days.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = dateStr === format(selectedDate, 'yyyy-MM-dd');
                    const isToday = dateStr === format(today, 'yyyy-MM-dd');

                    return (
                        <button
                            key={date.toString()}
                            onClick={() => handleDateClick(date)}
                            type="button"
                            className={`flex flex-col items-center justify-center flex-shrink-0 w-[52px] min-h-[56px] py-2 rounded-2xl transition-all duration-200 relative select-none
                                active:scale-95
                                ${isSelected
                                    ? 'bg-acid-lime/15 border-2 border-acid-lime text-white shadow-[0_0_20px_rgba(46,204,113,0.25)]'
                                    : 'bg-surface-grey/50 border border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 hover:border-white/10'
                                }
                            `}
                        >
                            {/* Dia da semana - uma linha só, sem colar no próximo */}
                            <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1 leading-tight ${isSelected ? 'text-white/90' : 'text-zinc-500'}`}>
                                {format(date, 'EEE', { locale: ptBR }).replace('.', '')}
                            </span>

                            {/* Número do dia */}
                            <span className={`text-base font-black tabular-nums leading-none ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                {format(date, 'd')}
                            </span>

                            {/* Indicador de hoje quando não selecionado */}
                            {isToday && !isSelected && (
                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-acid-lime shadow-[0_0_6px_rgba(46,204,113,0.6)]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

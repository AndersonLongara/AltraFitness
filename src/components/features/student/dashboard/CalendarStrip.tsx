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
        <div className="w-full overflow-x-auto no-scrollbar py-2">
            <div className="flex justify-between items-center gap-2 px-1">
                {days.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = dateStr === format(selectedDate, 'yyyy-MM-dd');
                    const isToday = dateStr === format(today, 'yyyy-MM-dd');

                    return (
                        <button
                            key={date.toString()}
                            onClick={() => handleDateClick(date)}
                            className={`flex flex-col items-center justify-center w-12 h-16 rounded-full transition-all duration-300 relative group
                                ${isSelected
                                    ? 'bg-transparent border border-acid-lime text-white scale-110 shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                                    : 'bg-transparent text-zinc-500 hover:text-zinc-300'
                                }
                            `}
                        >
                            {/* Day Label (Sun, Mon) */}
                            <span className="text-[10px] font-medium uppercase tracking-wider mb-1">
                                {format(date, 'EEE', { locale: ptBR }).replace('.', '')}
                            </span>

                            {/* Day Number */}
                            <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                {format(date, 'd')}
                            </span>

                            {/* Today Indicator */}
                            {isToday && !isSelected && (
                                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-acid-lime" />
                            )}

                            {/* Selected Indicator Ring (Partial) */}
                            {isSelected && (
                                <div className="absolute inset-0 rounded-full border-t-2 border-acid-lime opacity-100" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

'use client';

import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConsistencyCalendarProps {
    workoutDates: string[]; // YYYY-MM-DD
}

export default function ConsistencyCalendar({ workoutDates }: ConsistencyCalendarProps) {
    // Show last 3 months
    const today = new Date();
    const startDate = startOfMonth(subMonths(today, 2));
    const endDate = today;

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Group by month for labeling
    const months: { date: Date; name: string }[] = [];
    let currentMonth = -1;

    days.forEach(day => {
        const month = day.getMonth();
        if (month !== currentMonth) {
            months.push({
                date: day,
                name: format(day, 'MMMM', { locale: ptBR })
            });
            currentMonth = month;
        }
    });

    // Helper to check if a day has a workout
    const hasWorkout = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        return workoutDates.includes(dateString);
    };

    return (
        <div className="bg-surface-grey border border-white/5 p-6 rounded-[32px] relative overflow-hidden group">
            <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                <span className="w-1.5 h-4 bg-acid-lime rounded-full shadow-[0_0_8px_rgba(189,255,0,0.5)]"></span>
                Consistência
            </h3>

            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                {months.map((month, i) => {
                    const monthStart = startOfMonth(month.date);
                    const monthEnd = endOfMonth(month.date);
                    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

                    // Pad start to align with day of week (0=Sun, 6=Sat)
                    const startDayOfWeek = getDay(monthStart);
                    const padding = Array(startDayOfWeek).fill(null);

                    return (
                        <div key={i} className="mb-2">
                            <h4 className="text-[10px] font-black text-zinc-600 uppercase mb-3 tracking-widest capitalize">{month.name}</h4>
                            <div className="grid grid-cols-7 gap-1.5 w-full max-w-[180px]">
                                {/* Day Headers */}
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, idx) => (
                                    <div key={idx} className="text-[8px] font-bold text-zinc-800 text-center">{d}</div>
                                ))}

                                {/* Padding */}
                                {padding.map((_, idx) => (
                                    <div key={`pad-${idx}`} />
                                ))}

                                {/* Days */}
                                {monthDays.map(day => {
                                    const workedOut = hasWorkout(day);
                                    const isToday = isSameDay(day, today);

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            title={format(day, 'dd/MM/yyyy')}
                                            className={`
                                                aspect-square rounded-[4px] flex items-center justify-center text-[9px] font-black transition-all duration-300
                                                ${workedOut
                                                    ? 'bg-acid-lime text-black shadow-[0_0_10px_rgba(189,255,0,0.4)] scale-110 z-10'
                                                    : 'bg-deep-black text-zinc-800'
                                                }
                                                ${isToday && !workedOut ? 'ring-1 ring-acid-lime/30' : ''}
                                            `}
                                        >
                                            {format(day, 'd')}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center gap-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-acid-lime shadow-[0_0_5px_rgba(189,255,0,0.5)]"></div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Treino</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-deep-black border border-white/5"></div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Descanso</span>
                </div>
            </div>

            {/* Ambient Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-acid-lime/5 blur-[50px] rounded-full pointer-events-none" />
        </div>
    );
}

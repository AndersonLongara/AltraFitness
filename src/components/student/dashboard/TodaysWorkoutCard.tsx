import Link from "next/link";
import { CalendarBlank, Lightning, Trophy, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import RescheduleWorkoutButton from "./RescheduleWorkoutButton";

type WorkoutItem = { id: string };

interface TodaysWorkoutCardProps {
    workout: {
        id: string;
        title: string;
        items: WorkoutItem[];
    } | null;
    isWorkoutDone: boolean;
}

function estimateMinutes(exerciseCount: number): number {
    if (exerciseCount <= 0) return 45;
    return Math.max(30, Math.min(90, exerciseCount * 6));
}

export default function TodaysWorkoutCard({ workout, isWorkoutDone }: TodaysWorkoutCardProps) {
    if (!workout) {
        return (
            <Link
                href="/student/workouts"
                className="block mb-8 rounded-3xl overflow-hidden border border-white/10 bg-surface-grey hover:border-white/15 transition-all"
            >
                <div className="relative p-6 md:p-8 bg-gradient-to-br from-zinc-800/80 to-deep-black">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 5v50M5 30h50\' stroke=\'%23333\' stroke-width=\'0.5\' fill=\'none\'/%3E%3C/svg%3E')] opacity-30" />
                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">
                            Treino do dia
                        </span>
                        <h2 className="text-xl md:text-2xl font-black text-white mb-2">Descanso</h2>
                        <p className="text-zinc-500 text-sm mb-6">Recuperação ativa — confira seu plano de treinos.</p>
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-acid-lime text-deep-black text-xs font-black uppercase tracking-wider">
                            Ver plano de treinos
                            <ArrowRight size={16} weight="bold" />
                        </span>
                    </div>
                </div>
            </Link>
        );
    }

    const exerciseCount = workout.items.length;
    const durationMin = estimateMinutes(exerciseCount);

    return (
        <div className="mb-8 rounded-3xl overflow-hidden border border-white/10 bg-surface-grey hover:border-acid-lime/30 transition-all group">
            <Link href={`/student/workouts/${workout.id}`} className="block">
                <div className="relative min-h-[200px] p-6 md:p-8 bg-gradient-to-br from-zinc-800/90 to-deep-black">
                    {/* Background: subtle pattern + gym vibe */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 5v50M5 30h50\' stroke=\'%23333\' stroke-width=\'0.5\' fill=\'none\'/%3E%3C/svg%3E')] opacity-20" />
                    <div className="absolute right-0 bottom-0 w-1/2 h-full bg-gradient-to-l from-acid-lime/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full">
                        <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1 rounded-full bg-acid-lime/20 text-acid-lime border border-acid-lime/30 text-xs font-bold uppercase tracking-wider mb-4">
                            {isWorkoutDone ? "Concluído" : "Treino do dia"}
                        </span>

                        <h2 className="text-xl md:text-2xl font-black text-white mb-4 leading-tight">
                            {workout.title}
                        </h2>

                        <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-6">
                            <span className="flex items-center gap-2">
                                <CalendarBlank size={18} weight="duotone" className="text-zinc-500" />
                                {durationMin} min
                            </span>
                            <span className="flex items-center gap-2">
                                <Lightning size={18} weight="duotone" className="text-zinc-500" />
                                {exerciseCount} {exerciseCount === 1 ? "exercício" : "exercícios"}
                            </span>
                        </div>

                        <div className="mt-auto">
                            {isWorkoutDone ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-acid-lime/20 text-acid-lime border border-acid-lime/30 text-xs font-bold uppercase tracking-wider">
                                    <Trophy size={18} weight="fill" />
                                    Treino concluído — ver detalhes
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-acid-lime text-deep-black text-sm font-black uppercase tracking-wider group-hover:brightness-110 transition-all">
                                    Iniciar agora
                                    <ArrowRight size={18} weight="bold" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
            <div className="px-6 pb-4 pt-1 flex justify-end">
                <RescheduleWorkoutButton workoutId={workout.id} />
            </div>
        </div>
    );
}

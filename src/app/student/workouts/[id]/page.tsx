import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workoutLogs, workouts, workoutItems, exercises } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, Clock, Barbell, Info } from "@phosphor-icons/react/dist/ssr";
import { startWorkout } from "@/app/actions/workout-execution";

export default async function WorkoutOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    const { id } = await params;

    const workout = await db.query.workouts.findFirst({
        where: eq(workouts.id, id),
        with: {
            items: {
                with: {
                    exercise: true
                },
                orderBy: (items, { asc }) => [asc(items.order)]
            }
        }
    });

    if (!workout) return redirect("/student/workouts");

    async function handleStart() {
        'use server';
        const result = await startWorkout(id);
        if (result.success) {
            redirect(`/student/workouts/${id}/run?logId=${result.logId}`);
        }
    }

    return (
        <main className="min-h-screen pb-24 md:pb-6 relative font-primary">
            {/* Header Image / Pattern */}
            <div className="h-72 bg-deep-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-acid-lime/20 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-deep-black" />

                <div className="absolute top-6 left-6 z-20">
                    <Link href="/student/workouts" className="w-10 h-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all">
                        <ArrowLeft size={20} weight="bold" />
                    </Link>
                </div>
            </div>

            <div className="px-6 md:px-10 lg:px-16 -mt-32 relative z-10 max-w-6xl mx-auto">
                <div className="mb-8">
                    <span className="text-[10px] font-black text-acid-lime uppercase tracking-widest bg-acid-lime/10 px-3 py-1 rounded-full border border-acid-lime/20 mb-3 inline-block">
                        Treino Ativo
                    </span>
                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight">{workout.title}</h1>
                    <div className="flex items-center gap-6 mt-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Duração</span>
                            <span className="flex items-center gap-1.5 text-zinc-300 font-bold"><Clock size={16} className="text-acid-lime" weight="bold" /> ~60 min</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Volume</span>
                            <span className="flex items-center gap-1.5 text-zinc-300 font-bold"><Barbell size={16} className="text-zinc-500" weight="bold" /> {workout.items.length} Exercícios</span>
                        </div>
                    </div>
                </div>

                {/* Start Button */}
                <form action={handleStart}>
                    <button type="submit" className="w-full py-5 bg-acid-lime text-black rounded-3xl font-black text-lg shadow-[0_20px_40px_rgba(189,255,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-10 border-2 border-black">
                        <Play weight="fill" size={24} /> COMEÇAR TREINO
                    </button>
                </form>

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Lista de Exercícios</h3>
                    <span className="text-[10px] font-bold text-zinc-500">{workout.items.length} itens</span>
                </div>

                <div className="space-y-4">
                    {workout.items.map((item, index) => (
                        <div key={item.id} className="bg-surface-grey p-5 rounded-[24px] border border-white/5 flex items-center gap-5 transition-all hover:bg-white/5 group">
                            <div className="w-12 h-12 bg-deep-black rounded-2xl flex items-center justify-center text-zinc-600 font-black text-sm shrink-0 border border-white/5 group-hover:border-acid-lime/30 group-hover:text-acid-lime transition-all">
                                {String(index + 1).padStart(2, '0')}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white group-hover:text-acid-lime transition-colors">{item.exercise.name}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{item.sets} Séries</span>
                                    <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{item.reps} Repetições</span>
                                </div>
                            </div>
                            {item.notes && (
                                <div className="w-8 h-8 rounded-full bg-white/5 text-zinc-500 flex items-center justify-center border border-white/5">
                                    <Info size={16} weight="bold" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

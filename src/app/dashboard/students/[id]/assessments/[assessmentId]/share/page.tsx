
import { db } from "@/db";
import { assessments, students, trainers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendUp, TrendDown, Minus, Lightning } from "@phosphor-icons/react/dist/ssr";

export default async function AssessmentSharePage(props: { params: Promise<{ id: string, assessmentId: string }> }) {
    const params = await props.params;
    const { id, assessmentId } = params;

    // Fetch Data
    const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.id, assessmentId),
        with: { photos: true }
    });

    const student = await db.query.students.findFirst({
        where: eq(students.id, id),
    });

    const trainer = await db.query.trainers.findFirst({
        where: eq(trainers.id, assessment.trainerId),
    });

    if (!assessment || !student || !trainer) return notFound();

    // Previous Assessment for Deltas
    const history = await db.query.assessments.findMany({
        where: eq(assessments.studentId, id),
        orderBy: [desc(assessments.date)],
    });

    // Using import reference for `desc` might fail if not imported on top. 
    // Wait, I imported `desc` from `drizzle-orm` in the imports!

    const currentIndex = history.findIndex(a => a.id === assessmentId);
    const previous = history[currentIndex + 1];

    // Helper Calculate Delta
    const getDelta = (curr: number | null, prev: number | null, div = 1) => {
        if (!curr || !prev) return 0;
        return (curr / div) - (prev / div);
    }

    const weightDelta = getDelta(assessment.weight, previous?.weight, 1000);
    const fatDelta = getDelta(assessment.bodyFat, previous?.bodyFat, 100);
    const leanDelta = getDelta(assessment.leanMass, previous?.leanMass, 1000);

    // Photos
    const frontPhoto = assessment.photos.find(p => p.type === 'front')?.photoUrl;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900 flex items-center justify-center p-4 overflow-y-auto">
            {/* Story Card Container - 9:16 Aspect Ratio */}
            <div className="w-full max-w-sm aspect-[9/16] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative text-slate-800">

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 z-0" />

                {/* Header */}
                <div className="relative z-10 p-8 text-center pb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Evolução de</p>
                    <h1 className="text-3xl font-black text-slate-900 leading-tight">{student.name}</h1>
                </div>

                {/* Main Visual */}
                <div className="relative z-10 flex-1 px-6 py-2 flex items-center justify-center">
                    {frontPhoto ? (
                        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-lg border-4 border-white rotation-card">
                            <img src={frontPhoto} className="w-full h-full object-cover" />
                            <div className="absolute bottom-4 left-0 right-0 text-center">
                                <span className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase">Resultado Atual</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-square bg-white rounded-full flex items-center justify-center shadow-inner relative">
                            <div className="absolute inset-0 opacity-20 bg-[url('/pattern.svg')]"></div>
                            <div className="text-center z-10">
                                <h2 className="text-6xl font-black text-indigo-500 mb-2">{format(assessment.date, "dd")}</h2>
                                <p className="text-xl font-bold text-slate-400 uppercase">{format(assessment.date, "MMM")}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="relative z-10 px-6 py-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-4 grid grid-cols-2 gap-4 border border-white/50 shadow-sm">

                        <StatBox label="Peso" value={`${(assessment.weight / 1000).toFixed(1)}kg`} delta={weightDelta} inverse={true} />
                        <StatBox label="% Gordura" value={`${(assessment.bodyFat / 100).toFixed(1)}%`} delta={fatDelta} inverse={true} />
                        <StatBox label="Massa Magra" value={`${(assessment.leanMass / 1000).toFixed(1)}kg`} delta={leanDelta} inverse={false} colSpan={2} />

                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 p-8 pt-2 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                        <span className="font-black text-slate-900 tracking-tight">ALTRAHUB</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Treinador {trainer.name}</p>
                </div>

            </div>

            {/* Guide Text */}
            <div className="fixed bottom-8 text-white text-center animate-bounce">
                <p className="font-bold">✨ Capture a tela para compartilhar!</p>
            </div>
        </div>
    );
}

function StatBox({ label, value, delta, inverse, colSpan }: { label: string, value: string, delta: number, inverse: boolean, colSpan?: number }) {
    const isPositive = delta > 0;
    const isGood = inverse ? !isPositive : isPositive;
    const color = delta === 0 ? 'text-slate-400' : (isGood ? 'text-emerald-500' : 'text-rose-500');
    const Icon = delta === 0 ? Minus : (isPositive ? TrendUp : TrendDown);

    return (
        <div className={`text-center ${colSpan ? `col-span-${colSpan}` : ''}`}>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</p>
            <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-black text-slate-800">{value}</span>
                {delta !== 0 && (
                    <div className={`flex items-center text-xs font-bold ${color}`}>
                        <Icon weight="bold" />
                        {Math.abs(delta).toFixed(1)}
                    </div>
                )}
            </div>
        </div>
    )
}

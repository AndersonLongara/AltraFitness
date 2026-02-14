import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy } from "@phosphor-icons/react/dist/ssr";
import ConsistencyCalendar from "@/components/student/evolution/ConsistencyCalendar";
import EvolutionCharts from "@/components/student/evolution/EvolutionCharts";
import PhotoGallery from "@/components/student/evolution/PhotoGallery";
import { getStudentStats, getWorkoutHistory, getStudentPhotos } from "@/app/actions/evolution";
import { getStudentAssessments } from "@/app/actions/assessments";
import AssessmentHistory from "@/components/student/evolution/AssessmentHistory";

export default async function EvolutionPage() {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return redirect("/sign-in");

    const email = user.emailAddresses[0]?.emailAddress;
    const student = await db.query.students.findFirst({
        where: eq(students.email, email)
    });

    if (!student) return redirect("/");

    // Fetch Data in parallel
    const [workoutDates, stats, photos, assessments] = await Promise.all([
        getWorkoutHistory(),
        getStudentStats(),
        getStudentPhotos(),
        getStudentAssessments(student.id)
    ]);

    return (
        <main className="p-6 pb-24 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <Link href="/student" className="w-10 h-10 bg-surface-grey border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeft size={20} weight="bold" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Hall of Fame</h1>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sua jornada de evolução</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Consistency */}
                <ConsistencyCalendar workoutDates={workoutDates} />

                {/* 2. Charts */}
                <EvolutionCharts data={stats} />

                {/* 3. Photos */}
                <PhotoGallery photos={photos} />

                {/* 4. History */}
                <AssessmentHistory assessments={assessments} />
            </div>
        </main>
    );
}


import Sidebar from "@/components/layout/Sidebar";
import SmartMealBuilder from "@/components/trainer/diet/SmartMealBuilder";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getNutritionalPlan } from "@/app/actions/dietUtils";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditTemplatePage({ params }: { params: { id: string } }) {
    const { userId } = await auth();
    if (!userId) return null;

    const plan = await getNutritionalPlan(params.id);
    if (!plan) return notFound();
    if (plan.trainerId !== userId) return notFound(); // Security check

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />
            <div className="max-w-[1600px] mx-auto p-6 md:p-8">
                <div className="mb-6">
                    <Link href="/dashboard/nutrition/templates" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors mb-4">
                        <ArrowLeft size={16} weight="bold" /> Voltar para Modelos
                    </Link>
                </div>

                <SmartMealBuilder
                    initialPlan={plan}
                    isTemplate={true}
                // studentId is omitted/undefined, or we can pass plan.studentId which is null
                />
            </div>
        </div>
    );
}

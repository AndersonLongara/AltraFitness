
import { ArrowLeft, Plus } from "@phosphor-icons/react/dist/ssr";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import Link from "next/link";
import { db } from "@/db";
import { foods } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, isNull, or } from "drizzle-orm";
import FoodLibraryList from "@/components/nutrition/FoodLibraryList";

export const dynamic = 'force-dynamic';

export default async function FoodLibraryPage() {
    const { userId } = await auth();
    if (!userId) return null;

    // Fetch only trainer's custom foods initially
    const myFoods = await db.select().from(foods).where(
        eq(foods.trainerId, userId)
    ).orderBy(desc(foods.createdAt));

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                        <Link href="/dashboard/nutrition" className="p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <ArrowLeft size={24} weight="bold" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                                Biblioteca de Alimentos
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                                Gerencie seus alimentos personalizados e consulte a tabela oficial.
                            </p>
                        </div>
                    </div>

                    <button className="px-6 py-4 bg-graphite-dark dark:bg-amber-500 dark:text-white text-white font-bold rounded-2xl hover:bg-black dark:hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none">
                        <Plus size={20} weight="bold" />
                        Novo Alimento
                    </button>
                </header>

                <FoodLibraryList initialFoods={myFoods as any[]} />
            </main>
        </div>
    );
}

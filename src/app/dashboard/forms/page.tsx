import { getForms } from "@/app/actions/forms";
import { getLeadQuestionnaireTemplates } from "@/app/actions/lead-forms";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import LayoutSidebar from "@/components/layout/LayoutSidebar";
import FormsListClient from "@/components/forms/FormsListClient";

export const dynamic = 'force-dynamic';

export default async function FormsPage() {
    const allForms = await getForms();
    const questionnaires = await getLeadQuestionnaireTemplates();
    
    // Filter forms to exclude questionnaires
    const forms = allForms.filter(f => f.type !== 'lead_questionnaire' && f.type !== 'questionnaire');

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                            Formulários & Questionários
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                            Gerencie todos os seus formulários e questionários em um só lugar.
                        </p>
                    </div>
                </header>

                <FormsListClient forms={forms} questionnaires={questionnaires} />
            </main>
        </div>
    );
}

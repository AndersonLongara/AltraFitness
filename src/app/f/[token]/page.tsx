import { getLeadFormByToken } from "@/app/actions/lead-forms";
import { LeadFormRenderer } from "@/components/forms/LeadFormRenderer";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function PublicLeadFormPage({ params }: PageProps) {
    const { token } = await params;
    
    const data = await getLeadFormByToken(token);
    
    // Invalid, expired, or not found
    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ice-white dark:bg-[#131B23]">
                <div className="text-center px-6">
                    <div className="mb-6 text-6xl">⏰</div>
                    <h1 className="text-2xl font-bold text-deep-teal dark:text-ice-white mb-4">
                        Formulário não disponível
                    </h1>
                    <p className="text-soft-gray dark:text-gray-400">
                        Este formulário expirou, não foi encontrado, ou já foi respondido.
                    </p>
                </div>
            </div>
        );
    }
    
    // Already completed
    if ('alreadyCompleted' in data && data.alreadyCompleted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ice-white dark:bg-[#131B23]">
                <div className="text-center px-6">
                    <div className="mb-6 text-6xl">✅</div>
                    <h1 className="text-2xl font-bold text-deep-teal dark:text-ice-white mb-4">
                        Formulário já respondido
                    </h1>
                    <p className="text-soft-gray dark:text-gray-400">
                        Você já respondeu este formulário. Obrigado!
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23]">
            <LeadFormRenderer 
                token={token}
                form={data.form}
                trainer={data.form.trainer}
                lead={data.lead}
            />
        </div>
    );
}

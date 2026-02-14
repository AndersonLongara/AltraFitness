"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { setUserRole, validateTeamCode } from "@/app/actions/onboarding";
import type { PlanOption, TrainerOnboardingData, ServicePlan, StudentOnboardingData } from "@/app/actions/onboarding";
import { cn } from "@/lib/utils";

type Step = "role" | "plans" | "profile" | "service-plans" | "student-profile";

export default function OnboardingPage() {
    const { user } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<Step>("role");
    const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);

    // Profile form state
    const [cpf, setCpf] = useState("");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [presentialStudents, setPresentialStudents] = useState(0);
    const [onlineStudents, setOnlineStudents] = useState(0);

    // Service plans state
    const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
    const [newPlanName, setNewPlanName] = useState("");
    const [newPlanPrice, setNewPlanPrice] = useState("");
    const [newPlanDuration, setNewPlanDuration] = useState("1");

    // Student-specific state
    const [studentCpf, setStudentCpf] = useState("");
    const [studentPhone, setStudentPhone] = useState("");
    const [studentBirthDate, setStudentBirthDate] = useState("");
    const [teamCode, setTeamCode] = useState("");
    const [teamCodeStatus, setTeamCodeStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
    const [trainerName, setTrainerName] = useState("");
    const [studentError, setStudentError] = useState("");

    // Validation helpers
    const isValidCpf = (v: string) => v.replace(/\D/g, "").length === 11;
    const isValidPhone = (v: string) => v.replace(/\D/g, "").length === 11;
    const isValidDate = (v: string) => v.length > 0;

    const isTrainerProfileValid = isValidCpf(cpf) && isValidPhone(phone) && isValidDate(birthDate);
    const isStudentProfileValid = isValidCpf(studentCpf) && isValidPhone(studentPhone) && isValidDate(studentBirthDate) && teamCodeStatus === "valid";

    function handleRoleSelect(role: "trainer" | "student") {
        if (role === "student") {
            setStep("student-profile");
        } else {
            setStep("plans");
        }
    }

    function handlePlanSelect(plan: PlanOption) {
        setSelectedPlan(plan);
        setStep("profile");
    }

    async function handleTeamCodeChange(value: string) {
        const code = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        setTeamCode(code);
        setTeamCodeStatus("idle");
        setTrainerName("");

        if (code.length === 6) {
            setTeamCodeStatus("validating");
            try {
                const result = await validateTeamCode(code);
                if (result) {
                    setTeamCodeStatus("valid");
                    setTrainerName(result.name);
                } else {
                    setTeamCodeStatus("invalid");
                }
            } catch {
                setTeamCodeStatus("invalid");
            }
        }
    }

    async function submitAsStudent() {
        if (!user || !isStudentProfileValid) return;
        setIsLoading(true);
        setStudentError("");
        try {
            const studentData: StudentOnboardingData = {
                cpf: studentCpf,
                birthDate: studentBirthDate,
                phone: studentPhone,
                teamCode,
            };
            const redirectUrl = await setUserRole("student", undefined, studentData);
            await user.reload();
            window.location.href = redirectUrl;
        } catch (error: any) {
            console.error("Error setting role:", error);
            setStudentError(error?.message || "Erro ao configurar sua conta. Tente novamente.");
            setIsLoading(false);
        }
    }

    // Student CPF mask
    function handleStudentCpfChange(value: string) {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        let masked = digits;
        if (digits.length > 3) masked = digits.slice(0, 3) + "." + digits.slice(3);
        if (digits.length > 6) masked = masked.slice(0, 7) + "." + digits.slice(6);
        if (digits.length > 9) masked = masked.slice(0, 11) + "-" + digits.slice(9);
        setStudentCpf(masked);
    }

    // Student phone mask
    function handleStudentPhoneChange(value: string) {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        let masked = digits;
        if (digits.length > 0) masked = "(" + digits;
        if (digits.length > 2) masked = "(" + digits.slice(0, 2) + ") " + digits.slice(2);
        if (digits.length > 7) masked = "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
        setStudentPhone(masked);
    }

    async function submitTrainerProfile() {
        if (!user || !selectedPlan) return;
        setStep("service-plans");
    }

    function addServicePlan() {
        if (!newPlanName || !newPlanPrice) return;
        const priceInCents = Math.round(Number(newPlanPrice.replace(",", ".")) * 100);
        if (priceInCents <= 0) return;
        setServicePlans([...servicePlans, {
            name: newPlanName,
            price: priceInCents,
            durationMonths: Number(newPlanDuration),
        }]);
        setNewPlanName("");
        setNewPlanPrice("");
        setNewPlanDuration("1");
    }

    function removeServicePlan(index: number) {
        setServicePlans(servicePlans.filter((_, i) => i !== index));
    }

    async function submitOnboarding() {
        if (!user || !selectedPlan) return;
        setIsLoading(true);

        try {
            const trainerData: TrainerOnboardingData = {
                plan: selectedPlan,
                cpf,
                birthDate,
                phone,
                presentialStudents,
                onlineStudents,
                servicePlans,
            };

            const redirectUrl = await setUserRole("trainer", trainerData);
            await user.reload();
            window.location.href = redirectUrl;
        } catch (error) {
            console.error("Error setting role:", error);
            alert("Erro ao configurar sua conta. Tente novamente.");
            setIsLoading(false);
        }
    }

    // CPF mask: 000.000.000-00
    function handleCpfChange(value: string) {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        let masked = digits;
        if (digits.length > 3) masked = digits.slice(0, 3) + "." + digits.slice(3);
        if (digits.length > 6) masked = masked.slice(0, 7) + "." + digits.slice(6);
        if (digits.length > 9) masked = masked.slice(0, 11) + "-" + digits.slice(9);
        setCpf(masked);
    }

    // Phone mask: (00) 00000-0000
    function handlePhoneChange(value: string) {
        const digits = value.replace(/\D/g, "").slice(0, 11);
        let masked = digits;
        if (digits.length > 0) masked = "(" + digits;
        if (digits.length > 2) masked = "(" + digits.slice(0, 2) + ") " + digits.slice(2);
        if (digits.length > 7) masked = "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);
        setPhone(masked);
    }

    const stepTitles: Record<Step, { title: string; subtitle: string }> = {
        role: {
            title: "Bem-vindo ao AltraFit",
            subtitle: "Escolha como você quer usar a plataforma",
        },
        plans: {
            title: "Escolha seu Plano",
            subtitle: "Comece grátis ou desbloqueie todo o potencial da plataforma",
        },
        profile: {
            title: "Seus Dados",
            subtitle: "Precisamos de algumas informações para personalizar sua experiência",
        },
        "service-plans": {
            title: "Seus Planos de Serviço",
            subtitle: "Configure os planos que você oferece aos seus alunos",
        },
        "student-profile": {
            title: "Seus Dados",
            subtitle: "Preencha seus dados e entre no time do seu Personal",
        },
    };

    // Step indicator — different for trainer vs student
    const isStudentFlow = step === "student-profile";
    const trainerStepNumber = step === "role" ? 1 : step === "plans" ? 2 : step === "profile" ? 3 : 4;
    const studentStepNumber = step === "role" ? 1 : 2;
    const totalSteps = isStudentFlow ? 2 : (step === "role" ? 4 : 4);
    const stepNumber = isStudentFlow ? studentStepNumber : trainerStepNumber;

    return (
        <div className="min-h-screen w-full bg-[#131B23] flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#111113] border border-acid-lime/20 rounded-2xl mb-6 shadow-[0_0_40px_rgba(204,255,0,0.15)] relative">
                        <span className="text-acid-lime text-3xl font-black">A</span>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-acid-lime rounded-full shadow-[0_0_8px_rgba(204,255,0,0.9)]" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-4">
                        {stepTitles[step].title}
                    </h1>
                    <p className="text-zinc-400 text-base font-semibold">
                        {stepTitles[step].subtitle}
                    </p>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300",
                                    s < stepNumber
                                        ? "bg-[#2ECC71] text-white"
                                        : s === stepNumber
                                            ? "bg-[#2ECC71]/20 text-[#2ECC71] ring-2 ring-[#2ECC71]/50"
                                            : "bg-zinc-800 text-zinc-600"
                                )}>
                                    {s < stepNumber ? "✓" : s}
                                </div>
                                {s < totalSteps && (
                                    <div className={cn(
                                        "w-12 h-0.5 rounded-full transition-all duration-300",
                                        s < stepNumber ? "bg-[#2ECC71]" : "bg-zinc-800"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ─── STEP 1: ROLE ─── */}
                {step === "role" && (
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-400">
                        {/* Trainer Card */}
                        <button
                            onClick={() => handleRoleSelect("trainer")}
                            disabled={isLoading}
                            className="group relative bg-[#111113] rounded-3xl border border-white/[0.06] p-10 text-left transition-all duration-200 hover:border-[#2ECC71]/30 hover:scale-[1.02]"
                        >
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#2ECC71] to-[#27ae60] rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(46,204,113,0.2)]">
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-black text-white mb-3">Sou Personal Trainer</h2>
                                <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">
                                    Gerencie seus alunos, crie treinos e dietas, acompanhe evolução e administre seu negócio fitness
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                        <span className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full mr-2" />
                                        Dashboard completo de gestão
                                    </li>
                                    <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                        <span className="w-1.5 h-1.5 bg-[#2ECC71] rounded-full mr-2" />
                                        Criação de treinos e dietas com IA
                                    </li>
                                </ul>
                            </div>
                        </button>

                        {/* Student Card */}
                        <button
                            onClick={() => handleRoleSelect("student")}
                            disabled={isLoading}
                            className="group relative bg-[#111113] rounded-3xl border border-white/[0.06] p-10 text-left transition-all duration-200 hover:border-acid-lime/30 hover:scale-[1.02]"
                        >
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-acid-lime to-[#d4ff33] rounded-xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(204,255,0,0.2)]">
                                    <svg className="w-8 h-8 text-deep-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-black text-white mb-3">Sou Aluno</h2>
                                <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-6">
                                    Acesse seus treinos, registre sua alimentação, acompanhe sua evolução e mantenha contato com seu personal
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                        <span className="w-1.5 h-1.5 bg-acid-lime rounded-full mr-2" />
                                        App mobile otimizado
                                    </li>
                                    <li className="flex items-center text-xs text-zinc-500 font-semibold">
                                        <span className="w-1.5 h-1.5 bg-acid-lime rounded-full mr-2" />
                                        Execução de treinos com cronômetro
                                    </li>
                                </ul>
                            </div>
                        </button>
                    </div>
                )}

                {/* ─── STEP 2: PLANS ─── */}
                {step === "plans" && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
                        {/* Free Options Row */}
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
                            {/* Free 5 Alunos */}
                            <button
                                onClick={() => handlePlanSelect("free_5")}
                                className="bg-[#111113] rounded-3xl border border-zinc-800 p-8 text-left transition-all duration-200 hover:border-zinc-600 hover:scale-[1.01] group relative"
                            >
                                <div className="absolute top-4 right-4 bg-zinc-800 text-zinc-400 text-[10px] font-extrabold px-3 py-1 rounded-full">
                                    PARA SEMPRE
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Free Starter</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-black text-white">R$ 0</span>
                                    <span className="text-zinc-500 font-medium">/mês</span>
                                </div>
                                <p className="text-xs text-zinc-400 font-medium mb-6">
                                    Ideal para quem está começando com poucos alunos
                                </p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center text-sm text-zinc-300">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-3" />
                                        Até 5 alunos
                                    </li>
                                    <li className="flex items-center text-sm text-zinc-300">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-3" />
                                        Dashboard Básico
                                    </li>
                                    <li className="flex items-center text-sm text-zinc-300">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-3" />
                                        Gestão de treinos e nutrição
                                    </li>
                                    <li className="flex items-center text-sm text-zinc-500 line-through">
                                        <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full mr-3" />
                                        Sem acesso à IA
                                    </li>
                                </ul>
                                <div className="w-full py-3.5 rounded-xl bg-zinc-800 text-white text-center font-bold group-hover:bg-zinc-700 transition-colors">
                                    Começar Grátis
                                </div>
                            </button>

                            {/* Free Trial 30 dias */}
                            <button
                                onClick={() => handlePlanSelect("free_trial")}
                                className="bg-[#111113] rounded-3xl border border-[#8B5CF6]/30 p-8 text-left transition-all duration-200 hover:border-[#8B5CF6]/60 hover:scale-[1.01] group relative shadow-[0_0_30px_rgba(139,92,246,0.08)]"
                            >
                                <div className="absolute top-4 right-4 bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#8B5CF6]/20">
                                    30 DIAS GRÁTIS
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Free Trial Pro</h3>
                                <div className="mb-4">
                                    <span className="text-4xl font-black text-white">R$ 0</span>
                                    <span className="text-zinc-500 font-medium">/30 dias</span>
                                </div>
                                <p className="text-xs text-[#8B5CF6] font-semibold mb-6">
                                    Experimente todos os recursos Pro por 30 dias
                                </p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center text-sm text-white">
                                        <div className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3">
                                            <svg className="w-3 h-3 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        Alunos Ilimitados
                                    </li>
                                    <li className="flex items-center text-sm text-white">
                                        <div className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3">
                                            <svg className="w-3 h-3 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="font-bold text-[#8B5CF6] mr-1">IA Manager</span> Completo
                                    </li>
                                    <li className="flex items-center text-sm text-white">
                                        <div className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center mr-3">
                                            <svg className="w-3 h-3 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        Todos os recursos desbloqueados
                                    </li>
                                </ul>
                                <div className="w-full py-3.5 rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6] text-center font-bold group-hover:bg-[#8B5CF6] group-hover:text-white transition-all">
                                    Experimentar 30 Dias
                                </div>
                            </button>
                        </div>

                        {/* Paid Plans Row */}
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {/* Monthly Plan */}
                            <button
                                onClick={() => handlePlanSelect("monthly")}
                                className="bg-[#111113] rounded-3xl border border-[#2ECC71] p-8 text-left transition-all duration-200 hover:scale-[1.01] group relative shadow-[0_0_30px_rgba(46,204,113,0.1)]"
                            >
                                <div className="absolute top-4 right-4 bg-[#2ECC71] text-[#131B23] text-[10px] font-extrabold px-3 py-1 rounded-full">
                                    RECOMENDADO
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Mensal</h3>
                                <div className="mb-2">
                                    <span className="text-4xl font-black text-white">R$ 109,90</span>
                                    <span className="text-zinc-500 font-medium">/mês</span>
                                </div>
                                <p className="text-xs text-[#2ECC71] font-semibold mb-6">+ R$ 1,99 por aluno/mês</p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center text-sm text-white">
                                        <div className="w-5 h-5 rounded-full bg-[#2ECC71]/20 flex items-center justify-center mr-3">
                                            <svg className="w-3 h-3 text-[#2ECC71]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        Alunos Ilimitados
                                    </li>
                                    <li className="flex items-center text-sm text-white">
                                        <div className="w-5 h-5 rounded-full bg-[#2ECC71]/20 flex items-center justify-center mr-3">
                                            <svg className="w-3 h-3 text-[#2ECC71]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="font-bold text-[#2ECC71] mr-1">IA Manager</span> Completo
                                    </li>
                                    <li className="flex items-center text-sm text-white">
                                        <div className="w-5 h-5 rounded-full bg-[#2ECC71]/20 flex items-center justify-center mr-3">
                                            <svg className="w-3 h-3 text-[#2ECC71]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        Criação de Treinos com IA
                                    </li>
                                </ul>
                                <div className="w-full py-3.5 rounded-xl bg-[#2ECC71] text-[#131B23] text-center font-black group-hover:bg-[#27ae60] transition-colors shadow-lg">
                                    Assinar Mensal
                                </div>
                            </button>

                            {/* Annual Plan */}
                            <button
                                onClick={() => handlePlanSelect("annual")}
                                className="bg-[#111113] rounded-3xl border border-zinc-800 p-8 text-left transition-all duration-200 hover:border-[#F1C40F] hover:scale-[1.01] group relative"
                            >
                                <div className="absolute top-4 right-4 bg-[#F1C40F]/10 text-[#F1C40F] text-[10px] font-extrabold px-3 py-1 rounded-full border border-[#F1C40F]/20">
                                    ECONOMIZE 27%
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Anual</h3>
                                <div className="mb-2">
                                    <span className="text-4xl font-black text-white">R$ 959,90</span>
                                    <span className="text-zinc-500 font-medium">/ano</span>
                                </div>
                                <p className="text-xs text-[#F1C40F] font-semibold mb-6">+ R$ 1,99 por aluno/mês</p>
                                <ul className="space-y-3 mb-6">
                                    <li className="flex items-center text-sm text-zinc-300">
                                        <span className="w-1.5 h-1.5 bg-[#F1C40F] rounded-full mr-3" />
                                        Todos recursos do Mensal
                                    </li>
                                    <li className="flex items-center text-sm text-zinc-300">
                                        <span className="w-1.5 h-1.5 bg-[#F1C40F] rounded-full mr-3" />
                                        Prioridade no Suporte
                                    </li>
                                    <li className="flex items-center text-sm text-zinc-300">
                                        <span className="w-1.5 h-1.5 bg-[#F1C40F] rounded-full mr-3" />
                                        Badge "Pro Trainer"
                                    </li>
                                </ul>
                                <div className="w-full py-3.5 rounded-xl bg-zinc-800 text-white text-center font-bold group-hover:bg-[#F1C40F] group-hover:text-black transition-all">
                                    Assinar Anual
                                </div>
                            </button>
                        </div>

                        {/* Back button */}
                        <div className="text-center mt-8">
                            <button
                                onClick={() => setStep("role")}
                                className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors"
                            >
                                ← Voltar
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── STEP 3: PROFILE DATA ─── */}
                {step === "profile" && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <div className="bg-[#111113] rounded-3xl border border-white/[0.06] p-8 md:p-10">
                            {/* Plan badge */}
                            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-zinc-800">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    selectedPlan === "free_5" ? "bg-zinc-700" :
                                    selectedPlan === "free_trial" ? "bg-[#8B5CF6]/20" :
                                    selectedPlan === "monthly" ? "bg-[#2ECC71]/20" :
                                    "bg-[#F1C40F]/20"
                                )}>
                                    <span className={cn(
                                        "text-lg",
                                        selectedPlan === "free_5" ? "text-zinc-300" :
                                        selectedPlan === "free_trial" ? "text-[#8B5CF6]" :
                                        selectedPlan === "monthly" ? "text-[#2ECC71]" :
                                        "text-[#F1C40F]"
                                    )}>
                                        {selectedPlan === "free_5" ? "⚡" : selectedPlan === "free_trial" ? "🚀" : selectedPlan === "monthly" ? "💎" : "👑"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">
                                        Plano: {selectedPlan === "free_5" ? "Free Starter" : selectedPlan === "free_trial" ? "Free Trial Pro (30 dias)" : selectedPlan === "monthly" ? "Mensal" : "Anual"}
                                    </p>
                                    <p className="text-zinc-500 text-xs font-medium">
                                        Preencha seus dados para continuar
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* CPF */}
                                <div>
                                    <label className="block text-sm font-bold text-zinc-300 mb-2">
                                        CPF <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={cpf}
                                        onChange={(e) => handleCpfChange(e.target.value)}
                                        placeholder="000.000.000-00"
                                        className={cn(
                                            "w-full px-4 py-3.5 bg-[#0D1117] border rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all font-medium",
                                            cpf && !isValidCpf(cpf) ? "border-red-500/50" : "border-zinc-800"
                                        )}
                                    />
                                    {cpf && !isValidCpf(cpf) && (
                                        <p className="text-red-400 text-xs mt-1 font-medium">CPF deve ter 11 dígitos</p>
                                    )}
                                </div>

                                {/* Phone & Birth Date Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-300 mb-2">
                                            WhatsApp <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            className={cn(
                                                "w-full px-4 py-3.5 bg-[#0D1117] border rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all font-medium",
                                                phone && !isValidPhone(phone) ? "border-red-500/50" : "border-zinc-800"
                                            )}
                                        />
                                        {phone && !isValidPhone(phone) && (
                                            <p className="text-red-400 text-xs mt-1 font-medium">Número deve ter 11 dígitos</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-300 mb-2">
                                            Data de Nascimento <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3.5 bg-[#0D1117] border rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all font-medium [color-scheme:dark]",
                                                !birthDate ? "border-zinc-800" : "border-zinc-800"
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Students Count */}
                                <div className="pt-4 border-t border-zinc-800">
                                    <p className="text-sm font-bold text-zinc-300 mb-4">
                                        Quantos alunos você atende hoje?
                                    </p>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-500 mb-2">
                                                Presenciais
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setPresentialStudents(Math.max(0, presentialStudents - 1))}
                                                    className="w-10 h-10 bg-zinc-800 rounded-lg text-zinc-400 font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={presentialStudents}
                                                    onChange={(e) => setPresentialStudents(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="w-20 text-center px-2 py-2.5 bg-[#0D1117] border border-zinc-800 rounded-xl text-white font-bold focus:outline-none focus:border-[#2ECC71]/50 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setPresentialStudents(presentialStudents + 1)}
                                                    className="w-10 h-10 bg-zinc-800 rounded-lg text-zinc-400 font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-zinc-500 mb-2">
                                                Online
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setOnlineStudents(Math.max(0, onlineStudents - 1))}
                                                    className="w-10 h-10 bg-zinc-800 rounded-lg text-zinc-400 font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={onlineStudents}
                                                    onChange={(e) => setOnlineStudents(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="w-20 text-center px-2 py-2.5 bg-[#0D1117] border border-zinc-800 rounded-xl text-white font-bold focus:outline-none focus:border-[#2ECC71]/50 transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setOnlineStudents(onlineStudents + 1)}
                                                    className="w-10 h-10 bg-zinc-800 rounded-lg text-zinc-400 font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-600 mt-3 font-medium">
                                        Total: {presentialStudents + onlineStudents} alunos
                                        {selectedPlan === "free_5" && presentialStudents + onlineStudents > 5 && (
                                            <span className="text-amber-500 ml-2">
                                                ⚠ O plano Free Starter permite até 5 alunos
                                            </span>
                                        )}
                                    </p>
                                </div>

                                {/* Submit */}
                                <div className="pt-6 flex flex-col gap-3">
                                    <button
                                        onClick={submitTrainerProfile}
                                        disabled={isLoading || !isTrainerProfileValid}
                                        className={cn(
                                            "w-full py-4 rounded-xl font-black text-base transition-all duration-200 disabled:opacity-50 shadow-lg",
                                            selectedPlan === "free_trial"
                                                ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                                                : selectedPlan === "annual"
                                                    ? "bg-[#F1C40F] text-black hover:bg-[#E0B50D]"
                                                    : "bg-[#2ECC71] text-[#131B23] hover:bg-[#27ae60]"
                                        )}
                                    >
                                        Próximo: Configurar Planos →
                                    </button>
                                    <button
                                        onClick={() => { setStep("plans"); setSelectedPlan(null); }}
                                        disabled={isLoading}
                                        className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors"
                                    >
                                        ← Voltar para planos
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STEP 4: SERVICE PLANS ─── */}
                {step === "service-plans" && (
                    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <div className="bg-[#111113] rounded-3xl border border-white/[0.06] p-8 md:p-10">
                            {/* Instructions */}
                            <div className="mb-8 pb-6 border-b border-zinc-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#2ECC71]/20 flex items-center justify-center">
                                        <span className="text-lg">💰</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">Planos de Serviço</p>
                                        <p className="text-zinc-500 text-xs font-medium">
                                            Cadastre os planos que você oferece aos seus alunos (ex: Mensal, Trimestral)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Plan creation form */}
                            <div className="bg-[#0D1117] rounded-2xl p-6 border border-zinc-800 mb-6">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Adicionar Plano</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Nome do Plano</label>
                                        <input
                                            type="text"
                                            value={newPlanName}
                                            onChange={(e) => setNewPlanName(e.target.value)}
                                            placeholder="Ex: Mensal Premium"
                                            className="w-full px-4 py-3 bg-[#131B23] border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Valor (R$)</label>
                                        <input
                                            type="text"
                                            value={newPlanPrice}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/[^\d,\.]/g, "");
                                                setNewPlanPrice(v);
                                            }}
                                            placeholder="150,00"
                                            className="w-full px-4 py-3 bg-[#131B23] border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Duração</label>
                                        <select
                                            value={newPlanDuration}
                                            onChange={(e) => setNewPlanDuration(e.target.value)}
                                            className="w-full px-4 py-3 bg-[#131B23] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all text-sm font-medium appearance-none"
                                        >
                                            <option value="1">1 Mês (Mensal)</option>
                                            <option value="3">3 Meses (Trimestral)</option>
                                            <option value="6">6 Meses (Semestral)</option>
                                            <option value="12">12 Meses (Anual)</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={addServicePlan}
                                    disabled={!newPlanName || !newPlanPrice}
                                    className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-sm hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <span className="text-[#2ECC71] text-lg font-black">+</span>
                                    Adicionar Plano
                                </button>
                            </div>

                            {/* Added plans list */}
                            {servicePlans.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        Planos Cadastrados ({servicePlans.length})
                                    </p>
                                    {servicePlans.map((sp, i) => {
                                        const durationLabel =
                                            sp.durationMonths === 1 ? "Mensal" :
                                            sp.durationMonths === 3 ? "Trimestral" :
                                            sp.durationMonths === 6 ? "Semestral" : "Anual";
                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between bg-[#0D1117] border border-zinc-800 rounded-2xl px-5 py-4 group"
                                            >
                                                <div>
                                                    <p className="text-white font-bold text-sm">{sp.name}</p>
                                                    <p className="text-zinc-500 text-xs font-medium mt-0.5">
                                                        {(sp.price / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} · {durationLabel}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeServicePlan(i)}
                                                    className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-500 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-all text-xs font-bold opacity-60 group-hover:opacity-100"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Empty state */}
                            {servicePlans.length === 0 && (
                                <div className="text-center py-8 mb-6">
                                    <p className="text-zinc-600 text-sm font-medium">
                                        Nenhum plano adicionado ainda.
                                    </p>
                                    <p className="text-zinc-700 text-xs mt-1">
                                        Você pode pular e configurar depois na aba Financeiro.
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-6 border-t border-zinc-800 flex flex-col gap-3">
                                <button
                                    onClick={submitOnboarding}
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-black text-base transition-all duration-200 disabled:opacity-50 shadow-lg",
                                        selectedPlan === "free_trial"
                                            ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                                            : selectedPlan === "annual"
                                                ? "bg-[#F1C40F] text-black hover:bg-[#E0B50D]"
                                                : "bg-[#2ECC71] text-[#131B23] hover:bg-[#27ae60]"
                                    )}
                                >
                                    {isLoading ? "Criando sua conta..." : servicePlans.length > 0
                                        ? `Finalizar com ${servicePlans.length} plano${servicePlans.length > 1 ? "s" : ""}`
                                        : "Pular e Acessar Dashboard"
                                    }
                                </button>
                                <button
                                    onClick={() => setStep("profile")}
                                    disabled={isLoading}
                                    className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors"
                                >
                                    ← Voltar para dados
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── STUDENT PROFILE STEP ─── */}
                {step === "student-profile" && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <div className="bg-[#111113] rounded-3xl border border-white/[0.06] p-8 md:p-10">
                            {/* Team Code Section */}
                            <div className="mb-8 pb-6 border-b border-zinc-800">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">
                                    Código do Time
                                </p>
                                <p className="text-zinc-500 text-sm font-medium mb-4">
                                    Peça o código ao seu Personal Trainer para entrar no time dele.
                                </p>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={teamCode}
                                        onChange={(e) => handleTeamCodeChange(e.target.value)}
                                        placeholder="Ex: ABC123"
                                        maxLength={6}
                                        className={cn(
                                            "w-full px-4 py-4 bg-[#0D1117] border rounded-xl text-white text-center text-2xl font-black tracking-[0.3em] placeholder-zinc-700 focus:outline-none transition-all uppercase",
                                            teamCodeStatus === "valid"
                                                ? "border-[#2ECC71] ring-2 ring-[#2ECC71]/20"
                                                : teamCodeStatus === "invalid"
                                                    ? "border-red-500 ring-2 ring-red-500/20"
                                                    : "border-zinc-800 focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20"
                                        )}
                                    />
                                    {teamCodeStatus === "validating" && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 border-2 border-zinc-600 border-t-[#2ECC71] rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {teamCodeStatus === "valid" && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-6 h-6 bg-[#2ECC71] rounded-full flex items-center justify-center">
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        </div>
                                    )}
                                    {teamCodeStatus === "invalid" && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">✕</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {teamCodeStatus === "valid" && trainerName && (
                                    <div className="mt-3 bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded-xl p-3 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#2ECC71]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-[#2ECC71]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[#2ECC71] text-xs font-bold">Personal encontrado!</p>
                                            <p className="text-white text-sm font-bold">{trainerName}</p>
                                        </div>
                                    </div>
                                )}
                                {teamCodeStatus === "invalid" && (
                                    <p className="mt-2 text-red-400 text-xs font-semibold">
                                        Código não encontrado. Verifique com seu Personal Trainer.
                                    </p>
                                )}
                            </div>

                            {/* Personal data */}
                            <div className="space-y-6">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Dados Pessoais</p>

                                {/* CPF */}
                                <div>
                                    <label className="block text-sm font-bold text-zinc-300 mb-2">
                                        CPF <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={studentCpf}
                                        onChange={(e) => handleStudentCpfChange(e.target.value)}
                                        placeholder="000.000.000-00"
                                        className={cn(
                                            "w-full px-4 py-3.5 bg-[#0D1117] border rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all font-medium",
                                            studentCpf && !isValidCpf(studentCpf) ? "border-red-500/50" : "border-zinc-800"
                                        )}
                                    />
                                    {studentCpf && !isValidCpf(studentCpf) && (
                                        <p className="text-red-400 text-xs mt-1 font-medium">CPF deve ter 11 dígitos</p>
                                    )}
                                </div>

                                {/* WhatsApp & Birth Date */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-300 mb-2">
                                            WhatsApp <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={studentPhone}
                                            onChange={(e) => handleStudentPhoneChange(e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            className={cn(
                                                "w-full px-4 py-3.5 bg-[#0D1117] border rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all font-medium",
                                                studentPhone && !isValidPhone(studentPhone) ? "border-red-500/50" : "border-zinc-800"
                                            )}
                                        />
                                        {studentPhone && !isValidPhone(studentPhone) && (
                                            <p className="text-red-400 text-xs mt-1 font-medium">Número deve ter 11 dígitos</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-300 mb-2">
                                            Data de Nascimento <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={studentBirthDate}
                                            onChange={(e) => setStudentBirthDate(e.target.value)}
                                            className={cn(
                                                "w-full px-4 py-3.5 bg-[#0D1117] border rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-[#2ECC71]/50 focus:ring-1 focus:ring-[#2ECC71]/20 transition-all font-medium [color-scheme:dark]",
                                                "border-zinc-800"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Error */}
                            {studentError && (
                                <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                                    <p className="text-red-400 text-sm font-bold">{studentError}</p>
                                </div>
                            )}

                            {/* Solo option teaser */}
                            <div className="mt-6 pt-6 border-t border-zinc-800">
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 opacity-60">
                                    <div className="w-10 h-10 rounded-xl bg-acid-lime/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg">🤖</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-zinc-400 text-sm font-bold">Treinar sozinho com IA</p>
                                        <p className="text-zinc-600 text-xs font-medium">
                                            Monte seus treinos com inteligência artificial — em breve!
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-extrabold text-zinc-600 bg-zinc-800 px-2 py-1 rounded-full">EM BREVE</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 flex flex-col gap-3">
                                <button
                                    onClick={submitAsStudent}
                                    disabled={isLoading || !isStudentProfileValid}
                                    className="w-full py-4 rounded-xl font-black text-base transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg bg-[#2ECC71] text-[#131B23] hover:bg-[#27ae60]"
                                >
                                    {isLoading ? "Entrando no time..." : "Entrar no Time"}
                                </button>
                                <button
                                    onClick={() => { setStep("role"); setTeamCode(""); setTeamCodeStatus("idle"); setTrainerName(""); setStudentError(""); }}
                                    disabled={isLoading}
                                    className="text-zinc-500 hover:text-zinc-300 text-sm font-semibold transition-colors"
                                >
                                    ← Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading state indicator */}
                {isLoading && (
                    <div className="text-center mt-12">
                        <div className="inline-flex items-center gap-3 text-zinc-400 font-semibold">
                            <div className="w-5 h-5 border-2 border-zinc-600 border-t-acid-lime rounded-full animate-spin" />
                            Configurando sua conta...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

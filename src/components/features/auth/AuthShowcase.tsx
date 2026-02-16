"use client";

import { useState, useEffect } from "react";
import { 
    Brain, 
    TrendingUp, 
    Users, 
    Dumbbell, 
    Activity, 
    Trophy, 
    Utensils, 
    Target, 
    CalendarCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShowcaseScenario {
    id: string;
    label: string;
    mainCard: {
        icon: React.ElementType;
        title: string;
        highlight: string;
        subtext: string;
    };
    statsCard1: {
        icon: React.ElementType;
        label: string;
        value: string;
        growth: string;
    };
    statsCard2: {
        icon: React.ElementType;
        label: string;
        value: string;
        subtext: string;
        badge?: string;
    };
}

const scenarios: ShowcaseScenario[] = [
    {
        id: "management",
        label: "Gestão Inteligente",
        mainCard: {
            icon: Brain,
            title: "Insights do AI Manager",
            highlight: "3 alunos em risco de churn detectados.",
            subtext: "Ação sugerida: Reengajamento",
        },
        statsCard1: {
            icon: TrendingUp,
            label: "Receita Recorrente",
            value: "R$ 18.450",
            growth: "+24% vs mês anterior",
        },
        statsCard2: {
            icon: Users,
            label: "Alunos Ativos",
            value: "84",
            subtext: "96% de Taxa de Retenção",
            badge: "HOJE",
        },
    },
    {
        id: "workouts",
        label: "Alta Performance",
        mainCard: {
            icon: Dumbbell,
            title: "Workout Intelligence",
            highlight: "12 Personal Records batidos hoje.",
            subtext: "Tendência de força: Alta",
        },
        statsCard1: {
            icon: Activity,
            label: "Volume de Treino",
            value: "42.5 Ton",
            growth: "+15% vs semana anterior",
        },
        statsCard2: {
            icon: Trophy,
            label: "Taxa de Conclusão",
            value: "92%",
            subtext: "Assiduidade recorde",
            badge: "TOP 1%",
        },
    },
    {
        id: "nutrition",
        label: "Nutrição & Hábitos",
        mainCard: {
            icon: Utensils,
            title: "Smart Nutrition",
            highlight: "Adesão à dieta subiu para 88%.",
            subtext: "Grupo de Hypertrofia em destaque",
        },
        statsCard1: {
            icon: Target,
            label: "Metas Atingidas",
            value: "156",
            growth: "+32 esta semana",
        },
        statsCard2: {
            icon: CalendarCheck,
            label: "Check-ins Diários",
            value: "78",
            subtext: "Consistência perfeita",
            badge: "AO VIVO",
        },
    },
];

export function AuthShowcase() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % scenarios.length);
                setIsTransitioning(false);
            }, 500); // Wait for fade out
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const currentScenario = scenarios[currentIndex];

    return (
        <div className="relative w-full max-w-[600px]">
            {/* Progress Indicators */}
            <div className="flex justify-center gap-2 mb-8">
                {scenarios.map((_, idx) => (
                    <div 
                        key={idx}
                        className={cn(
                            "h-1 rounded-full transition-all duration-500",
                            idx === currentIndex 
                                ? "w-8 bg-[#2ECC71]" 
                                : "w-2 bg-white/10"
                        )}
                    />
                ))}
            </div>

            <div 
                className={cn(
                    "grid grid-cols-2 gap-6 transition-all duration-500 ease-in-out transform",
                    isTransitioning 
                        ? "opacity-0 translate-y-4 scale-95" 
                        : "opacity-100 translate-y-0 scale-100"
                )}
            >
                {/* Main Large Card */}
                <div className="col-span-1 row-span-2 bg-[#2ECC71] rounded-[2rem] p-8 flex flex-col justify-between shadow-brand hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(46,204,113,0.4)] transition-all duration-300 cursor-default">
                    <div className="w-12 h-12 bg-[#131B23]/10 rounded-xl flex items-center justify-center mb-4">
                        <currentScenario.mainCard.icon className="w-6 h-6 text-[#131B23]" />
                    </div>
                    <div className="space-y-4">
                        <span className="text-[#131B23]/70 font-bold text-xs uppercase tracking-wider">
                            {currentScenario.mainCard.title}
                        </span>
                        <h3 className="text-[#131B23] text-3xl font-black leading-tight">
                            {currentScenario.mainCard.highlight}
                        </h3>
                        <div className="flex items-center gap-2 text-[#131B23] font-medium text-sm">
                            <span className="w-2 h-2 bg-[#131B23] rounded-full animate-pulse"></span>
                            {currentScenario.mainCard.subtext}
                        </div>
                    </div>
                </div>

                {/* Stats Card 1 */}
                <div className="bg-[#131B23] rounded-[2rem] p-8 border border-white/[0.05] shadow-2xl hover:scale-[1.02] hover:border-[#2ECC71]/50 hover:bg-[#1E2A36] transition-all duration-300 cursor-default group">
                    <div className="w-10 h-10 bg-[#1E2A36] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#2ECC71]/20 transition-colors">
                        <currentScenario.statsCard1.icon className="w-5 h-5 text-[#2ECC71]" />
                    </div>
                    <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-1">
                        {currentScenario.statsCard1.label}
                    </p>
                    <p className="text-white text-2xl font-black">
                        {currentScenario.statsCard1.value}
                    </p>
                    <p className="text-[#2ECC71] text-xs font-medium mt-2 flex items-center gap-1">
                        {currentScenario.statsCard1.growth}
                    </p>
                </div>

                {/* Stats Card 2 */}
                <div className="bg-[#131B23] rounded-[2rem] p-8 border border-white/[0.05] shadow-2xl relative overflow-hidden hover:scale-[1.02] hover:border-[#2ECC71]/50 hover:bg-[#1E2A36] transition-all duration-300 cursor-default group">
                    <div className="w-10 h-10 bg-[#1E2A36] rounded-xl flex items-center justify-center mb-6 relative z-10 group-hover:bg-[#2ECC71]/20 transition-colors">
                        <currentScenario.statsCard2.icon className="w-5 h-5 text-[#2ECC71]" />
                    </div>
                    
                    {currentScenario.statsCard2.badge && (
                        <div className="absolute top-4 right-4 bg-[#2ECC71]/10 text-[#2ECC71] text-[10px] font-bold px-2 py-1 rounded-full border border-[#2ECC71]/20">
                            {currentScenario.statsCard2.badge}
                        </div>
                    )}

                    <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider mb-1">
                        {currentScenario.statsCard2.label}
                    </p>
                    <p className="text-white text-2xl font-black">
                        {currentScenario.statsCard2.value}
                    </p>
                    <p className="text-[#94A3B8] text-xs font-medium mt-2">
                        {currentScenario.statsCard2.subtext}
                    </p>
                </div>
            </div>
        </div>
    );
}
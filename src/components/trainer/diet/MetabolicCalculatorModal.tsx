
"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Calculator, X, Fire, Target, TrendUp, TrendDown, Minus, PersonSimpleRun, Barbell, Heartbeat, Gear } from "@phosphor-icons/react";

interface MetabolicCalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMetrics: {
        weight: number | null; // kg
        height: number | null; // cm
        age: number | null;
        gender: 'male' | 'female' | null;
        bodyFat?: number | null; // % (e.g. 15.5)
        savedBmr?: number | null;
    } | null;
    onApply: (targets: { kcal: number; protein: number; carbs: number; fat: number }) => void;
}

const NEAT_LEVELS = [
    { label: "Sedentário (Trabalho de escritório, pouco movimento)", value: 1.2 },
    { label: "Levemente Ativo (Em pé parte do dia)", value: 1.375 },
    { label: "Ativo (Movimento constante, trabalho físico leve)", value: 1.55 },
    { label: "Muito Ativo (Trabalho físico pesado)", value: 1.725 },
];

const GOAL_PRESETS = [
    { id: 'cut', label: "Cutting", icon: TrendDown, defaultFactor: -0.20, color: "text-red-500", bg: "bg-red-50" },
    { id: 'maintain', label: "Manutenção", icon: Minus, defaultFactor: 0, color: "text-blue-500", bg: "bg-blue-50" },
    { id: 'bulk', label: "Bulking", icon: TrendUp, defaultFactor: 0.15, color: "text-emerald-500", bg: "bg-emerald-50" },
];

export default function MetabolicCalculatorModal({ isOpen, onClose, initialMetrics, onApply }: MetabolicCalculatorModalProps) {
    // --- SHARED INPUTS (Biometrics & Overall Activity) ---
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [age, setAge] = useState<string>('');
    const [weight, setWeight] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [bodyFat, setBodyFat] = useState<string>('');

    // Activity Inputs
    const [neatLevel, setNeatLevel] = useState(1.2);
    const [trainingDays, setTrainingDays] = useState(4);
    const [trainingDuration, setTrainingDuration] = useState(60); // min
    const [trainingIntensity, setTrainingIntensity] = useState<'low' | 'medium' | 'high'>('medium');
    const [cardioDays, setCardioDays] = useState(2);
    const [cardioDuration, setCardioDuration] = useState(30); // min
    const [cardioIntensity, setCardioIntensity] = useState<'low' | 'medium' | 'high'>('medium');

    // --- VIEW MODE ---
    const [viewMode, setViewMode] = useState<'training' | 'rest'>('training');

    // --- DAY-SPECIFIC CONFIGURATION ---
    const [trainConfig, setTrainConfig] = useState({
        goalId: 'maintain',
        factor: 0,
        proteinKg: 2.0,
        fatKg: 0.8
    });

    const [restConfig, setRestConfig] = useState({
        goalId: 'maintain',
        factor: 0,
        proteinKg: 2.0,
        fatKg: 0.8
    });

    // Helper to update current config based on viewMode
    const setConfig = (updater: (prev: typeof trainConfig) => typeof trainConfig) => {
        if (viewMode === 'training') {
            setTrainConfig(prev => updater(prev));
        } else {
            setRestConfig(prev => updater(prev));
        }
    };

    const currentConfig = viewMode === 'training' ? trainConfig : restConfig;

    // --- RESULTS STATE ---
    const [results, setResults] = useState({
        bmr: 0,
        tdeeTraining: 0,
        tdeeRest: 0,
        training: { kcal: 0, p: 0, c: 0, f: 0 },
        rest: { kcal: 0, p: 0, c: 0, f: 0 },
    });

    // Load initials
    useEffect(() => {
        if (isOpen && initialMetrics) {
            if (initialMetrics.gender) setGender(initialMetrics.gender);
            if (initialMetrics.age) setAge(initialMetrics.age.toString());
            if (initialMetrics.weight) setWeight(initialMetrics.weight.toString());
            if (initialMetrics.height) setHeight(initialMetrics.height.toString());
            if (initialMetrics.bodyFat) setBodyFat(initialMetrics.bodyFat.toString());
        }
    }, [isOpen, initialMetrics]);


    // Core Calculation Logic
    useEffect(() => {
        const w = parseFloat(weight) || 0;
        const h = parseFloat(height) || 0;
        const a = parseFloat(age) || 0;
        const bf = parseFloat(bodyFat) || 0;

        if (!w || !h || !a) {
            setResults(prev => ({ ...prev, bmr: 0 }));
            return;
        }

        // 1. Calculate BMR
        let bmrValue = 0;
        if (bf > 0) {
            const lbm = w * (1 - (bf / 100));
            bmrValue = 370 + (21.6 * lbm);
        } else {
            bmrValue = (10 * w) + (6.25 * h) - (5 * a);
            if (gender === 'male') bmrValue += 5;
            else bmrValue -= 161;
        }
        bmrValue = Math.round(bmrValue);

        // 2. Calculate Burns
        const strengthMETs = { low: 3.5, medium: 5.0, high: 7.0 };
        const cardioMETs = { low: 5.0, medium: 8.0, high: 11.0 };

        const trainingBurn = Math.round(strengthMETs[trainingIntensity] * w * (trainingDuration / 60));
        const cardioBurn = Math.round(cardioMETs[cardioIntensity] * w * (cardioDuration / 60));

        // 3. Calculate TDEEs
        const tdeeRest = Math.round(bmrValue * neatLevel);

        // Training Day Logic
        const effectiveCardioBurn = (cardioDays >= trainingDays) ? cardioBurn : 0;
        const tdeeTraining = tdeeRest + trainingBurn + effectiveCardioBurn;

        // 4. Calculate Targets per Day Type
        // Training
        const trainKcal = Math.round(tdeeTraining * (1 + (trainConfig.factor / 100)));
        const trainP = Math.round(w * trainConfig.proteinKg);
        const trainF = Math.round(w * trainConfig.fatKg);
        const trainC = Math.max(0, Math.round((trainKcal - ((trainP * 4) + (trainF * 9))) / 4));

        // Rest
        const restKcal = Math.round(tdeeRest * (1 + (restConfig.factor / 100)));
        const restP = Math.round(w * restConfig.proteinKg);
        const restF = Math.round(w * restConfig.fatKg);
        const restC = Math.max(0, Math.round((restKcal - ((restP * 4) + (restF * 9))) / 4));

        setResults({
            bmr: bmrValue,
            tdeeTraining,
            tdeeRest,
            training: { kcal: trainKcal, p: trainP, c: trainC, f: trainF },
            rest: { kcal: restKcal, p: restP, c: restC, f: restF },
        });

    }, [weight, height, age, gender, bodyFat, neatLevel, trainingDays, trainingDuration, trainingIntensity, cardioDays, cardioDuration, cardioIntensity, trainConfig, restConfig]);


    const handleApply = () => {
        const targetToApply = viewMode === 'training' ? results.training : results.rest;
        onApply({
            kcal: targetToApply.kcal,
            protein: targetToApply.p,
            carbs: targetToApply.c,
            fat: targetToApply.f
        });
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={open => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-[5%] left-1/2 -translate-x-1/2 w-full max-w-6xl h-[90vh] bg-white rounded-[32px] p-0 shadow-2xl z-50 animate-scale-in outline-none flex flex-col md:flex-row overflow-hidden">

                    {/* Left Panel: Shared Bio & Activity */}
                    <div className="md:w-1/3 p-6 md:p-8 border-r border-slate-100 overflow-y-auto bg-slate-50/50">
                        <Dialog.Title className="text-xl font-bold text-graphite-dark flex items-center gap-2 mb-6">
                            <Calculator className="text-emerald-500" size={24} weight="duotone" />
                            Dados do Aluno
                        </Dialog.Title>

                        <div className="space-y-6">
                            {/* Gender */}
                            <div className="flex gap-2">
                                <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${gender === 'male' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>Masculino</button>
                                <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${gender === 'female' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}>Feminino</button>
                            </div>

                            {/* Biometrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Idade</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none focus:border-emerald-500" placeholder="Anos" /></div>
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Peso (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none focus:border-emerald-500" placeholder="kg" /></div>
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Altura (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none focus:border-emerald-500" placeholder="cm" /></div>
                                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Gordura %</label><input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none focus:border-emerald-500" placeholder="%" /></div>
                            </div>

                            <hr className="border-slate-200" />

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nível de Atividade (NEAT)</label>
                                <select value={neatLevel} onChange={e => setNeatLevel(parseFloat(e.target.value))} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-600 outline-none focus:border-emerald-500 text-xs">
                                    {NEAT_LEVELS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                    <Barbell size={16} weight="duotone" /> Musculação
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div><label className="text-[10px] text-slate-400 block">Dias/sem</label><input type="number" value={trainingDays} onChange={e => setTrainingDays(Number(e.target.value))} className="w-full text-center rounded bg-white border border-slate-200 text-xs py-1" /></div>
                                    <div><label className="text-[10px] text-slate-400 block">Min</label><input type="number" value={trainingDuration} onChange={e => setTrainingDuration(Number(e.target.value))} className="w-full text-center rounded bg-white border border-slate-200 text-xs py-1" /></div>
                                    <div><label className="text-[10px] text-slate-400 block">Intens.</label>
                                        <select value={trainingIntensity} onChange={e => setTrainingIntensity(e.target.value as any)} className="w-full text-[10px] rounded bg-white border border-slate-200 py-1">
                                            <option value="low">Baixa</option>
                                            <option value="medium">Média</option>
                                            <option value="high">Alta</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                                    <Heartbeat size={16} weight="duotone" /> Cardio
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div><label className="text-[10px] text-slate-400 block">Dias/sem</label><input type="number" value={cardioDays} onChange={e => setCardioDays(Number(e.target.value))} className="w-full text-center rounded bg-white border border-slate-200 text-xs py-1" /></div>
                                    <div><label className="text-[10px] text-slate-400 block">Min</label><input type="number" value={cardioDuration} onChange={e => setCardioDuration(Number(e.target.value))} className="w-full text-center rounded bg-white border border-slate-200 text-xs py-1" /></div>
                                    <div><label className="text-[10px] text-slate-400 block">Intens.</label>
                                        <select value={cardioIntensity} onChange={e => setCardioIntensity(e.target.value as any)} className="w-full text-[10px] rounded bg-white border border-slate-200 py-1">
                                            <option value="low">Baixa</option>
                                            <option value="medium">Média</option>
                                            <option value="high">Alta</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Day Configuration & Results */}
                    <div className="flex-1 flex flex-col bg-white">

                        {/* Header Tabs */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                                <button
                                    onClick={() => setViewMode('training')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'training' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Dia de Treino
                                </button>
                                <button
                                    onClick={() => setViewMode('rest')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'rest' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Dia de Descanso
                                </button>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors">
                                <X size={24} weight="bold" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {/* Dynamic Config Area */}
                            <div className="mb-8 animate-fade-in key={viewMode}">
                                <div className="flex items-center gap-2 mb-4">
                                    <Gear size={20} className={viewMode === 'training' ? "text-emerald-500" : "text-blue-500"} weight="duotone" />
                                    <h3 className="text-sm font-bold text-slate-700 uppercase">Configuração: {viewMode === 'training' ? 'Treino' : 'Descanso'}</h3>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3">Objetivo para este dia</label>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {GOAL_PRESETS.map(preset => {
                                            const isActive = currentConfig.goalId === preset.id;
                                            const activeColor = viewMode === 'training' ? preset.color : "text-blue-600";
                                            const activeBg = viewMode === 'training' ? preset.bg : "bg-blue-50";

                                            return (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => {
                                                        setConfig(prev => ({ ...prev, goalId: preset.id, factor: preset.defaultFactor * 100 }));
                                                    }}
                                                    className={`p-3 rounded-xl border-2 text-center transition-all ${isActive ? `border-current ${activeColor} ${activeBg}` : 'border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    <preset.icon size={24} weight="duotone" className="mx-auto mb-2" />
                                                    <span className="block text-xs font-bold">{preset.label}</span>
                                                </button>
                                            )
                                        })}
                                    </div>

                                    <div className="flex items-center gap-4 mb-6">
                                        <input
                                            type="range" min="-30" max="30" step="1"
                                            value={currentConfig.factor}
                                            onChange={e => setConfig(prev => ({ ...prev, factor: parseInt(e.target.value) }))}
                                            className={`flex-1 h-2 bg-slate-200 rounded-full cursor-pointer appearance-none ${viewMode === 'training' ? 'accent-emerald-500' : 'accent-blue-500'}`}
                                        />
                                        <span className={`text-sm font-bold w-16 text-right ${currentConfig.factor > 0 ? "text-emerald-500" : (currentConfig.factor < 0 ? "text-red-500" : "text-slate-500")}`}>
                                            {currentConfig.factor > 0 ? "+" : ""}{currentConfig.factor}%
                                        </span>
                                    </div>

                                    <hr className="border-slate-200 mb-6" />

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Proteína</span>
                                            <span className="text-sm font-black text-slate-700">{currentConfig.proteinKg} g/kg</span>
                                        </div>
                                        <input
                                            type="range" min="1.0" max="3.5" step="0.1"
                                            value={currentConfig.proteinKg}
                                            onChange={e => setConfig(prev => ({ ...prev, proteinKg: parseFloat(e.target.value) }))}
                                            className={`w-full h-1.5 bg-slate-200 rounded-full cursor-pointer appearance-none ${viewMode === 'training' ? 'accent-emerald-500' : 'accent-blue-500'}`}
                                        />

                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Gordura</span>
                                            <span className="text-sm font-black text-slate-700">{currentConfig.fatKg} g/kg</span>
                                        </div>
                                        <input
                                            type="range" min="0.4" max="1.5" step="0.1"
                                            value={currentConfig.fatKg}
                                            onChange={e => setConfig(prev => ({ ...prev, fatKg: parseFloat(e.target.value) }))}
                                            className="w-full h-1.5 bg-slate-200 rounded-full cursor-pointer appearance-none accent-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Results Big Card */}
                            <div className={`text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden transition-colors duration-500 ${viewMode === 'training' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-blue-600 shadow-blue-200'}`}>
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Target size={180} weight="fill" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                                    <div>
                                        <div className="text-sm font-bold text-white/70 uppercase mb-2">
                                            Meta • {viewMode === 'training' ? 'Dia de Treino' : 'Dia de Descanso'}
                                        </div>
                                        <div className="text-6xl font-black tracking-tighter mb-2">
                                            {viewMode === 'training' ? results.training.kcal : results.rest.kcal}
                                        </div>
                                        <div className="text-base font-medium text-white/70">
                                            kcal totais / dia
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center min-w-[80px]">
                                            <div className="text-[10px] font-black uppercase opacity-70 mb-1">PROT</div>
                                            <div className="text-2xl font-black">{viewMode === 'training' ? results.training.p : results.rest.p}g</div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center min-w-[80px]">
                                            <div className="text-[10px] font-black uppercase opacity-70 mb-1">CARB</div>
                                            <div className="text-2xl font-black">{viewMode === 'training' ? results.training.c : results.rest.c}g</div>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center min-w-[80px]">
                                            <div className="text-[10px] font-black uppercase opacity-70 mb-1">GORD</div>
                                            <div className="text-2xl font-black">{viewMode === 'training' ? results.training.f : results.rest.f}g</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-slate-100 bg-white">
                            <button
                                onClick={handleApply}
                                className={`w-full py-4 text-white font-bold rounded-2xl hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg text-lg ${viewMode === 'training' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-blue-500 shadow-blue-200'}`}
                            >
                                {viewMode === 'training' ? 'Aplicar Meta de Treino ao Plano' : 'Aplicar Meta de Descanso ao Plano'}
                            </button>
                        </div>

                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

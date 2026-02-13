'use client';

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight, CheckCircle, Scales, Ruler } from "@phosphor-icons/react";
import { createAssessment } from "@/app/actions/assessments";
// Note: Assuming createAssessment uses server action
// If types are not exported, define them locally or import from a shared types file
// For speed, defining local interface matching the action input

interface AssessmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    onSuccess: () => void;
}

export default function AssessmentFormModal({ isOpen, onClose, studentId, onSuccess }: AssessmentFormModalProps) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        method: 'pollock3', // Default
        weight: '',
        height: '',
        // Skinfolds
        chest: '',
        abdominal: '',
        thigh: '',
        triceps: '',
        suprailiac: '',
        subscapular: '',
        axillary: '',
        // Circumferences
        neck: '',
        shoulder: '',
        chestCircumference: '',
        waist: '',
        abdomenCircumference: '',
        hips: '',
        armRight: '',
        armLeft: '',
        thighRight: '',
        thighLeft: '',
        calfRight: '',
        calfLeft: '',

        observations: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            // Construct payload matching the server action expectation
            const payload: any = {
                studentId,
                date: new Date(formData.date),
                method: formData.method,
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                observations: formData.observations,
                skinfolds: {},
                circumferences: {}
            };

            // Populate skinfolds based on method (simplification for MVP)
            if (formData.method === 'pollock3') {
                // For Men: Chest, Abdominal, Thigh
                // For Women: Triceps, Suprailiac, Thigh
                // We should handle gender... but let's send all filled fields
                if (formData.chest) payload.skinfolds.chest = parseFloat(formData.chest);
                if (formData.abdominal) payload.skinfolds.abdominal = parseFloat(formData.abdominal);
                if (formData.thigh) payload.skinfolds.thigh = parseFloat(formData.thigh);
                if (formData.triceps) payload.skinfolds.triceps = parseFloat(formData.triceps);
                if (formData.suprailiac) payload.skinfolds.suprailiac = parseFloat(formData.suprailiac);
            }

            // Populate circumferences
            const circs = [
                'neck', 'shoulder', 'chestCircumference', 'waist', 'abdomenCircumference',
                'hips', 'armRight', 'armLeft', 'thighRight', 'thighLeft', 'calfRight', 'calfLeft'
            ];

            circs.forEach(key => {
                // @ts-ignore
                if (formData[key]) {
                    // Map frontend key to backend key if needed
                    const backendKey = key === 'abdomenCircumference' ? 'abdomen' : key;
                    // @ts-ignore
                    payload.circumferences[backendKey] = parseFloat(formData[key]);
                }
            });

            await createAssessment(payload);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar avaliação.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-ice-white rounded-[32px] p-2 shadow-2xl z-50 animate-scale-in outline-none max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <Dialog.Title className="sr-only">Nova Avaliação Física</Dialog.Title>

                    <div className="bg-pure-white rounded-[24px] p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-graphite-dark tracking-tight">Nova Avaliação</h2>
                                <p className="text-slate-400 font-medium text-sm">Passo {step} de 2</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={24} weight="bold" />
                            </button>
                        </div>

                        {/* Step 1: Basics */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 transition-all border border-transparent focus:border-emerald-200"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Protocolo</label>
                                        <select
                                            name="method"
                                            value={formData.method}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 transition-all border border-transparent focus:border-emerald-200 appearance-none"
                                        >
                                            <option value="pollock3">Pollock 3 Dobras</option>
                                            {/* Add others later */}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Peso (kg)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="weight"
                                                placeholder="0.0"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className="w-full p-4 pl-12 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 transition-all border border-transparent focus:border-emerald-200"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Scales size={24} weight="duotone" />
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Altura (cm)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="height"
                                                placeholder="0"
                                                value={formData.height}
                                                onChange={handleChange}
                                                className="w-full p-4 pl-12 bg-slate-50 rounded-xl font-bold text-graphite-dark outline-none focus:ring-2 focus:ring-emerald-100 transition-all border border-transparent focus:border-emerald-200"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <Ruler size={24} weight="duotone" />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="py-4 px-8 bg-slate-800 text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                                    >
                                        Próximo <ArrowRight weight="bold" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Measurements */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-600 mb-4 bg-emerald-50 inline-block px-3 py-1 rounded-lg">Dobras Cutâneas (mm)</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {['chest', 'abdominal', 'thigh', 'triceps', 'suprailiac'].map(field => (
                                            <div key={field}>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{field}</label>
                                                <input
                                                    type="number"
                                                    name={field}
                                                    // @ts-ignore
                                                    value={formData[field]}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6">
                                    <h3 className="text-sm font-bold text-indigo-500 mb-4 bg-indigo-50 inline-block px-3 py-1 rounded-lg">Circunferências (cm)</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['waist', 'abdomenCircumference', 'hips', 'armRight', 'armLeft', 'thighRight', 'thighLeft'].map(field => (
                                            <div key={field}>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{field.replace('Circumference', '')}</label>
                                                <input
                                                    type="number"
                                                    name={field}
                                                    // @ts-ignore
                                                    value={formData[field]}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex-1 py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? 'Salvando...' : 'Finalizar Avaliação'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

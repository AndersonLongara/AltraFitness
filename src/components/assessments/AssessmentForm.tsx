'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateAssessmentData, createAssessment } from "@/app/actions/assessments";
import { AssessmentMethod, Gender } from "@/services/assessments";
import { Camera, Ruler, Calculator, PersonSimpleRun, CheckCircle, SpinnerGap } from "@phosphor-icons/react";
import AssessmentCamera from "./AssessmentCamera";
import ConfirmationModal from "../ui/ConfirmationModal";

interface AssessmentFormProps {
    studentId: string;
    studentName: string;
    studentGender: string; // 'male' | 'female'
}

type Step = 'setup' | 'measurements' | 'photos' | 'review';

export default function AssessmentForm({ studentId, studentName, studentGender }: AssessmentFormProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>('setup');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<CreateAssessmentData>>({
        studentId,
        date: new Date(),
        method: 'pollock7',
        gender: (studentGender === 'male' || studentGender === 'female') ? studentGender : 'male',
        skinfolds: {},
        circumferences: {},
        photos: []
    });

    // Helper to update nested state
    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateSkinfold = (fold: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            skinfolds: { ...prev.skinfolds, [fold]: value }
        }));
    };

    const updateCircumference = (measure: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            circumferences: { ...prev.circumferences, [measure]: value }
        }));
    };

    const handlePhotoCapture = (type: string, url: string) => {
        setFormData(prev => {
            const existing = prev.photos?.filter(p => p.type !== type) || [];
            return { ...prev, photos: [...existing, { type: type as any, url }] };
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate required fields
            if (!formData.weight || !formData.height) {
                alert("Peso e Altura são obrigatórios.");
                setIsSubmitting(false);
                return;
            }

            const payload = {
                ...formData,
                gender: formData.gender as Gender,
                // Ensure numbers
                weight: Number(formData.weight),
                height: Number(formData.height),
                age: 30, // TODO: Fetch real age from student data or ask input
            } as CreateAssessmentData;

            const result = await createAssessment(payload);
            if (result.success) {
                router.push(`/dashboard/students/${studentId}/assessments`);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar avaliação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Logic
    const isMale = formData.gender === 'male';
    const method = formData.method;

    const renderSkinfoldInput = (key: string, label: string) => (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{label} (mm)</label>
            <input
                type="number"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0"
                value={formData.skinfolds?.[key as keyof typeof formData.skinfolds] || ''}
                onChange={(e) => updateSkinfold(key, Number(e.target.value))}
            />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-24">

            {/* Progress Stepper */}
            <div className="flex justify-between items-center mb-8 px-4">
                {['setup', 'measurements', 'photos', 'review'].map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step === s ? 'bg-emerald-500 text-white' :
                            ['setup', 'measurements', 'photos', 'review'].indexOf(step) > i ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {i + 1}
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase hidden sm:block">{s}</span>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">

                {/* STEP 1: SETUP */}
                {step === 'setup' && (
                    <div className="p-8 space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-slate-800">Configuração da Avaliação</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Protocolo</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    value={formData.method}
                                    onChange={(e) => updateField('method', e.target.value)}
                                >
                                    <option value="pollock7">Pollock 7 Dobras (Recomendado)</option>
                                    <option value="pollock3">Pollock 3 Dobras</option>
                                    <option value="guedes">Guedes (Brasileiro)</option>
                                    <option value="bioimpedance">Bioimpedância</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Gênero</label>
                                <div className="flex gap-4">
                                    <button
                                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.gender === 'male' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                        onClick={() => updateField('gender', 'male')}
                                    >
                                        Masculino
                                    </button>
                                    <button
                                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.gender === 'female' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                        onClick={() => updateField('gender', 'female')}
                                    >
                                        Feminino
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Peso (kg)</label>
                                    <input
                                        type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="00.0" step="0.1"
                                        value={formData.weight || ''}
                                        onChange={(e) => updateField('weight', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Altura (cm)</label>
                                    <input
                                        type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="170"
                                        value={formData.height || ''}
                                        onChange={(e) => updateField('height', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setStep('measurements')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95">
                                Próximo: Medidas
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: MEASUREMENTS */}
                {step === 'measurements' && (
                    <div className="p-8 space-y-8 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-800">
                                {method === 'bioimpedance' ? 'Dados da Balança' : 'Coleta de Dobras'}
                            </h2>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-lg">{method?.toUpperCase()}</span>
                        </div>

                        {method === 'bioimpedance' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">% Gordura Corporal</label>
                                    <input
                                        type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="ex: 15.5"
                                        onChange={(e) => setFormData(p => ({ ...p, bioimpedance: { ...p.bioimpedance, bodyFat: Number(e.target.value) } }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Massa Magra (kg) (Opcional)</label>
                                    <input
                                        type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="ex: 65.2"
                                        onChange={(e) => setFormData(p => ({ ...p, bioimpedance: { ...p.bioimpedance, leanMass: Number(e.target.value) } }))}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(method === 'pollock7' || method === 'pollock3' && !isMale) && renderSkinfoldInput('triceps', 'Tríceps')}
                                {(method === 'pollock7' || method === 'guedes') && renderSkinfoldInput('subscapular', 'Subescapular')}
                                {(method === 'pollock7' || method === 'pollock3' && isMale) && renderSkinfoldInput('chest', 'Peitoral')}
                                {(method === 'pollock7') && renderSkinfoldInput('axillary', 'Axilar Média')}
                                {(method === 'pollock7' || method === 'pollock3' && !isMale || method === 'guedes') && renderSkinfoldInput('suprailiac', 'Suprailíaca')}
                                {(method === 'pollock7' || method === 'pollock3' && isMale || method === 'guedes') && renderSkinfoldInput('abdominal', 'Abdominal')}
                                {(method === 'pollock7' || method === 'pollock3' || method === 'guedes') && renderSkinfoldInput('thigh', 'Coxa')}
                            </div>
                        )}

                        <div className="border-t border-slate-100 pt-8">
                            <h3 className="text-lg font-bold text-slate-700 mb-4">Perímetros (Opcional)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {['braço direito', 'braço esquerdo', 'coxa direita', 'coxa esquerda', 'cintura', 'abdomen'].map(p => (
                                    <div key={p}>
                                        <label className="block text-sm font-bold text-slate-500 mb-2 ml-1 capitalize">{p} (cm)</label>
                                        <input
                                            type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                            onChange={(e) => updateCircumference(p.replace(' ', ''), Number(e.target.value))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <button onClick={() => setStep('setup')} className="bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">Voltar</button>
                            <button onClick={() => setStep('photos')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95">Próximo: Fotos</button>
                        </div>
                    </div>
                )}

                {/* STEP 3: PHOTOS */}
                {step === 'photos' && (
                    <div className="p-8 space-y-8 animate-fade-in">
                        <h2 className="text-2xl font-black text-slate-800">Registro Visual</h2>
                        <p className="text-slate-500">Adicione fotos para gerar comparativos visuais (Antes x Depois).</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold text-center">Frente</h3>
                                <AssessmentCamera label="Frente" onCapture={(url) => handlePhotoCapture('front', url)} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-center">Costas</h3>
                                <AssessmentCamera label="Costas" onCapture={(url) => handlePhotoCapture('back', url)} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold text-center">Perfil</h3>
                                <AssessmentCamera label="Perfil" onCapture={(url) => handlePhotoCapture('side_right', url)} />
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button onClick={() => setStep('measurements')} className="bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">Voltar</button>
                            <button onClick={() => setStep('review')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95">Próximo: Revisar</button>
                        </div>
                    </div>
                )}

                {/* STEP 4: REVIEW */}
                {step === 'review' && (
                    <div className="p-8 space-y-8 animate-fade-in text-center">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={48} weight="duotone" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800">Tudo pronto!</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Confira se todos os dados estão corretos. Ao salvar, os cálculos de composição corporal serão gerados automaticamente.
                        </p>

                        <div className="bg-slate-50 p-6 rounded-2xl max-w-sm mx-auto text-left space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Protocolo</span>
                                <span className="font-bold text-slate-800 uppercase">{formData.method}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Peso</span>
                                <span className="font-bold text-slate-800">{formData.weight} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Fotos</span>
                                <span className="font-bold text-slate-800">{formData.photos?.length || 0} registradas</span>
                            </div>
                        </div>

                        <div className="flex justify-between max-w-lg mx-auto w-full pt-8">
                            <button onClick={() => setStep('photos')} className="bg-white text-slate-500 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">Voltar</button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95 w-full ml-4 flex justify-center items-center gap-2"
                            >
                                {isSubmitting ? <SpinnerGap className="animate-spin" size={24} /> : <Calculator size={24} />}
                                {isSubmitting ? 'Calculando...' : 'Finalizar Avaliação'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

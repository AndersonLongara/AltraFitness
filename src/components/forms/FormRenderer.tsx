'use client';

import { useState } from "react";
import { submitFormResponse } from "@/app/actions/forms";
import { CaretRight, Check, CheckCircle, Trophy, Fire, CaretDown, CaretUp } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

interface FormRendererProps {
    assignmentId: string;
    form: {
        title: string;
        description: string;
        questions: {
            id: string;
            type: string;
            question: string;
            description?: string;
            options?: string[];
            required: boolean;
            order: number;
        }[];
    };
    onClose?: () => void;
}

export default function FormRenderer({ assignmentId, form, onClose }: FormRendererProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const currentQuestion = form.questions[currentStep];
    const isLastQuestion = currentStep === form.questions.length - 1;

    const handleAnswer = (value: any) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const handleNext = async () => {
        if (currentQuestion.required && !answers[currentQuestion.id]) {
            // Shake effect or alert could go here
            return;
        }

        if (isLastQuestion) {
            await handleSubmit();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await submitFormResponse(assignmentId, Object.entries(answers).map(([qId, ans]) => ({
                questionId: qId,
                answer: String(ans)
            })));

            setIsCompleted(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            setTimeout(() => {
                if (onClose) onClose();
                router.refresh();
            }, 3000);
        } catch (err) {
            console.error(err);
            alert("Erro ao enviar respostas.");
            setIsSubmitting(false);
        }
    };

    if (isCompleted) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
                    <CheckCircle size={48} weight="fill" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Obrigado!</h2>
                <p className="text-slate-500">Suas respostas foram enviadas com sucesso.</p>
            </div>
        );
    }

    const progress = ((currentStep + 1) / form.questions.length) * 100;

    return (
        <div className="flex flex-col h-full bg-white md:rounded-3xl overflow-hidden relative">
            {/* Progress Bar */}
            <div className="h-1.5 bg-slate-100 w-full fixed top-0 left-0 md:absolute z-10">
                <div
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-10 md:px-12 md:py-16 flex flex-col justify-center max-w-2xl mx-auto w-full">
                {/* Question Info */}
                <div className="mb-8">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 block">
                        Pergunta {currentStep + 1} de {form.questions.length}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
                        {currentQuestion.question}
                        {currentQuestion.required && <span className="text-rose-500 ml-1">*</span>}
                    </h2>
                    {currentQuestion.description && (
                        <p className="text-slate-500 mt-3 text-lg">{currentQuestion.description}</p>
                    )}
                </div>

                {/* Input Area */}
                <div className="mb-10">
                    {currentQuestion.type === 'text' && (
                        <input
                            type="text"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="Digite sua resposta..."
                            className="w-full text-xl md:text-2xl font-medium border-b-2 border-slate-200 focus:border-emerald-500 outline-none py-2 bg-transparent placeholder:text-slate-300 transition-colors"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                    )}

                    {currentQuestion.type === 'long_text' && (
                        <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="Digite sua resposta..."
                            className="w-full text-lg border-2 border-slate-100 rounded-xl p-4 focus:border-emerald-500 outline-none bg-slate-50 focus:bg-white transition-all h-32 resize-none"
                            autoFocus
                        />
                    )}

                    {currentQuestion.type === 'scale' && (
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleAnswer(num)}
                                    className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${answers[currentQuestion.id] === num
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                                            : 'border-slate-100 bg-white text-slate-400 hover:border-emerald-200 hover:text-emerald-500'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'single_select' && (
                        <div className="space-y-3">
                            {currentQuestion.options?.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(opt)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${answers[currentQuestion.id] === opt
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold shadow-sm'
                                            : 'border-slate-100 bg-white text-slate-600 hover:border-emerald-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[currentQuestion.id] === opt ? 'border-emerald-500' : 'border-slate-300'
                                            }`}>
                                            {answers[currentQuestion.id] === opt && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                        </div>
                                        {opt}
                                    </span>
                                    {answers[currentQuestion.id] === opt && <Check weight="bold" className="text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting || (currentQuestion.required && !answers[currentQuestion.id])}
                        className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Enviando...' : isLastQuestion ? 'Finalizar' : 'Próxima'}
                        {!isSubmitting && !isLastQuestion && <CaretRight weight="bold" />}
                    </button>
                    {currentStep > 0 && (
                        <button
                            onClick={handlePrevious}
                            className="bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 p-4 rounded-xl transition-colors"
                        >
                            <CaretUp weight="bold" size={24} className="rotate-[-90deg]" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

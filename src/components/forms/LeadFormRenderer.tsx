'use client';

import { useState } from "react";
import { submitLeadFormResponse } from "@/app/actions/lead-forms";
import { CaretRight, Check, CheckCircle, CaretUp, Sparkle } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import Image from "next/image";

interface LeadFormRendererProps {
    token: string;
    form: {
        title: string;
        description: string | null;
        trainer: {
            name: string;
            photoUrl?: string | null;
        };
        questions: {
            id: string;
            type: string;
            question: string;
            description?: string | null;
            options?: string[] | null;
            required: boolean | null;
            order: number;
        }[];
    };
    trainer: {
        name: string;
        photoUrl?: string | null;
    };
    lead: {
        name: string;
    };
}

export function LeadFormRenderer({ token, form, trainer, lead }: LeadFormRendererProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const currentQuestion = form.questions[currentStep];
    const isLastQuestion = currentStep === form.questions.length - 1;

    const handleAnswer = (value: any) => {
        setAnswers({ ...answers, [currentQuestion.id]: value });
    };

    const handleMultiSelectToggle = (option: string) => {
        const current = answers[currentQuestion.id] || [];
        const updated = current.includes(option)
            ? current.filter((o: string) => o !== option)
            : [...current, option];
        setAnswers({ ...answers, [currentQuestion.id]: updated });
    };

    const handleNext = async () => {
        if (Boolean(currentQuestion.required) && !answers[currentQuestion.id]) {
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
            await submitLeadFormResponse(
                token,
                Object.entries(answers).map(([qId, ans]) => ({
                    questionId: qId,
                    answer: Array.isArray(ans) ? ans.join(', ') : String(ans)
                }))
            );

            setIsCompleted(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        } catch (err) {
            console.error(err);
            alert("Erro ao enviar respostas.");
            setIsSubmitting(false);
        }
    };

    // Welcome Screen
    if (!hasStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-ice-white dark:bg-[#131B23]">
                <div className="max-w-2xl w-full text-center animate-in fade-in zoom-in duration-500">
                    {/* Trainer Avatar */}
                    {trainer.photoUrl && (
                        <div className="mb-6 flex justify-center">
                            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                                <Image 
                                    src={trainer.photoUrl} 
                                    alt={trainer.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Greeting */}
                    <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                        <Sparkle weight="fill" className="text-emerald-600 dark:text-emerald-400" size={20} />
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            De {trainer.name}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-deep-teal dark:text-ice-white mb-4 leading-tight">
                        {form.title}
                    </h1>

                    {/* Description */}
                    {form.description && (
                        <p className="text-lg text-soft-gray dark:text-gray-400 mb-8 leading-relaxed">
                            {form.description}
                        </p>
                    )}

                    {/* Question Count */}
                    <p className="text-sm text-soft-gray dark:text-gray-500 mb-8">
                        {form.questions.length} {form.questions.length === 1 ? 'pergunta' : 'perguntas'}
                    </p>

                    {/* Start Button */}
                    <button
                        onClick={() => setHasStarted(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
                    >
                        Começar
                        <CaretRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        );
    }

    // Completion Screen
    if (isCompleted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 bg-ice-white dark:bg-[#131B23]">
                <div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                        <CheckCircle size={48} weight="fill" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-deep-teal dark:text-ice-white mb-2">
                        Obrigado, {lead.name}!
                    </h2>
                    <p className="text-soft-gray dark:text-gray-400">
                        Suas respostas foram enviadas com sucesso.
                    </p>
                </div>
            </div>
        );
    }

    const progress = ((currentStep + 1) / form.questions.length) * 100;

    // Question Form
    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] flex flex-col">
            {/* Progress Bar */}
            <div className="h-1.5 bg-slate-100 dark:bg-gray-800 w-full fixed top-0 left-0 z-10">
                <div
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-10 md:px-12 md:py-16 flex flex-col justify-center max-w-2xl mx-auto w-full mt-6">
                {/* Question Info */}
                <div className="mb-8">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 block">
                        Pergunta {currentStep + 1} de {form.questions.length}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-deep-teal dark:text-ice-white leading-tight">
                        {currentQuestion.question}
                        {Boolean(currentQuestion.required) && <span className="text-rose-500 ml-1">*</span>}
                    </h2>
                    {currentQuestion.description && (
                        <p className="text-soft-gray dark:text-gray-400 mt-3 text-lg">{currentQuestion.description}</p>
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
                            className="w-full text-xl md:text-2xl font-medium border-b-2 border-slate-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none py-2 bg-transparent placeholder:text-slate-300 dark:placeholder:text-gray-600 text-deep-teal dark:text-ice-white transition-colors"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                    )}

                    {currentQuestion.type === 'long_text' && (
                        <textarea
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="Digite sua resposta..."
                            className="w-full text-lg border-2 border-slate-100 dark:border-gray-700 rounded-xl p-4 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none bg-slate-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-750 text-deep-teal dark:text-ice-white transition-all h-32 resize-none"
                            autoFocus
                        />
                    )}

                    {currentQuestion.type === 'number' && (
                        <input
                            type="number"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                            placeholder="Digite um número..."
                            className="w-full text-xl md:text-2xl font-medium border-b-2 border-slate-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none py-2 bg-transparent placeholder:text-slate-300 dark:placeholder:text-gray-600 text-deep-teal dark:text-ice-white transition-colors"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                    )}

                    {currentQuestion.type === 'date' && (
                        <input
                            type="date"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => handleAnswer(e.target.value)}
                            className="w-full text-xl md:text-2xl font-medium border-b-2 border-slate-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 outline-none py-2 bg-transparent text-deep-teal dark:text-ice-white transition-colors"
                            autoFocus
                        />
                    )}

                    {currentQuestion.type === 'scale' && (
                        <div className="flex justify-between gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleAnswer(num)}
                                    className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all ${
                                        answers[currentQuestion.id] === num
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                            : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-400 dark:text-gray-500 hover:border-emerald-200 dark:hover:border-emerald-600 hover:text-emerald-500 dark:hover:text-emerald-400'
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
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                                        answers[currentQuestion.id] === opt
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 font-bold shadow-sm'
                                            : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:border-emerald-200 dark:hover:border-emerald-600 hover:bg-slate-50 dark:hover:bg-gray-750'
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                            answers[currentQuestion.id] === opt 
                                                ? 'border-emerald-500' 
                                                : 'border-slate-300 dark:border-gray-600'
                                        }`}>
                                            {answers[currentQuestion.id] === opt && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                            )}
                                        </div>
                                        {opt}
                                    </span>
                                    {answers[currentQuestion.id] === opt && (
                                        <Check weight="bold" className="text-emerald-500 dark:text-emerald-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.type === 'multi_select' && (
                        <div className="space-y-3">
                            {currentQuestion.options?.map((opt, idx) => {
                                const isSelected = (answers[currentQuestion.id] || []).includes(opt);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleMultiSelectToggle(opt)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                                            isSelected
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 font-bold shadow-sm'
                                                : 'border-slate-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 hover:border-emerald-200 dark:hover:border-emerald-600 hover:bg-slate-50 dark:hover:bg-gray-750'
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                                isSelected 
                                                    ? 'border-emerald-500 bg-emerald-500' 
                                                    : 'border-slate-300 dark:border-gray-600'
                                            }`}>
                                                {isSelected && <Check weight="bold" className="text-white" size={14} />}
                                            </div>
                                            {opt}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleNext}
                        disabled={isSubmitting || (Boolean(currentQuestion.required) && !answers[currentQuestion.id])}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Enviando...' : isLastQuestion ? 'Finalizar' : 'Próxima'}
                        {!isSubmitting && !isLastQuestion && <CaretRight weight="bold" />}
                    </button>
                    {currentStep > 0 && (
                        <button
                            onClick={handlePrevious}
                            className="bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600 p-4 rounded-xl transition-colors"
                        >
                            <CaretUp weight="bold" size={24} className="rotate-[-90deg]" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from "react";
import { getFormById, updateForm } from "@/app/actions/forms";
import { Plus, Trash, TextT, ListNumbers, CheckSquare, CaretDown, CaretUp, Calendar, Hash, CheckCircle, DotsSixVertical, At, Phone } from "@phosphor-icons/react";
import { useRouter, useParams } from "next/navigation";
import LayoutSidebar from "@/components/layout/LayoutSidebar";

export default function EditFormPage() {
    const router = useRouter();
    const params = useParams();
    const formId = params.id as string;
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formType, setFormType] = useState<'custom' | 'lead_questionnaire'>('custom');
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [welcomeTitle, setWelcomeTitle] = useState("");
    const [triggerType, setTriggerType] = useState("manual");
    const [isActive, setIsActive] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Load existing form data
    useEffect(() => {
        const loadForm = async () => {
            try {
                const form = await getFormById(formId);
                if (!form) {
                    alert("Formulário não encontrado");
                    router.push('/dashboard/forms');
                    return;
                }
                setTitle(form.title);
                setDescription(form.description || "");
                setWelcomeTitle(form.welcomeTitle || "");
                setFormType((form.type === 'lead_questionnaire' ? 'lead_questionnaire' : 'custom') as any);
                setTriggerType(form.triggerType || "manual");
                setIsActive(form.isActive ?? true);
                setQuestions(form.questions.map((q: any) => ({
                    id: q.id,
                    type: q.type,
                    question: q.question,
                    description: q.description || '',
                    required: q.required,
                    order: q.order,
                    options: q.options || (q.type.includes('select') ? ['Opção 1'] : undefined)
                })));
            } catch (error) {
                console.error("Failed to load form", error);
                alert("Erro ao carregar formulário");
                router.push('/dashboard/forms');
            } finally {
                setIsLoading(false);
            }
        };
        
        if (formId) {
            loadForm();
        }
    }, [formId, router]);

    const addQuestion = (type: string) => {
        setQuestions([
            ...questions,
            {
                id: crypto.randomUUID(),
                type,
                question: '',
                description: '',
                required: true,
                order: questions.length,
                options: type.includes('select') ? ['Opção 1'] : undefined
            }
        ]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        };

        const newQuestions = [...questions];
        const [draggedItem] = newQuestions.splice(draggedIndex, 1);
        newQuestions.splice(dropIndex, 0, draggedItem);
        
        setQuestions(newQuestions);
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleSave = async () => {
        if (!title) return alert("Adicione um título");
        setIsSaving(true);
        try {
            await updateForm(formId, {
                title,
                description,
                welcomeTitle,
                type: formType,
                triggerType,
                isActive,
                questions: questions.map((q, index) => ({
                    id: q.id,
                    type: q.type,
                    question: q.question,
                    description: q.description,
                    options: q.options,
                    required: q.required,
                    order: index
                }))
            });
            
            router.push('/dashboard/forms');
        } catch (err) {
            console.error(err);
            alert("Erro ao atualizar formulário");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
                <LayoutSidebar />
                <main className="max-w-4xl mx-auto p-6 md:p-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                            <p className="text-slate-500 dark:text-slate-400">Carregando formulário...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-4xl mx-auto p-6 md:p-8">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">
                            Editar {formType === 'lead_questionnaire' ? 'Questionário' : 'Formulário'}
                        </h1>
                        <p className="text-soft-gray dark:text-gray-400 mt-1">
                            Atualize as informações do seu formulário
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-performance-green text-graphite-dark font-bold rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </header>

                <div className="space-y-6">
                    {/* Form Type Display (Read-only) */}
                    <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Tipo de Formulário</label>
                        <div className="flex gap-2">
                            <div className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border ${formType === 'custom'
                                ? 'bg-graphite-dark dark:bg-white text-white dark:text-graphite-dark border-graphite-dark dark:border-white'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                                }`}>
                                📝 Personalizado (Alunos)
                            </div>
                            <div className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold border ${formType === 'lead_questionnaire'
                                ? 'bg-graphite-dark dark:bg-white text-white dark:text-graphite-dark border-graphite-dark dark:border-white'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                                }`}>
                                💬 Questionário (Leads)
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">O tipo de formulário não pode ser alterado após a criação</p>
                    </div>

                    {/* General Settings */}
                    <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ex: Check-in Semanal"
                                className="w-full text-lg font-bold border-b-2 border-slate-100 dark:border-white/10 bg-transparent focus:border-emerald-500 dark:focus:border-performance-green outline-none py-2 transition-colors text-graphite-dark dark:text-white placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Descrição (Opcional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Instruções para o aluno..."
                                className="w-full border border-slate-200 dark:border-white/20 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 dark:focus:ring-performance-green/20 outline-none resize-none h-24 bg-white dark:bg-white/5 text-graphite-dark dark:text-white placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
                                Título de Boas-Vindas (Opcional)
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">Aparece na tela inicial</span>
                            </label>
                            <input
                                type="text"
                                value={welcomeTitle}
                                onChange={e => setWelcomeTitle(e.target.value)}
                                placeholder="Ex: Bem-vindo! Vamos começar sua avaliação"
                                className="w-full border border-slate-200 dark:border-white/20 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 dark:focus:ring-performance-green/20 outline-none bg-white dark:bg-white/5 text-graphite-dark dark:text-white placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Gatilho de Envio</label>
                            <div className="flex gap-2 flex-wrap">
                                {formType === 'custom' && (
                                    <>
                                        {['manual', 'on_signup', 'weekly'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setTriggerType(type)}
                                                type="button"
                                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${triggerType === type
                                                    ? 'bg-graphite-dark dark:bg-white text-white dark:text-graphite-dark border-graphite-dark dark:border-white'
                                                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/30'
                                                    }`}
                                            >
                                                {type === 'manual' && 'Manual'}
                                                {type === 'on_signup' && 'Ao Cadastrar'}
                                                {type === 'weekly' && 'Semanalmente'}
                                            </button>
                                        ))}
                                    </>
                                )}
                                {formType === 'lead_questionnaire' && (
                                    <>
                                        {['manual', 'on_scheduled'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setTriggerType(type)}
                                                type="button"
                                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${triggerType === type
                                                    ? 'bg-graphite-dark dark:bg-white text-white dark:text-graphite-dark border-graphite-dark dark:border-white'
                                                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/20 hover:border-slate-300 dark:hover:border-white/30'
                                                    }`}
                                            >
                                                {type === 'manual' && 'Manual'}
                                                {type === 'on_scheduled' && 'Ao Agendar Reunião'}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-graphite-dark dark:text-white">Perguntas</h2>

                        {questions.map((q, index) => (
                            <div
                                key={q.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border transition-all cursor-move ${
                                    dragOverIndex === index && draggedIndex !== index
                                        ? 'border-emerald-500 dark:border-emerald-500 scale-105'
                                        : 'border-slate-100 dark:border-white/10'
                                } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="pt-2 cursor-grab active:cursor-grabbing">
                                        <DotsSixVertical size={24} className="text-slate-400 dark:text-slate-500" weight="bold" />
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start gap-2">
                                            <input
                                                type="text"
                                                value={q.question}
                                                onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                                                placeholder="Escreva a pergunta aqui..."
                                                className="flex-1 font-bold text-slate-700 dark:text-white placeholder:text-slate-400 bg-transparent outline-none"
                                                autoFocus
                                            />
                                            <select
                                                value={q.type}
                                                onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                                                className="bg-slate-50 dark:bg-white/10 border-0 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 py-1 pl-2 pr-8"
                                            >
                                                <option value="text">Texto Curto</option>
                                                <option value="long_text">Texto Longo</option>
                                                <option value="email">E-mail</option>
                                                <option value="phone">Celular</option>
                                                <option value="number">Número</option>
                                                <option value="date">Data</option>
                                                <option value="scale">Escala 1-5</option>
                                                <option value="single_select">Seleção Única</option>
                                                <option value="multi_select">Múltipla Escolha</option>
                                            </select>
                                        </div>

                                        {/* Question Description/Subtitle */}
                                        <div>
                                            <input
                                                type="text"
                                                value={q.description || ''}
                                                onChange={e => updateQuestion(q.id, 'description', e.target.value)}
                                                placeholder="Adicione um subtítulo ou instrução (opcional)..."
                                                className="w-full text-sm text-slate-600 dark:text-slate-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent border-b border-slate-100 dark:border-white/10 focus:border-emerald-300 dark:focus:border-emerald-500/50 outline-none py-1 transition-colors"
                                            />
                                        </div>

                                        {(q.type === 'single_select' || q.type === 'multi_select') && (
                                            <div className="space-y-2 pl-4 border-l-2 border-slate-200 dark:border-white/10">
                                                {q.options?.map((opt: string, i: number) => (
                                                    <div key={i} className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={e => {
                                                                const newOptions = [...q.options];
                                                                newOptions[i] = e.target.value;
                                                                updateQuestion(q.id, 'options', newOptions);
                                                            }}
                                                            className="flex-1 text-sm bg-transparent border-b border-slate-200 dark:border-white/10 outline-none py-1 text-slate-700 dark:text-slate-300"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newOptions = q.options.filter((_: any, idx: number) => idx !== i);
                                                                updateQuestion(q.id, 'options', newOptions);
                                                            }}
                                                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                                        >
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuestion(q.id, 'options', [...(q.options || []), `Opção ${(q.options?.length || 0) + 1}`])}
                                                    className="text-xs font-bold text-emerald-600 dark:text-performance-green hover:text-emerald-700 mt-2"
                                                >
                                                    + Adicionar Opção
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 pt-2">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={q.required}
                                                    onChange={e => updateQuestion(q.id, 'required', e.target.checked)}
                                                    className="rounded text-emerald-500 focus:ring-emerald-500"
                                                />
                                                Obrigatória
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeQuestion(q.id)}
                                        className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash size={20} weight="bold" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Toolbox */}
                    <div className="flex justify-center gap-4 py-8 flex-wrap">
                        <button type="button" onClick={() => addQuestion('text')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1E2A36] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all w-24 group">
                            <TextT size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-performance-green" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Texto</span>
                        </button>
                        <button type="button" onClick={() => addQuestion('email')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1E2A36] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all w-24 group">
                            <At size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-performance-green" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">E-mail</span>
                        </button>
                        <button type="button" onClick={() => addQuestion('phone')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1E2A36] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all w-24 group">
                            <Phone size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-performance-green" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Celular</span>
                        </button>
                        <button type="button" onClick={() => addQuestion('number')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1E2A36] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all w-24 group">
                            <Hash size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-performance-green" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Número</span>
                        </button>
                        <button type="button" onClick={() => addQuestion('date')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1E2A36] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all w-24 group">
                            <Calendar size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-performance-green" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Data</span>
                        </button>
                        <button type="button" onClick={() => addQuestion('scale')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1E2A36] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all w-24 group">
                            <ListNumbers size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-performance-green" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Escala</span>
                        </button>
                        <button type="button" onClick={() => addQuestion('single_select')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1E2A36] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all w-24 group">
                            <CheckSquare size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-performance-green" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Seleção</span>
                        </button>
                        <button type="button" onClick={() => addQuestion('multi_select')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1E2A36] hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10 transition-all w-24 group">
                            <CheckCircle size={24} className="text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-performance-green" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Múltipla</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

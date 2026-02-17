'use client';

import { useState } from "react";
import { createForm } from "@/app/actions/forms";
import { Plus, Trash, TextT, ListNumbers, CheckSquare, Hash, Calendar, CheckCircle, DotsSixVertical, At } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import LayoutSidebar from "@/components/layout/LayoutSidebar";

export default function NewQuestionnairePage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [welcomeTitle, setWelcomeTitle] = useState("");
    const [questions, setQuestions] = useState<any[]>([
        { id: crypto.randomUUID(), type: 'text', question: '', description: '', required: true, order: 0 }
    ]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
        }

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
        if (questions.length === 0) return alert("Adicione pelo menos uma pergunta");
        
        setIsSaving(true);
        try {
            await createForm({
                title,
                description,
                welcomeTitle,
                type: 'lead_questionnaire',
                triggerType: 'manual', // Default to manual
                questions: questions.map((q, index) => ({
                    type: q.type,
                    question: q.question,
                    description: q.description,
                    options: q.options,
                    required: q.required,
                    order: index
                }))
            });
            router.push('/dashboard/questionnaires');
        } catch (err) {
            console.error(err);
            alert("Erro ao salvar questionário");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-ice-white dark:bg-[#131B23] pl-0 md:pl-24 pb-24">
            <LayoutSidebar />

            <main className="max-w-4xl mx-auto p-6 md:p-8">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-graphite-dark dark:text-white tracking-tight">Novo Questionário</h1>
                        <p className="text-soft-gray dark:text-gray-400 mt-1">Crie um template de questionário para seus leads</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-performance-green text-graphite-dark font-bold rounded-2xl hover:brightness-110 disabled:opacity-50 transition-all shadow-lg"
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Questionário'}
                    </button>
                </header>

                <div className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border border-slate-100 dark:border-white/10 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Título do Questionário</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ex: Avaliação Pré-Consultoria"
                                className="w-full text-lg font-bold border-b-2 border-slate-100 dark:border-white/10 bg-transparent focus:border-emerald-500 dark:focus:border-performance-green outline-none py-2 transition-colors text-graphite-dark dark:text-white placeholder:text-slate-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Descrição (Opcional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Breve descrição sobre o propósito deste questionário..."
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
                    </div>

                    {/* Questions Builder */}
                    <div className="space-y-4">
                        {questions.map((q, index) => (
                            <div 
                                key={q.id} 
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`bg-white dark:bg-[#1E2A36] p-6 rounded-3xl soft-shadow border relative group transition-all cursor-move ${
                                    draggedIndex === index 
                                        ? 'opacity-50 border-emerald-400 dark:border-emerald-500' 
                                        : dragOverIndex === index 
                                            ? 'border-emerald-300 dark:border-emerald-500/50 scale-[1.02]' 
                                            : 'border-slate-100 dark:border-white/10'
                                }`}
                            >
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button type="button" onClick={() => removeQuestion(q.id)} className="text-slate-300 dark:text-slate-500 hover:text-rose-500 p-2 transition-colors">
                                        <Trash size={20} />
                                    </button>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors cursor-grab active:cursor-grabbing">
                                            <DotsSixVertical size={20} weight="bold" />
                                        </div>
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center text-sm">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex gap-4">
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

                                        {/* Options for Select Types */}
                                        {q.type.includes('select') && (
                                            <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-white/10">
                                                {q.options?.map((opt: string, optIndex: number) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-500"></div>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={e => {
                                                                const newOptions = [...q.options];
                                                                newOptions[optIndex] = e.target.value;
                                                                updateQuestion(q.id, 'options', newOptions);
                                                            }}
                                                            className="text-sm text-slate-600 dark:text-slate-300 bg-transparent outline-none border-b border-transparent focus:border-emerald-300 dark:focus:border-performance-green"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newOptions = q.options.filter((_: any, i: number) => i !== optIndex);
                                                                updateQuestion(q.id, 'options', newOptions);
                                                            }}
                                                            className="text-slate-300 dark:text-slate-500 hover:text-rose-400"
                                                        >
                                                            &times;
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

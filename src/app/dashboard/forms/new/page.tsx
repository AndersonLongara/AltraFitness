'use client';

import { useState } from "react";
import { createForm } from "@/app/actions/forms";
import { Plus, Trash, TextT, ListNumbers, CheckSquare, CaretDown, CaretUp } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function NewFormPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [triggerType, setTriggerType] = useState("manual");
    const [questions, setQuestions] = useState<any[]>([
        { id: crypto.randomUUID(), type: 'text', question: '', required: true, order: 0 }
    ]);

    const addQuestion = (type: string) => {
        setQuestions([
            ...questions,
            {
                id: crypto.randomUUID(),
                type,
                question: '',
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

    const handleSave = async () => {
        if (!title) return alert("Adicione um título");
        setIsSaving(true);
        try {
            await createForm({
                title,
                description,
                type: 'custom',
                triggerType,
                questions: questions.map((q, index) => ({
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
            alert("Erro ao salvar formulário");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-ice-white pl-0 md:pl-24 pb-24">
            <Sidebar />

            <main className="max-w-4xl mx-auto p-6 md:p-8">
                <header className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-extrabold text-graphite-dark">Novo Formulário</h1>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-lg shadow-emerald-100"
                    >
                        {isSaving ? 'Salvando...' : 'Publicar Formulário'}
                    </button>
                </header>

                <div className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-white p-6 rounded-3xl soft-shadow border border-slate-50 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ex: Check-in Semanal"
                                className="w-full text-lg font-bold border-b-2 border-slate-100 focus:border-emerald-500 outline-none py-2 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Descrição (Opcional)</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Instruções para o aluno..."
                                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-100 outline-none resize-none h-24"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Gatilho de Envio</label>
                            <div className="flex gap-2">
                                {['manual', 'on_signup', 'weekly'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setTriggerType(type)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${triggerType === type
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        {type === 'manual' && 'Manual'}
                                        {type === 'on_signup' && 'Ao Cadastrar'}
                                        {type === 'weekly' && 'Semanalmente'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Questions Builder */}
                    <div className="space-y-4">
                        {questions.map((q, index) => (
                            <div key={q.id} className="bg-white p-6 rounded-3xl soft-shadow border border-slate-50 relative group">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => removeQuestion(q.id)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors">
                                        <Trash size={20} />
                                    </button>
                                </div>

                                <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-sm">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={q.question}
                                                onChange={e => updateQuestion(q.id, 'question', e.target.value)}
                                                placeholder="Escreva a pergunta aqui..."
                                                className="flex-1 font-bold text-slate-700 placeholder:text-slate-300 outline-none"
                                                autoFocus
                                            />
                                            <select
                                                value={q.type}
                                                onChange={e => updateQuestion(q.id, 'type', e.target.value)}
                                                className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-600 py-1 pl-2 pr-8"
                                            >
                                                <option value="text">Texto Curto</option>
                                                <option value="long_text">Texto Longo</option>
                                                <option value="scale">Escala 1-5</option>
                                                <option value="single_select">Seleção Única</option>
                                            </select>
                                        </div>

                                        {/* Options for Select Types */}
                                        {q.type.includes('select') && (
                                            <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                                                {q.options?.map((opt: string, optIndex: number) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full border border-slate-300"></div>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={e => {
                                                                const newOptions = [...q.options];
                                                                newOptions[optIndex] = e.target.value;
                                                                updateQuestion(q.id, 'options', newOptions);
                                                            }}
                                                            className="text-sm text-slate-600 outline-none border-b border-transparent focus:border-emerald-300"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newOptions = q.options.filter((_: any, i: number) => i !== optIndex);
                                                                updateQuestion(q.id, 'options', newOptions);
                                                            }}
                                                            className="text-slate-300 hover:text-rose-400"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => updateQuestion(q.id, 'options', [...(q.options || []), `Opção ${(q.options?.length || 0) + 1}`])}
                                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2"
                                                >
                                                    + Adicionar Opção
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 pt-2">
                                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
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
                    <div className="flex justify-center gap-4 py-8">
                        <button onClick={() => addQuestion('text')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 transition-all w-24 group">
                            <TextT size={24} className="text-slate-400 group-hover:text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Texto</span>
                        </button>
                        <button onClick={() => addQuestion('scale')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 transition-all w-24 group">
                            <ListNumbers size={24} className="text-slate-400 group-hover:text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Escala</span>
                        </button>
                        <button onClick={() => addQuestion('single_select')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-100 transition-all w-24 group">
                            <CheckSquare size={24} className="text-slate-400 group-hover:text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Seleção</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

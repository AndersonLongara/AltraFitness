"use client";

import { useState, useRef, useEffect } from "react";
import { Robot, Sparkle, CaretRight, PaperPlaneRight, X } from "@phosphor-icons/react";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function AiManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'Olá! Sou seu Coach Digital. Analisei os dados de hoje: 3 alunos com risco de evasão. Quer ver os detalhes?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!response.ok) {
                let errorMessage = response.statusText;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || response.statusText;
                } catch {
                    try {
                        errorMessage = await response.text();
                    } catch { }
                }
                throw new Error("Erro no servidor: " + errorMessage);
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' };

            setMessages(prev => [...prev, assistantMsg]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    assistantMsg.content += chunk;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = { ...assistantMsg };
                        return newMsgs;
                    });
                }
            }
        } catch (err: any) {
            console.error("Chat error:", err);
            setError(err.message || "Erro ao conectar com o Coach AI.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isOpen) {
        return (
            <div className="bg-dark-navy p-6 rounded-4xl soft-shadow text-white relative overflow-hidden h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Robot size={24} weight="duotone" className="text-performance-green" />
                        <span className="font-bold text-lg">Coach AI</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-white/20">
                    {messages.map(m => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${m.role === 'user'
                                ? 'bg-performance-green text-graphite-dark rounded-tr-none'
                                : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-2">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 bg-rose-500/20 text-rose-300 text-xs rounded-xl border border-rose-500/30">
                            {error}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={onSubmit} className="relative">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Pergunte algo..."
                        className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-performance-green/50 transition-colors placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue}
                        className="absolute right-2 top-2 p-2 bg-performance-green rounded-xl text-graphite-dark disabled:opacity-50 hover:brightness-110 transition-colors z-20 cursor-pointer"
                    >
                        <PaperPlaneRight size={16} weight="fill" />
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-dark-navy p-6 md:p-8 rounded-4xl soft-shadow text-white relative overflow-hidden group h-full flex flex-col justify-between">
            {/* Decorative Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 blur-[100px] opacity-20 -mr-20 -mt-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5">
                        <Robot size={32} weight="duotone" className="text-performance-green" />
                    </div>
                    <span className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
                        Beta Insight
                    </span>
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Risco de Evasão</h3>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                        <span className="text-white font-semibold">3 alunos</span> apresentaram queda na frequência (-40%) esta semana.
                    </p>
                </div>
            </div>

            <div className="relative z-10 mt-auto">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full py-4 bg-performance-green text-graphite-dark font-bold rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-emerald-900/20"
                >
                    <Sparkle size={20} weight="fill" />
                    Ver Análise (IA)
                    <CaretRight size={16} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

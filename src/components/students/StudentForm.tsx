"use client";

import { X, FloppyDisk, CheckCircle, Calendar } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface Plan {
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    active?: boolean;
}

interface StudentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    plans?: Plan[];
    initialData?: {
        id?: string;
        name: string;
        email: string;
        cpf: string;
        phone: string;
        planEnd: string;
        planId?: string;
        birthDate?: string | Date;
        gender?: 'male' | 'female';
        height?: number;
        weight?: number;
    } | null;
}

export default function StudentForm({ isOpen, onClose, onSubmit, plans = [], initialData }: StudentFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [phone, setPhone] = useState("");
    const [planEnd, setPlanEnd] = useState("");
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    // New Fields
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState<'male' | 'female' | "">("");
    const [height, setHeight] = useState(""); // cm
    const [weight, setWeight] = useState(""); // kg

    const activePlans = plans.filter(p => p.active !== false);

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || "");
            setEmail(initialData.email || "");
            setCpf(initialData.cpf || "");
            setPhone(initialData.phone || "");
            setPlanEnd(initialData.planEnd ? format(new Date(initialData.planEnd), 'yyyy-MM-dd') : "");
            setSelectedPlanId(initialData.planId || "");

            // Populate new fields
            setBirthDate(initialData.birthDate ? format(new Date(initialData.birthDate), 'yyyy-MM-dd') : "");
            setGender(initialData.gender || "");
            setHeight(initialData.height ? initialData.height.toString() : "");
            setWeight(initialData.weight ? (initialData.weight / 1000).toString() : "");

        } else if (isOpen && !initialData) {
            // Reset
            setName("");
            setEmail("");
            setCpf("");
            setPhone("");
            setPlanEnd("");
            setSelectedPlanId("");
            setStartDate(new Date().toISOString().split('T')[0]);
            setBirthDate("");
            setGender("");
            setHeight("");
            setWeight("");
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})/, "$1-$2")
            .replace(/(-\d{2})\d+?$/, "$1");
    };

    const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCPF(e.target.value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const submissionData = {
            id: initialData?.id,
            name,
            email,
            cpf: cpf.replace(/\D/g, ""), // Save only numbers
            phone,
            planId: selectedPlanId || undefined,
            startDate: startDate || undefined,
            planEnd: planEnd ? new Date(planEnd) : undefined,
            // New Fields
            birthDate: birthDate ? new Date(birthDate) : undefined,
            gender: gender || undefined,
            height: height ? parseInt(height) : undefined, // cm
            weight: weight ? Math.round(parseFloat(weight.replace(',', '.')) * 1000) : undefined, // kg -> grams
        };

        onSubmit(submissionData);
        onClose();
    };

    const selectedPlan = activePlans.find(p => p.id === selectedPlanId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-dark/60 dark:bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-pure-white dark:bg-[#1E2A36] w-full max-w-2xl rounded-3xl soft-shadow overflow-hidden my-auto border border-slate-100 dark:border-white/10">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#1E2A36] sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-graphite-dark dark:text-white">{initialData ? 'Editar Aluno' : 'Novo Aluno'}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 dark:hover:text-white hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors">
                        <X size={24} weight="bold" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-b border-emerald-100 dark:border-emerald-500/30 pb-2">Informações Pessoais</h4>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                            <input
                                autoFocus
                                type="text"
                                required
                                className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                placeholder="Ex: João da Silva"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CPF (Obrigatório)</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={14}
                                    placeholder="000.000.000-00"
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                    value={cpf}
                                    onChange={handleCPFChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data de Nascimento</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 text-slate-500 dark:text-slate-300 border border-transparent dark:border-white/10"
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gênero</label>
                                <select
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 appearance-none cursor-pointer border border-transparent dark:border-white/10"
                                    value={gender}
                                    onChange={e => setGender(e.target.value as any)}
                                >
                                    <option value="">Selecione...</option>
                                    <option value="male">Masculino</option>
                                    <option value="female">Feminino</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Telefone</label>
                                <input
                                    type="tel"
                                    placeholder="(00) 00000-0000"
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="exemplo@email.com"
                                className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Physical Info Section */}
                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-b border-emerald-100 dark:border-emerald-500/30 pb-2">Dados Físicos Iniciais</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Altura (cm)</label>
                                <input
                                    type="number"
                                    placeholder="175"
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Peso (kg)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    placeholder="70.5"
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 placeholder:text-slate-300 dark:placeholder:text-slate-500 border border-transparent dark:border-white/10"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Plan Info Section */}
                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-b border-emerald-100 dark:border-emerald-500/30 pb-2">Plano</h4>
                        
                        {/* Plan Selection */}
                        {!initialData && activePlans.length > 0 && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Plano Contratado</label>
                                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
                                    {activePlans.map(plan => (
                                        <label
                                            key={plan.id}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group
                                                ${selectedPlanId === plan.id
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/50 ring-1 ring-emerald-400 dark:ring-emerald-500'
                                                    : 'bg-slate-50 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="plan"
                                                    value={plan.id}
                                                    checked={selectedPlanId === plan.id}
                                                    onChange={(e) => setSelectedPlanId(e.target.value)}
                                                    className="hidden"
                                                />
                                                <div>
                                                    <div className="font-bold text-graphite-dark dark:text-white">{plan.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                        {plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                                    {(plan.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </div>
                                                {selectedPlanId === plan.id && (
                                                    <CheckCircle size={20} weight="fill" className="text-emerald-500" />
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!initialData && activePlans.length === 0 && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 text-sm font-medium border border-amber-100 dark:border-amber-500/30">
                                Nenhum plano cadastrado. Crie planos na aba <strong>Financeiro</strong>.
                            </div>
                        )}

                        {/* Start Date (when plan selected) */}
                        {!initialData && selectedPlanId && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Início da Vigência</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                                        <Calendar size={20} weight="duotone" />
                                    </span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-4 pl-12 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 border border-transparent dark:border-white/10"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Summary */}
                        {!initialData && selectedPlan && (
                            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-white/10">
                                <div className="text-xs font-bold text-slate-400 uppercase">Valor do Plano</div>
                                <div className="text-xl font-extrabold text-graphite-dark dark:text-white">
                                    {(selectedPlan.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                            </div>
                        )}

                        {/* Legacy date field for editing */}
                        {initialData && (
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vencimento do Plano</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 dark:bg-white/10 rounded-xl font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-500/30 text-slate-500 dark:text-slate-300 border border-transparent dark:border-white/10"
                                    value={planEnd}
                                    onChange={e => setPlanEnd(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end gap-4 border-t border-slate-100 dark:border-white/10 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-4 bg-performance-green dark:bg-emerald-500 text-graphite-dark dark:text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <FloppyDisk size={20} weight="bold" />
                            {initialData ? 'Atualizar Aluno' : 'Salvar Aluno'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

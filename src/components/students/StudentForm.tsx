"use client";

import { X, FloppyDisk } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface StudentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: {
        id?: string;
        name: string;
        email: string;
        cpf: string;
        phone: string;
        planEnd: string;
        birthDate?: string | Date;
        gender?: 'male' | 'female';
        height?: number;
        weight?: number;
    } | null;
}

export default function StudentForm({ isOpen, onClose, onSubmit, initialData }: StudentFormProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    const [phone, setPhone] = useState("");
    const [planEnd, setPlanEnd] = useState("");

    // New Fields
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState<'male' | 'female' | "">("");
    const [height, setHeight] = useState(""); // cm
    const [weight, setWeight] = useState(""); // kg

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || "");
            setEmail(initialData.email || "");
            setCpf(initialData.cpf || "");
            setPhone(initialData.phone || "");
            setPlanEnd(initialData.planEnd ? format(new Date(initialData.planEnd), 'yyyy-MM-dd') : "");

            // Populate new fields
            setBirthDate(initialData.birthDate ? format(new Date(initialData.birthDate), 'yyyy-MM-dd') : "");
            setGender(initialData.gender || "");
            setHeight(initialData.height ? initialData.height.toString() : "");
            setWeight(initialData.weight ? (initialData.weight / 1000).toString() : ""); // Convert value if stored in grams? Actually schema says grams.
            // Wait, if initialData comes from DB, weight is in grams. 
            // But if it comes from the table view, it might be RAW from DB.
            // Let's assume raw from DB (grams) -> convert to kg for display.

        } else if (isOpen && !initialData) {
            // Reset
            setName("");
            setEmail("");
            setCpf("");
            setPhone("");
            setPlanEnd("");
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite-dark/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-pure-white w-full max-w-2xl rounded-3xl soft-shadow overflow-hidden my-auto">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-graphite-dark">{initialData ? 'Editar Aluno' : 'Novo Aluno'}</h3>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                        <X size={24} weight="bold" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">Informações Pessoais</h4>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                            <input
                                autoFocus
                                type="text"
                                required
                                className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-300"
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
                                    className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-300"
                                    value={cpf}
                                    onChange={handleCPFChange}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Data de Nascimento</label>
                                <input
                                    type="date"
                                    className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 text-slate-500"
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gênero</label>
                                <select
                                    className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 appearance-none cursor-pointer"
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
                                    className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-300"
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
                                className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-300"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Physical Info Section */}
                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">Dados Físicos Iniciais</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Altura (cm)</label>
                                <input
                                    type="number"
                                    placeholder="175"
                                    className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-300"
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
                                    className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-300"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Plan Info Section */}
                    <div className="space-y-4 pt-2">
                        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-widest border-b border-emerald-100 pb-2">Plano</h4>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vencimento do Plano</label>
                            <input
                                type="date"
                                className="w-full p-4 bg-slate-50 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-100 text-slate-500"
                                value={planEnd}
                                onChange={e => setPlanEnd(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-4 bg-performance-green text-graphite-dark font-bold rounded-xl shadow-lg shadow-emerald-200 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
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

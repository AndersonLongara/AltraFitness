'use client';

import { useState } from "react";
import { X, User, Phone, Spinner } from "@phosphor-icons/react";
import { updateStudentProfile } from "@/app/actions/profile";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: {
        name: string;
        phone: string;
    };
}

export default function EditProfileModal({ isOpen, onClose, initialData }: EditProfileModalProps) {
    const [name, setName] = useState(initialData.name);
    const [phone, setPhone] = useState(initialData.phone);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateStudentProfile({ name, phone });
            onClose();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Erro ao atualizar perfil due to an unexpected error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-surface-grey border border-white/10 rounded-[32px] w-full max-w-sm shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X size={20} weight="bold" />
                </button>

                <h3 className="text-xl font-black text-white mb-1">Editar Perfil</h3>
                <p className="text-zinc-500 text-sm mb-6">Atualize suas informações pessoais.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Nome Completo</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                <User weight="duotone" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-deep-black rounded-xl border border-white/10 focus:border-acid-lime focus:ring-2 focus:ring-acid-lime/20 outline-none transition-all font-bold text-white placeholder:text-zinc-700"
                                placeholder="Seu nome"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">Telefone / WhatsApp</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                                <Phone weight="duotone" />
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-deep-black rounded-xl border border-white/10 focus:border-acid-lime focus:ring-2 focus:ring-acid-lime/20 outline-none transition-all font-bold text-white placeholder:text-zinc-700"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-acid-lime hover:bg-acid-lime/90 text-deep-black font-black rounded-xl shadow-[0_0_20px_rgba(189,255,0,0.3)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all mt-6"
                    >
                        {loading ? <Spinner className="animate-spin" size={20} /> : "Salvar Alterações"}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 text-zinc-500 font-bold hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                </form>
            </div>
        </div>
    );
}

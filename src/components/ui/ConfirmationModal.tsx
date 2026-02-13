'use client';

import * as Dialog from "@radix-ui/react-dialog";
import { Warning, Info, CheckCircle, Trash } from "@phosphor-icons/react";
import { ReactNode } from "react";

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string | ReactNode;
    confirmText?: string;
    cancelText?: string | null;
    variant?: ConfirmationVariant;
    isLoading?: boolean;
}

const VARIANT_STYLES = {
    danger: {
        icon: Trash,
        iconColor: "text-rose-500",
        iconBg: "bg-rose-50",
        buttonBg: "bg-rose-500 hover:bg-rose-600",
        buttonText: "text-white"
    },
    warning: {
        icon: Warning,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-50",
        buttonBg: "bg-amber-500 hover:bg-amber-600",
        buttonText: "text-white"
    },
    info: {
        icon: Info,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-50",
        buttonBg: "bg-blue-500 hover:bg-blue-600",
        buttonText: "text-white"
    },
    success: {
        icon: CheckCircle,
        iconColor: "text-emerald-500",
        iconBg: "bg-emerald-50",
        buttonBg: "bg-emerald-500 hover:bg-emerald-600",
        buttonText: "text-white"
    }
};

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = 'info',
    isLoading = false
}: ConfirmationModalProps) {
    const styles = VARIANT_STYLES[variant];
    const Icon = styles.icon;

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[24px] p-6 shadow-2xl z-50 animate-scale-in outline-none border border-slate-100">
                    <Dialog.Title className="sr-only">{title}</Dialog.Title>

                    <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-4`}>
                            <Icon size={24} weight="bold" className={styles.iconColor} />
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                        <div className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
                            {description}
                        </div>

                        <div className="flex gap-3 w-full">
                            {cancelText && (
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onConfirm();
                                    // Don't close automatically if loading might be handled by parent
                                    // But typically onConfirm is a void function here.
                                    // If we want to handle async, we might need to await it. 
                                    // For now, let the parent verify.
                                }}
                                disabled={isLoading}
                                className={`flex-1 py-3 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles.buttonBg} ${styles.buttonText} flex items-center justify-center gap-2`}
                            >
                                {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

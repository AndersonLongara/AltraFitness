'use client';

import { useState } from "react";
import { ClipboardText, CaretRight, X } from "@phosphor-icons/react";
import FormRenderer from "@/components/forms/FormRenderer";
import * as Dialog from "@radix-ui/react-dialog";

interface PendingFormsListProps {
    pendingForms: any[];
}

export default function PendingFormsList({ pendingForms }: PendingFormsListProps) {
    const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);

    if (pendingForms.length === 0) return null;

    return (
        <>
            <div className="bg-white p-6 rounded-3xl soft-shadow border-2 border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <ClipboardText size={24} weight="fill" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Check-ins Pendentes</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                            {pendingForms.length} {pendingForms.length === 1 ? 'formulário' : 'formulários'} para responder
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {pendingForms.map((assignment) => (
                        <button
                            key={assignment.id}
                            onClick={() => setSelectedAssignment(assignment)}
                            className="w-full text-left bg-emerald-50 hover:bg-emerald-100 p-4 rounded-2xl transition-all flex items-center justify-between group"
                        >
                            <div>
                                <p className="font-bold text-slate-700">{assignment.form.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-1">{assignment.form.description || 'Toque para responder'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
                                <CaretRight weight="bold" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <Dialog.Root open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300 md:inset-10 md:rounded-3xl shadow-2xl overflow-hidden focus:outline-none">

                        <div className="flex items-center justify-between p-4 border-b border-slate-100 md:hidden">
                            <span className="font-bold text-slate-700">Responder Formulário</span>
                            <button
                                onClick={() => setSelectedAssignment(null)}
                                className="p-2 bg-slate-100 rounded-full text-slate-500"
                            >
                                <X weight="bold" />
                            </button>
                        </div>

                        <div className="relative flex-1 h-full">
                            {selectedAssignment && (
                                <div className="absolute inset-0">
                                    <FormRenderer
                                        assignmentId={selectedAssignment.id}
                                        form={selectedAssignment.form}
                                        onClose={() => setSelectedAssignment(null)}
                                    />
                                    <button
                                        onClick={() => setSelectedAssignment(null)}
                                        className="absolute top-6 right-6 hidden md:flex w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full items-center justify-center text-slate-500 transition-colors z-20"
                                    >
                                        <X weight="bold" size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}

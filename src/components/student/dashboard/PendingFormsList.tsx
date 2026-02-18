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
            <div className="bg-surface-grey p-6 rounded-3xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-acid-lime/10 border border-acid-lime/20 flex items-center justify-center text-acid-lime">
                        <ClipboardText size={24} weight="fill" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Check-ins Pendentes</h3>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wide">
                            {pendingForms.length} {pendingForms.length === 1 ? 'formulário' : 'formulários'} para responder
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    {pendingForms.map((assignment) => (
                        <button
                            key={assignment.id}
                            onClick={() => setSelectedAssignment(assignment)}
                            className="w-full text-left bg-deep-black/60 hover:bg-white/5 border border-white/5 hover:border-acid-lime/30 p-4 rounded-2xl transition-all flex items-center justify-between group"
                        >
                            <div>
                                <p className="font-bold text-white">{assignment.form.title}</p>
                                <p className="text-xs text-zinc-500 line-clamp-1">{assignment.form.description || 'Toque para responder'}</p>
                            </div>
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:bg-acid-lime group-hover:text-deep-black group-hover:border-acid-lime transition-all">
                                <CaretRight weight="bold" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <Dialog.Root open={!!selectedAssignment} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
                    <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-deep-black text-white animate-in slide-in-from-bottom duration-300 md:inset-10 md:rounded-3xl border border-white/10 shadow-2xl overflow-hidden focus:outline-none">

                        <div className="flex items-center justify-between p-4 border-b border-white/10 md:hidden">
                            <span className="font-bold text-white">Responder Formulário</span>
                            <button
                                onClick={() => setSelectedAssignment(null)}
                                className="p-2 bg-surface-grey rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
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
                                        className="absolute top-6 right-6 hidden md:flex w-10 h-10 bg-surface-grey hover:bg-white/10 rounded-full items-center justify-center text-zinc-400 hover:text-white transition-colors z-20 border border-white/5"
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

"use client";

import { ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BackButtonProps {
    href?: string;
}

export default function BackButton({ href }: BackButtonProps) {
    const router = useRouter();

    if (href) {
        return (
            <Link href={href} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors inline-block">
                <ArrowLeft size={24} weight="bold" />
            </Link>
        );
    }

    return (
        <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors inline-block"
        >
            <ArrowLeft size={24} weight="bold" />
        </button>
    );
}

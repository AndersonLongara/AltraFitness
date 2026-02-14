'use client';

import { useState } from "react";
import ProfileHeader from "@/components/student/profile/ProfileHeader";
import StatsOverview from "@/components/student/profile/StatsOverview";
import SettingsList from "@/components/student/profile/SettingsList";
import EditProfileModal from "@/components/student/profile/EditProfileModal";
import { ArrowLeft, PencilSimple } from "@phosphor-icons/react";
import Link from "next/link";

interface ProfilePageContentProps {
    student: any; // Type accurately if possible
    stats: any;
}

export default function ProfilePageContent({ student, stats }: ProfilePageContentProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <main className="p-6 pb-24 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">
            {/* Header / Nav */}
            <header className="flex items-center justify-between mb-8">
                <Link href="/student" className="w-10 h-10 bg-surface-grey border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeft size={20} weight="bold" />
                </Link>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Meu Perfil</div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-10 h-10 bg-acid-lime/10 border border-acid-lime/20 rounded-xl flex items-center justify-center text-acid-lime hover:bg-acid-lime/20 transition-all"
                >
                    <PencilSimple size={20} weight="bold" />
                </button>
            </header>

            <div className="space-y-6 max-w-md mx-auto">
                <ProfileHeader
                    name={student.name}
                    photoUrl={student.photoUrl}
                    level={student.level || 1}
                    currentXp={student.currentXp || 0}
                    streak={student.currentStreak || 0}
                />

                <StatsOverview stats={stats} />

                <SettingsList />
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={{ name: student.name, phone: student.phone || '' }}
            />
        </main>
    );
}

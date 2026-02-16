"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Trainer = { id: string; name: string; email: string };

export default function StudentsFilter({
  trainers,
  currentTrainerId,
}: {
  trainers: Trainer[];
  currentTrainerId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setTrainer = (trainerId: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (trainerId) next.set("trainerId", trainerId);
    else next.delete("trainerId");
    router.push(`/superadmin/students?${next.toString()}`);
  };

  return (
    <select
      value={currentTrainerId ?? ""}
      onChange={(e) => setTrainer(e.target.value)}
      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E2A36] text-slate-700 dark:text-slate-200 font-medium text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
    >
      <option value="">Todos os clientes</option>
      {trainers.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}

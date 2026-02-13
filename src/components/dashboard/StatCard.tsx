import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "@phosphor-icons/react/dist/ssr";

interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    trend?: string;
    trendDirection?: 'up' | 'down' | 'neutral';
}

export default function StatCard({ title, value, icon, trend, trendDirection = 'neutral' }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-[32px] soft-shadow flex flex-col justify-between h-full group hover:shadow-lg transition-all duration-300 border border-slate-50">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
                    {icon}
                </div>

                {trend && (
                    <div className={`
                        px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1
                        ${trendDirection === 'up' ? 'bg-emerald-50 text-emerald-600' : ''}
                        ${trendDirection === 'down' ? 'bg-rose-50 text-rose-600' : ''}
                        ${trendDirection === 'neutral' ? 'bg-slate-50 text-slate-500' : ''}
                    `}>
                        {trendDirection === 'up' && <ArrowUpRight weight="bold" />}
                        {trendDirection === 'down' && <ArrowDownRight weight="bold" />}
                        {trendDirection === 'neutral' && <Minus weight="bold" />}
                        {trend}
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-3xl font-extrabold text-graphite-dark tracking-tight mb-1">{value}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            </div>
        </div>
    );
}

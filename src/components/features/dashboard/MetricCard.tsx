import { ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react/dist/ssr";
import type { ComponentType } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp?: boolean;
    icon: ComponentType<any>;
    iconColor: string; // e.g. "text-orange-500"
    iconBg: string; // e.g. "bg-orange-100"
}

export default function MetricCard({ title, value, trend, trendUp, icon: Icon, iconColor, iconBg }: MetricCardProps) {
    return (
        <Card className="bg-pure-white p-4 md:p-6 rounded-3xl soft-shadow flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 h-full border-0 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-start gap-2 p-0">
                <div className={`p-2 rounded-2xl ${iconBg} ${iconColor}`}>
                    <Icon size={24} weight="duotone" />
                </div>
                <div className={`px-2 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trendUp ? <ArrowUpRight weight="bold" /> : <ArrowDownRight weight="bold" />}
                    {trend}
                </div>
            </CardHeader>
            <CardContent className="space-y-2 mt-4 px-0 pb-0">
                <h3 className="text-3xl md:text-4xl font-extrabold text-graphite-dark tracking-tight">{value}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            </CardContent>
        </Card>
    );
}

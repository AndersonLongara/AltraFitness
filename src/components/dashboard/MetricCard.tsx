import { Icon, ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react/dist/ssr";

interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp?: boolean;
    icon: Icon;
    iconColor: string; // e.g. "text-orange-500"
    iconBg: string; // e.g. "bg-orange-100"
}

export default function MetricCard({ title, value, trend, trendUp, icon: Icon, iconColor, iconBg }: MetricCardProps) {
    return (
        <div className="bg-pure-white p-4 md:p-6 rounded-3xl soft-shadow flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 h-full">
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-2xl ${iconBg} ${iconColor}`}>
                    <Icon size={24} weight="duotone" />
                </div>
                <div className={`px-2 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trendUp ? <ArrowUpRight weight="bold" /> : <ArrowDownRight weight="bold" />}
                    {trend}
                </div>
            </div>

            <div className="space-y-2 mt-4">
                <h3 className="text-3xl md:text-4xl font-extrabold text-graphite-dark tracking-tight">{value}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
            </div>
        </div>
    );
}

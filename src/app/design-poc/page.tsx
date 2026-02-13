import Link from "next/link";
import { ArrowRight, Activity, Users, DollarSign, TrendingUp } from "lucide-react";

export default function DesignPoc() {
    return (
        <main className="min-h-screen p-8 md:p-12 space-y-16">

            {/* Header */}
            <header className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-widest">
                    Design System v1.0
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-graphite-dark md:text-5xl">
                    AltraHub Design DNA
                    <span className="text-performance-green">.</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl">
                    A validation of the 8pt Grid, Plus Jakarta Sans typography, and the Soft UI aesthetic.
                </p>
            </header>

            <hr className="border-slate-200" />

            {/* Typography Section */}
            <section className="space-y-8">
                <h2 className="text-xl font-bold text-graphite-dark">1. Typography & Hierarchy</h2>
                <div className="grid gap-8 md:grid-cols-2 p-8 bg-pure-white rounded-3xl soft-shadow">
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Display H1</span>
                            <h1 className="text-4xl font-extrabold tracking-tight">Focus on Performance</h1>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Card Title H2</span>
                            <h2 className="text-xl font-bold">Weekly Progress</h2>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Body Text</span>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                The Bento Grid architecture ensures that data is consumed efficiently.
                                Every margin is a multiple of 8px, creating a mathematical harmony.
                            </p>
                        </div>
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Caption</span>
                            <p className="text-xs text-slate-400">Updated 2 minutes ago</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center">
                        <p className="text-center italic text-slate-400">Plus Jakarta Sans</p>
                    </div>
                </div>
            </section>

            {/* Colors Section */}
            <section className="space-y-8">
                <h2 className="text-xl font-bold text-graphite-dark">2. Color Palette</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <ColorCard name="Performance Green" hex="#2ECC71" bg="bg-performance-green" text="text-white" />
                    <ColorCard name="Dark Navy" hex="#0D1117" bg="bg-dark-navy" text="text-white" />
                    <ColorCard name="Graphite Dark" hex="#2C3E50" bg="bg-graphite-dark" text="text-white" />
                    <ColorCard name="Ice White" hex="#F8F9FA" bg="bg-ice-white" text="text-slate-900" border />
                    <ColorCard name="Pure White" hex="#FFFFFF" bg="bg-pure-white" text="text-slate-900" border />
                </div>
            </section>

            {/* Bento Grid Section */}
            <section className="space-y-8">
                <h2 className="text-xl font-bold text-graphite-dark">3. Bento Grid Components</h2>

                {/* The Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Main Card */}
                    <div className="md:col-span-2 bg-pure-white p-8 rounded-4xl soft-shadow space-y-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                        <Users size={20} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Students</span>
                                </div>
                                <div className="text-4xl font-extrabold text-graphite-dark">128</div>
                            </div>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg flex items-center gap-1">
                                <TrendingUp size={14} /> +12%
                            </div>
                        </div>

                        {/* Visual element representing a chart */}
                        <div className="h-32 w-full bg-slate-50 rounded-2xl flex items-end justify-between p-4 px-8 gap-2">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="w-full bg-indigo-500 rounded-t-lg opacity-80" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                    </div>

                    {/* Side Card 1 - Action */}
                    <div className="bg-dark-navy p-8 rounded-4xl soft-shadow text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 blur-3xl opacity-20 -mr-10 -mt-10"></div>

                        <div className="space-y-2 relative z-10">
                            <div className="p-2 bg-white/10 w-fit rounded-xl backdrop-blur-sm">
                                <Activity size={20} />
                            </div>
                            <h3 className="text-2xl font-bold">AI Manager</h3>
                            <p className="text-slate-400 text-sm">3 Students at risk of churn.</p>
                        </div>

                        <button className="mt-6 w-full py-3 bg-performance-green text-white font-bold rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                            View Insights <ArrowRight size={16} />
                        </button>
                    </div>

                    {/* Small Card 1 */}
                    <div className="bg-pure-white p-6 rounded-3xl soft-shadow flex flex-col items-center justify-center gap-2 text-center hover:scale-[1.02] transition-transform cursor-pointer border border-transparent hover:border-indigo-100">
                        <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-2">
                            <DollarSign size={24} />
                        </div>
                        <div className="text-2xl font-bold text-graphite-dark">R$ 14.2k</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Revenue (Feb)</div>
                    </div>

                    {/* Small Card 2 */}
                    <div className="bg-pure-white p-6 rounded-3xl soft-shadow flex flex-col items-center justify-center gap-2 text-center hover:scale-[1.02] transition-transform cursor-pointer border border-transparent hover:border-indigo-100">
                        <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-2">
                            <Activity size={24} />
                        </div>
                        <div className="text-xl font-bold text-graphite-dark">94%</div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Retention Rate</div>
                    </div>

                    {/* Wide Card */}
                    <div className="bg-pure-white p-6 rounded-3xl soft-shadow flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex-shrink-0"></div>
                            <div>
                                <div className="font-bold text-graphite-dark">Pedro Souza</div>
                                <div className="text-xs text-slate-500">Last workout: 2h ago</div>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors">
                            View
                        </button>
                    </div>

                </div>
            </section>

            <footer className="text-center text-slate-400 text-sm py-12">
                <p>AltraHub Design System &copy; 2024</p>
            </footer>
        </main>
    );
}

function ColorCard({ name, hex, bg, text, border }: { name: string, hex: string, bg: string, text: string, border?: boolean }) {
    return (
        <div className={`${bg} ${text} p-6 rounded-3xl soft-shadow flex flex-col justify-between h-32 ${border ? 'border border-slate-100' : ''}`}>
            <span className="font-bold">{name}</span>
            <span className="text-xs opacity-80 uppercase tracking-widest">{hex}</span>
        </div>
    )
}

"use client";

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    xpRequired: number;
    color: string;
}

interface EarnedBadge {
    badge: Badge;
    earnedAt: Date;
}

interface BadgesGridProps {
    allBadges: Badge[];
    earnedBadges: EarnedBadge[];
    currentXP: number;
}

export default function BadgesGrid({ allBadges, earnedBadges, currentXP }: BadgesGridProps) {
    const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badge.id));

    const getBadgeColor = (color: string) => {
        const colors: Record<string, string> = {
            amber: "border-amber-400 bg-amber-50",
            indigo: "border-emerald-400 bg-emerald-50",
            rose: "border-rose-400 bg-rose-50",
            emerald: "border-emerald-400 bg-emerald-50",
        };
        return colors[color] || "border-slate-300 bg-slate-50";
    };

    return (
        <div className="bg-pure-white p-6 rounded-3xl soft-shadow">
            <h3 className="text-xl font-bold text-graphite-dark mb-4">Conquistas</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allBadges.map(badge => {
                    const isEarned = earnedBadgeIds.has(badge.id);
                    const isLocked = currentXP < badge.xpRequired;

                    return (
                        <div
                            key={badge.id}
                            className={`
                                relative p-4 rounded-2xl border-2 transition-all
                                ${isEarned ? getBadgeColor(badge.color) + " shadow-md" : "border-slate-200 bg-slate-50"}
                                ${isLocked && !isEarned ? "opacity-50 grayscale" : ""}
                            `}
                            title={badge.description}
                        >
                            <div className="text-center">
                                <div className={`text-5xl mb-2 ${isEarned ? "animate-bounce" : ""}`}>
                                    {badge.icon}
                                </div>
                                <h4 className="text-xs font-bold text-graphite-dark line-clamp-2 mb-2">
                                    {badge.name}
                                </h4>
                                <p className="text-[10px] text-slate-500">
                                    {isEarned ? "Desbloqueado!" : `${badge.xpRequired} XP`}
                                </p>
                            </div>

                            {isEarned && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                                    ✓
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {earnedBadges.length === 0 && (
                <p className="text-center text-slate-400 text-sm mt-4">
                    Complete treinos para desbloquear badges!
                </p>
            )}
        </div>
    );
}

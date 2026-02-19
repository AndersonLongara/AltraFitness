function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />;
}

export default function NutritionLoading() {
    return (
        <main className="p-6 pb-24 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>

            {/* Calendar strip */}
            <Skeleton className="h-20 w-full rounded-2xl mb-6" />

            {/* Summary bar */}
            <Skeleton className="h-24 w-full rounded-3xl mb-6" />

            {/* Meal cards */}
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-3xl bg-white/5 p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}

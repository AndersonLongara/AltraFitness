function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />;
}

export default function WorkoutsLoading() {
    return (
        <main className="p-6 pb-24 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>

            {/* Workout cards */}
            <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse flex items-center gap-4 p-5 rounded-3xl bg-white/5"
                    >
                        <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-3/5" />
                            <Skeleton className="h-3 w-2/5" />
                        </div>
                        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    </div>
                ))}
            </div>
        </main>
    );
}

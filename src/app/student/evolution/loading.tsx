function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />;
}

export default function EvolutionLoading() {
    return (
        <main className="p-6 pb-24 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>

            {/* 2x2 grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Consistency calendar */}
                <Skeleton className="h-64 rounded-3xl" />
                {/* Charts */}
                <Skeleton className="h-64 rounded-3xl" />
                {/* Photos */}
                <Skeleton className="h-64 rounded-3xl" />
                {/* Assessment history */}
                <Skeleton className="h-64 rounded-3xl" />
            </div>
        </main>
    );
}

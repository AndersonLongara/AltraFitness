function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-2xl bg-white/5 ${className}`}
        />
    );
}

export default function StudentDashboardLoading() {
    return (
        <div className="p-6 pb-28 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
            </div>

            {/* Score Ring */}
            <div className="flex justify-center mb-8">
                <Skeleton className="w-36 h-36 rounded-full" />
            </div>

            {/* Hero card — Weekly challenge */}
            <Skeleton className="h-40 w-full rounded-[32px] mb-8" />

            {/* Workout card */}
            <Skeleton className="h-28 w-full rounded-3xl mb-4" />

            {/* Mood tracker */}
            <Skeleton className="h-20 w-full rounded-3xl mb-8" />

            {/* Section title */}
            <Skeleton className="h-5 w-44 mb-4" />

            {/* Activity grid */}
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-[90px] rounded-3xl" />
                <Skeleton className="h-[90px] rounded-3xl" />
            </div>
        </div>
    );
}

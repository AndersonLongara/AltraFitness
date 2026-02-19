function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />;
}

export default function ProfileLoading() {
    return (
        <main className="p-6 pb-28 md:pb-10 md:px-10 lg:px-16 max-w-6xl mx-auto font-primary">
            {/* Profile hero */}
            <div className="flex flex-col items-center gap-4 mb-8 pt-4">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-2 text-center">
                    <Skeleton className="h-6 w-44 mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
                <Skeleton className="h-20 rounded-3xl" />
                <Skeleton className="h-20 rounded-3xl" />
                <Skeleton className="h-20 rounded-3xl" />
            </div>

            {/* Info sections */}
            <div className="space-y-4">
                <Skeleton className="h-16 rounded-3xl" />
                <Skeleton className="h-16 rounded-3xl" />
                <Skeleton className="h-16 rounded-3xl" />
                <Skeleton className="h-16 rounded-3xl" />
            </div>
        </main>
    );
}

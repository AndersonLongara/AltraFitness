import { clerkStyleOverrides } from "@/lib/clerk-theme";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Ambient glow — top left */}
            <div className="absolute top-[-30%] left-[-15%] w-[700px] h-[700px] bg-acid-lime/8 rounded-full blur-[180px] pointer-events-none" />
            {/* Ambient glow — bottom right */}
            <div className="absolute bottom-[-25%] right-[-10%] w-[500px] h-[500px] bg-acid-lime/5 rounded-full blur-[150px] pointer-events-none" />

            {/* Noise texture */}
            <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                }}
            />

            {/* Page content */}
            <div className="relative z-10 w-full">{children}</div>

            {/* Clerk style overrides */}
            <style dangerouslySetInnerHTML={{ __html: clerkStyleOverrides }} />
        </div>
    );
}

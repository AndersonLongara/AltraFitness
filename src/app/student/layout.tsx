import StudentBottomNav from "@/components/student/layout/StudentBottomNav";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-deep-black text-white pb-24 md:pb-0 relative overflow-hidden font-sans selection:bg-acid-lime selection:text-black">
            {/* Top Green Gradient Glow */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-green-900/40 via-deep-black/0 to-deep-black/0 blur-3xl pointer-events-none" />

            {/* Ambient Radial Glows (Reference style) */}
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[50%] bg-acid-lime/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>

            <StudentBottomNav />
        </div>
    );
}

import { clerkStyleOverrides } from "@/lib/clerk-theme";
import { AuthShowcase } from "@/components/auth/AuthShowcase";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#131B23] grid lg:grid-cols-2">
            {/* Left Column: Auth Form */}
            <div className="flex flex-col justify-center px-6 py-12 lg:px-24 relative z-10">
                
                {/* Mobile-only ambient glow */}
                <div className="lg:hidden absolute top-[-20%] left-[-20%] w-[300px] h-[300px] bg-[#2ECC71]/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="w-full max-w-[440px] mx-auto">
                   {children}
                </div>
            </div>

            {/* Right Column: Visual Showcase (The Bento Grid) */}
            <div className="hidden lg:flex relative bg-[#1E2A36] items-center justify-center p-12 overflow-hidden">
                 {/* Background Pattern */}
                 <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                 
                 {/* Ambient Glows */}
                 <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-[#2ECC71]/20 rounded-full blur-[120px] pointer-events-none" />
                 
                 {/* Content Wrapper */}
                 <div className="relative z-10 w-full max-w-[600px]">
                    <AuthShowcase />
                 </div>
            </div>

            {/* Clerk style overrides */}
            <style dangerouslySetInnerHTML={{ __html: clerkStyleOverrides }} />
        </div>
    );
}

// Ensure icon imports work (assuming lucide-react is installed)

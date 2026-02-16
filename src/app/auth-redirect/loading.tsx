export default function AuthRedirectLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-[#2ECC71] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-semibold text-slate-600">Redirecionando...</p>
            </div>
        </div>
    );
}

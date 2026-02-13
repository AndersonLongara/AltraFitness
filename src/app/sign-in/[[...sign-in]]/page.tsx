import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen bg-ice-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-graphite-dark rounded-2xl text-performance-green text-3xl font-extrabold mb-4">
                        A.
                    </div>
                    <h1 className="text-2xl font-bold text-graphite-dark">Bem-vindo ao AltraFitness</h1>
                    <p className="text-slate-500 mt-2">Faça login para gerenciar seu estúdio.</p>
                </div>
                <div className="flex justify-center">
                    <SignIn
                        appearance={{
                            elements: {
                                card: "bg-pure-white shadow-xl rounded-3xl border border-slate-100",
                                headerTitle: "text-graphite-dark",
                                headerSubtitle: "text-slate-500",
                                socialButtonsBlockButton: "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600",
                                formButtonPrimary: "bg-performance-green hover:bg-emerald-500 text-graphite-dark font-bold",
                                footerActionLink: "text-indigo-600 hover:text-indigo-700 font-bold"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

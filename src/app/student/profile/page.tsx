import { getStudentProfile } from "@/app/actions/profile";
import ProfilePageContent from "@/components/student/profile/ProfilePageContent";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        return redirect("/sign-in");
    }

    try {
        const studentProfile = await getStudentProfile();

        return (
            <ProfilePageContent
                student={studentProfile}
                stats={studentProfile.stats}
            />
        );
    } catch (error) {
        console.error("Failed to load profile", error);
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center bg-deep-black">
                <div>
                    <h2 className="text-xl font-bold text-white">Erro ao carregar perfil</h2>
                    <p className="text-zinc-500">Por favor, recarregue a página.</p>
                </div>
            </div>
        );
    }
}

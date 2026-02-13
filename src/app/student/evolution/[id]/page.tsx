import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Scales } from "@phosphor-icons/react/dist/ssr";
import { getAssessment } from "@/app/actions/assessments";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return redirect("/sign-in");

    const { id } = await params;
    const assessment = await getAssessment(id);

    if (!assessment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Avaliação não encontrada.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-6 pb-24 font-primary">
            {/* Header */}
            <header className="flex items-center gap-4 mb-8">
                <Link href="/student/evolution" className="w-10 h-10 bg-surface-grey border border-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                    <ArrowLeft size={20} weight="bold" />
                </Link>
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight">Detalhes da Avaliação</h1>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                        {format(assessment.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
            </header>

            <div className="space-y-6">
                {/* Main Stats Card */}
                <div className="bg-surface-grey border border-white/5 p-6 rounded-[32px] relative overflow-hidden">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-6 flex items-center gap-2 tracking-widest">
                        <User weight="duotone" size={16} /> Composição Corporal
                    </h3>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div className="p-5 bg-deep-black border border-white/5 rounded-2xl">
                            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Peso Total</span>
                            <div className="text-3xl font-black text-white mt-1">{assessment.weight}<span className="text-xs text-zinc-500 ml-1">kg</span></div>
                        </div>
                        <div className="p-5 bg-deep-black border border-white/5 rounded-2xl">
                            <span className="text-[10px] text-amber-500 font-black uppercase tracking-widest">% Gordura</span>
                            <div className="text-3xl font-black text-amber-400 mt-1">{assessment.bodyFat ? `${assessment.bodyFat}%` : '-'}</div>
                        </div>
                        <div className="p-5 bg-deep-black border border-white/5 rounded-2xl">
                            <span className="text-[10px] text-acid-lime font-black uppercase tracking-widest">Massa Magra</span>
                            <div className="text-3xl font-black text-acid-lime mt-1">{assessment.leanMass ? `${assessment.leanMass}kg` : '-'}</div>
                        </div>
                        <div className="p-5 bg-deep-black border border-white/5 rounded-2xl">
                            <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">Massa Gorda</span>
                            <div className="text-3xl font-black text-red-400 mt-1">{assessment.fatMass ? `${assessment.fatMass}kg` : '-'}</div>
                        </div>
                    </div>

                    {assessment.observations && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Observações</h4>
                            <p className="text-zinc-400 text-sm italic leading-relaxed">"{assessment.observations}"</p>
                        </div>
                    )}

                    {/* Ambient Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 blur-[50px] rounded-full" />
                </div>

                {/* Circumferences */}
                {(assessment.neck || assessment.shoulder || assessment.chestCircumference || assessment.waist || assessment.abdomen || assessment.hips) && (
                    <div className="bg-surface-grey border border-white/5 p-6 rounded-[32px] relative overflow-hidden">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-6 flex items-center gap-2 tracking-widest">
                            <Scales weight="duotone" size={16} /> Perímetros (cm)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-12 relative z-10">
                            {[
                                { label: 'Pescoço', value: assessment.neck },
                                { label: 'Ombros', value: assessment.shoulder },
                                { label: 'Tórax', value: assessment.chestCircumference },
                                { label: 'Cintura', value: assessment.waist },
                                { label: 'Abdômen', value: assessment.abdomen },
                                { label: 'Quadril', value: assessment.hips },
                                { label: 'Braço Dir.', value: assessment.armRight },
                                { label: 'Braço Esq.', value: assessment.armLeft },
                                { label: 'Coxa Dir.', value: assessment.thighRight },
                                { label: 'Coxa Esq.', value: assessment.thighLeft },
                                { label: 'Panturrilha Dir.', value: assessment.calfRight },
                                { label: 'Panturrilha Esq.', value: assessment.calfLeft }
                            ].map((item, i) => item.value && (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 md:[&:nth-last-child(2)]:border-0">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
                                    <span className="text-sm font-black text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Ambient Glow */}
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 blur-[50px] rounded-full" />
                    </div>
                )}

                {/* Photos */}
                {assessment.photos && assessment.photos.length > 0 && (
                    <div className="bg-surface-grey border border-white/5 p-6 rounded-[32px] mb-24">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-6 flex items-center gap-2 tracking-widest">
                            <Calendar weight="duotone" size={16} /> Registros Fotográficos
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {assessment.photos.map(photo => (
                                <div key={photo.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-deep-black border border-white/10 group">
                                    <Image src={photo.photoUrl} alt={photo.type} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-deep-black/60 backdrop-blur-md text-white text-[9px] p-2 text-center font-black uppercase tracking-widest border-t border-white/5">
                                        {photo.type}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

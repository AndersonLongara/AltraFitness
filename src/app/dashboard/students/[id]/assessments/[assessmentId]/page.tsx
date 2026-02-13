
import { db } from "@/db";
import { assessments, students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import BackButton from "@/components/ui/BackButton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ShareNetwork, TrendUp, TrendDown, Minus, Lightning } from "@phosphor-icons/react/dist/ssr";
import CompositionChart from "@/components/assessments/CompositionChart";
import { getStudentAssessments, generateComparisonReport } from "@/app/actions/assessments";

export default async function AssessmentDetailsPage(props: { params: Promise<{ id: string, assessmentId: string }> }) {
    const params = await props.params;
    const { id, assessmentId } = params;

    // Fetch Data
    const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.id, assessmentId),
        with: { photos: true }
    });

    const student = await db.query.students.findFirst({
        where: eq(students.id, id),
    });

    if (!assessment || !student) return notFound();

    // Fetch History for Chart & Previous Comparison
    const history = await getStudentAssessments(id);
    const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const currentIndex = sortedHistory.findIndex(a => a.id === assessmentId);
    const previousAssessment = sortedHistory[currentIndex + 1];

    // AI & Deltas
    let aiSummary = "Primeira avaliação realizada! Continue focado para ver sua evolução.";
    let deltas = { weight: 0, bodyFat: 0, leanMass: 0, fatMass: 0 };

    if (previousAssessment) {
        const report = await generateComparisonReport(assessmentId, previousAssessment.id);
        if (report) {
            aiSummary = report.aiSummary;
            deltas = report.deltas;
        }
    }

    // Format Values
    const fmt = (val: number | null, div = 1) => val ? (val / div) : 0;
    const weight = fmt(assessment.weight, 1000);
    const bodyFat = fmt(assessment.bodyFat, 100);
    const leanMass = fmt(assessment.leanMass, 1000);
    const fatMass = fmt(assessment.fatMass, 1000);

    // Chart Data (format for Recharts)
    const chartData = sortedHistory.map(h => ({
        date: h.date,
        leanMass: h.leanMass, // already formatted in getStudentAssessments? Yes
        fatMass: h.fatMass,   // Yes
        weight: h.weight,     // Yes
    }));

    return (
        <div className="space-y-8 animate-fade-in pb-24">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <BackButton />
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Relatório de Avaliação</h1>
                        <p className="text-slate-500 font-medium">
                            {format(assessment.date, "dd 'de' MMMM, yyyy", { locale: ptBR })} • {student.name}
                        </p>
                    </div>
                </div>
                <Link
                    href={`/dashboard/students/${id}/assessments/${assessmentId}/share`}
                    target="_blank"
                    className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                    <ShareNetwork size={20} weight="bold" />
                    Gerar Card
                </Link>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-[24px] text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Lightning size={120} weight="fill" />
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                        <Lightning size={24} weight="fill" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Análise de Evolução (IA)</h3>
                        <p className="text-white/90 leading-relaxed max-w-2xl">
                            "{aiSummary}"
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    label="Peso Total"
                    value={`${weight.toFixed(1)}kg`}
                    delta={deltas.weight}
                    badIsIncrease={true} // Usually gaining weight is bad unless bulking, but context matters. Let's assume neutral or user context. 
                    // Actually, let's keep it neutral color for weight usually.
                    neutral={true}
                />
                <SummaryCard
                    label="% Gordura"
                    value={`${bodyFat.toFixed(1)}%`}
                    delta={deltas.bodyFat}
                    badIsIncrease={true}
                />
                <SummaryCard
                    label="Massa Magra"
                    value={`${leanMass.toFixed(1)}kg`}
                    delta={deltas.leanMass}
                    badIsIncrease={false}
                />
                <SummaryCard
                    label="Massa Gorda"
                    value={`${fatMass.toFixed(1)}kg`}
                    delta={deltas.fatMass}
                    badIsIncrease={true}
                />
            </div>

            {/* Chart */}
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg mb-6">Histórico de Composição</h3>
                <CompositionChart data={chartData} />
            </div>

            {/* Photos */}
            {assessment.photos && assessment.photos.length > 0 && (
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-lg mb-6">Registro Visual</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {assessment.photos.map(photo => (
                            <div key={photo.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
                                <img src={photo.photoUrl} alt={photo.type} className="object-cover w-full h-full" />
                                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-bold uppercase">
                                    {photo.type}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Measurements Detail Table */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg mb-6">Medidas Detalhadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Skinfolds */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 border-b border-slate-100 pb-2">Dobras Cutâneas (mm)</h4>
                        <div className="space-y-3">
                            <DetailRow label="Tríceps" value={assessment.triceps} />
                            <DetailRow label="Subescapular" value={assessment.subscapular} />
                            <DetailRow label="Peitoral" value={assessment.chest} />
                            <DetailRow label="Axilar Média" value={assessment.axillary} />
                            <DetailRow label="Suprailíaca" value={assessment.suprailiac} />
                            <DetailRow label="Abdominal" value={assessment.abdominal} />
                            <DetailRow label="Coxa" value={assessment.thigh} />
                        </div>
                    </div>

                    {/* Circumferences */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 border-b border-slate-100 pb-2">Perímetros (cm)</h4>
                        <div className="space-y-3">
                            <DetailRow label="Braço Direito" value={assessment.armRight} />
                            <DetailRow label="Braço Esquerdo" value={assessment.armLeft} />
                            <DetailRow label="Cintura" value={assessment.waist} />
                            <DetailRow label="Abdômen" value={assessment.abdomen} />
                            <DetailRow label="Quadril" value={assessment.hips} />
                            <DetailRow label="Coxa Direita" value={assessment.thighRight} />
                            <DetailRow label="Coxa Esquerda" value={assessment.thighLeft} />
                        </div>
                    </div>

                    {/* Other Stats */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 border-b border-slate-100 pb-2">Índices</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600">IMC</span>
                                <span className="font-bold text-slate-800">{fmt(assessment.bmi, 100).toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Densidade</span>
                                <span className="font-bold text-slate-800">{fmt(assessment.density, 10000).toFixed(4)} g/cm³</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Taxa Metabólica Basal</span>
                                <span className="font-bold text-slate-800">{assessment.basalMetabolicRate} kcal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function SummaryCard({ label, value, delta, badIsIncrease, neutral }: { label: string, value: string, delta: number, badIsIncrease?: boolean, neutral?: boolean }) {
    if (delta === 0) {
        return (
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">{label}</p>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-slate-800 tracking-tighter">{value}</span>
                    <span className="text-sm font-bold text-slate-400 mb-1">-</span>
                </div>
            </div>
        )
    }

    const isPositive = delta > 0;
    const isBad = neutral ? false : (badIsIncrease ? isPositive : !isPositive);

    const colorClass = neutral ? 'bg-slate-50 text-slate-500' : (isBad ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600');
    const Icon = neutral ? Minus : (isPositive ? TrendUp : TrendDown);

    return (
        <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase mb-2">{label}</p>
            <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">{value}</span>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg mb-1 ${colorClass}`}>
                    <Icon weight="bold" />
                    {Math.abs(delta).toFixed(1)}
                </span>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: number | null }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-600 text-sm font-medium">{label}</span>
            <span className="font-bold text-slate-800">{value}</span>
        </div>
    );
}

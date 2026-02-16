const fs = require("fs");
const path = require("path");

const backupPath = path.join(__dirname, "../src/app/onboarding/OnboardingClient_bak_utf8.txt");
const targetPath = path.join(__dirname, "../src/app/onboarding/OnboardingClient.tsx");

let content = fs.readFileSync(backupPath, "utf8");

const encoding = [
  ["voc├¬", "você"],
  ["gr├ítis", "grátis"],
  ["informa├º├Áes", "informações"],
  ["experi├¬ncia", "experiência"],
  ["Servi├ºo", "Serviço"],
  ["gest├úo", "gestão"],
  ["Cria├º├úo", "Criação"],
  ["evolu├º├úo", "evolução"],
  ["alimenta├º├úo", "alimentação"],
  ["Execu├º├úo", "Execução"],
  ["cron├┤metro", "cronômetro"],
  ["/m├¬s", "/mês"],
  ["est├í", "está"],
  ["come├ºando", "começando"],
  ["At├®", "Até"],
  ["B├ísico", "Básico"],
  ["nutri├º├úo", "nutrição"],
  [" ├á ", " à "],
  ["Come├ºar Gr├ítis", "Começar Grátis"],
  ["GR├üTIS", "GRÁTIS"],
  ["d├¡gitos", "dígitos"],
  ["N├║mero", "Número"],
  ["Dura├º├úo", "Duração"],
  ["1 M├¬s", "1 Mês"],
  ["Pr├│ximo", "Próximo"],
  ["ÔåÆ", "→"],
  ["ÔåÉ", "←"],
  ["ÔêÆ", "−"],
  ["Ô£ô", "✓"],
  ["Ô£ò", "✕"],
  ["ÔÜá", "⚠"],
  ["ÔÇö", "—"],
  ["C├│digo", "Código"],
  ["Pe├ºa", "Peça"],
  ["n├úo", "não"],
  ["intelig├¬ncia", "inteligência"],
  ["­ƒÆ░", "💰"],
  ["­ƒÜÇ", "🚀"],
  ["­ƒÆÄ", "💎"],
  ["­ƒææ", "👑"],
  ["­ƒñû", "🤖"],
  ["┬À", "·"],
];

for (const [from, to] of encoding) {
  content = content.split(from).join(to);
}

content = content.replace(
  'import type { PlanOption, TrainerOnboardingData, ServicePlan, StudentOnboardingData } from "@/app/actions/onboarding";',
  'import type { PlanOption, TrainerOnboardingData, ServicePlan, StudentOnboardingData, PlatformPlanOption } from "@/app/actions/onboarding";'
);
content = content.replace(
  'export default function OnboardingPage() {',
  'export default function OnboardingClient({ initialPlatformPlans = [] }: { initialPlatformPlans?: PlatformPlanOption[] }) {'
);

fs.writeFileSync(targetPath, content, "utf8");
console.log("OnboardingClient.tsx restaurado com encoding corrigido.");

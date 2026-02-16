# Plano de Revisão e Aplicação — AltraFitness

Lista completa de tarefas para **correção de bugs**, **melhorias** e **restauração de comportamento** após o grande erro da componentização. Aplicar **por partes**, na ordem indicada, para não deixar nada pela metade.

---

## Visão geral das partes

| Parte | Foco | Prioridade |
|-------|------|------------|
| **1** | Imports e layout (Sidebar vs LayoutSidebar, convenção features) | Alta |
| **2** | Segurança (IDOR, debug, health, headers) | Crítica |
| **3** | Asaas (webhook, validações, idempotência) | Alta |
| **4** | Planos, trial, assinatura e configurações | Alta |
| **5** | Financeiro (createPaymentReceived, validações, UI) | Alta |
| **6** | Nutrição, treinos, alunos e formulários | Média |
| **7** | Área do aluno (dashboard, evolução, perfil, treino) | Média |
| **8** | Sales/Leads e superadmin | Média |
| **9** | Performance, testes e polish final | Média/Baixa |

---

# PARTE 1 — Imports e layout

Objetivo: unificar uso de layout e evitar imports quebrados.

## 1.1 Sidebar vs LayoutSidebar

- [ ] **NewPlanFlow** (`src/components/nutrition/NewPlanFlow.tsx`): hoje importa `Sidebar` de `@/components/layout/Sidebar`. Trocar para **LayoutSidebar** para manter consistência com o restante do dashboard (inclui SubscriptionNav e item Vendas condicional). Se a tela de novo plano for full-page sem sidebar em algum fluxo, avaliar se deve usar LayoutSidebar mesmo assim ou um layout específico.
- [ ] **Convenção:** Todas as páginas do dashboard (incluindo subpáginas de nutrição, treinos, alunos, etc.) devem usar **LayoutSidebar**. Garantir que não exista nenhuma página do dashboard usando `Sidebar` antigo.

## 1.2 Imports: features vs caminhos antigos

- [ ] **Decisão:** Manter uma única convenção:
  - **Opção A:** Páginas importam de `@/components/features/<dominio>/...` (ex.: `@/components/features/settings/SettingsContent`). Os re-exports em `src/components/` (dashboard, financial, students, etc.) podem ser removidos a longo prazo.
  - **Opção B:** Páginas importam dos caminhos antigos `@/components/dashboard/...`, `@/components/financial/...`, etc., e esses arquivos são **re-exports** que apontam para `@/components/features/...` (rodar `scripts/create-reexports.js` e garantir que todos os arquivos listados existam como re-export).
- [ ] Se **Opção B:** Verificar que cada entrada em `create-reexports.js` existe em `src/components/features/` e que o re-export em `src/components/` está criado e exporta corretamente (default export from features).
- [ ] **Settings:** A página de configurações já usa `SettingsContent` de `@/components/features/settings/SettingsContent`. Manter e garantir que ProfileSection, AccountSection, SubscriptionSection, AboutSection, etc. estejam em features e que SettingsContent os importe corretamente.

## 1.3 Layout do aluno (student)

- [ ] **Student layout:** Usa `StudentBottomNav` e `StudentSidebar` de `@/components/student/layout/`. Verificar se esses arquivos existem e funcionam (não foram deletados). Se foram movidos para features, criar re-exports ou atualizar imports para `@/components/features/student/layout/...`.

## 1.4 Checklist Parte 1

- [ ] Nenhuma página do dashboard usa `Sidebar`; todas usam `LayoutSidebar`.
- [ ] NewPlanFlow usa LayoutSidebar (ou layout aprovado).
- [ ] Convenção de imports definida e aplicada (features ou re-exports).
- [ ] Build (`npm run build`) passa sem erros de import.

---

# PARTE 2 — Segurança

Objetivo: corrigir IDOR, esconder debug em produção e endurecer headers/health.

## 2.1 Debug e health em produção

- [ ] **`/api/debug`:** Em produção retornar **404** (ou 403). Código em `src/app/api/debug/route.ts`: `if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Not Found' }, { status: 404 });` no início do handler.
- [ ] **`/api/health`:** Em produção não retornar `stack` nem detalhes de conexão (prefixos de URL do banco). Retornar apenas `{ status: 'ok' }` ou `{ status: 'error' }` sem dados sensíveis.

## 2.2 Headers de segurança

- [ ] **next.config.ts:** Garantir que `headers()` retorna:
  - `X-Frame-Options: DENY` (ou SAMEORIGIN se precisar embed)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin` (ou equivalente)
  - `Permissions-Policy` com restrições adequadas
- [ ] Rodar `next.config.security.test.ts` (se existir) e garantir que passa.

## 2.3 IDOR em Server Actions (ownership)

Validar em **todas** as actions que recebem ID de recurso:

- [ ] **financial.ts:**  
  - `togglePlanStatus`, `deletePlan`: filtrar por `planId` **e** garantir que o plano pertence ao `trainerId` atual (via join com plans ou subquery).  
  - `markAsPaid`, `deletePayment`: idem para payment (trainerId ou student.trainerId).  
  - `createPayment`: validar que `studentId` pertence ao trainer atual.  
  - `assignPlanToStudent`, `renewSubscription`, `cancelSubscription`: validar que `studentId` e `planId` pertencem ao trainer.
- [ ] **nutrition.ts:**  
  - `deleteAdHocLog`: validar que o log pertence ao aluno atual (studentId do log === student autenticado).  
  - `createNutritionalPlan`, `deleteNutritionalPlan`: validar que o aluno pertence ao trainer (ou que é o próprio aluno no fluxo aluno).
- [ ] **leads.ts:**  
  - `updateLeadStage`, `updateLeadMetadata`, `updateLeadStageData`: filtrar por `leadId` **e** `trainerId` (ou garantir que o lead pertence ao trainer).
- [ ] **workout-plans.ts:**  
  - `updateWorkoutPlan`, `deleteWorkoutPlan`: garantir `workoutPlans.trainerId === trainer atual`.  
  - `applyWorkoutPlanTemplate`: template do trainer e student do trainer.
- [ ] **workout-execution.ts:**  
  - `finishWorkout`: garantir que `log.studentId` é o aluno autenticado.  
  - `logSet`: garantir que `logId` pertence ao aluno atual.
- [ ] **forms.ts:**  
  - `submitFormResponse`: validar que o `assignmentId` pertence ao aluno autenticado (assignment.studentId === currentStudent).

## 2.4 Testes de segurança

- [ ] Rodar `npm run test` e garantir que passam:
  - `src/app/api/debug/route.test.ts`
  - `src/app/actions/financial.test.ts`
  - `src/app/actions/nutrition.test.ts`
  - `src/app/actions/workout-execution.test.ts`
  - `next.config.security.test.ts`

## 2.5 Checklist Parte 2

- [ ] Debug 404 em produção; health sem vazamento em produção.
- [ ] Headers de segurança configurados e testados.
- [ ] Todas as actions listadas validam ownership (trainerId/studentId).
- [ ] Testes de segurança passando.

---

# PARTE 3 — Asaas (webhook, validações, robustez)

Objetivo: evitar fraude no webhook, validar valores e datas, idempotência.

## 3.1 Webhook Asaas

- [ ] **Validação de origem:** Se `ASAAS_WEBHOOK_TOKEN` (ou valor em platform_settings) estiver definido, exigir header `asaas-access-token` igual a esse valor; retornar 401 se ausente ou diferente.
- [ ] **Idempotência:** Ao processar `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`, só atualizar registro se status ainda for `pending`. Se já estiver `paid`, retornar 200 sem alterar (evitar duplicar efeito em reenvio).
- [ ] **Formato de payment.id:** Validar que `payment.id` segue formato esperado (ex.: regex `pay_[a-zA-Z0-9_]+`, máx. 64 caracteres) antes de usar no `where`.

## 3.2 Validações em actions

- [ ] **createPlatformCharge** (superadmin): validar `amount > 0` e teto (ex.: R$ 999.999,99). Retornar erro amigável.
- [ ] **createPayment** (financial): idem — `amount > 0` e teto.
- [ ] **updateAsaasApiKey** (settings): trim e limite de tamanho (ex.: 200 caracteres).

## 3.3 UI de cobrança

- [ ] **CreatePlatformChargeForm:** Validar valor numérico e > 0 antes de enviar; exibir mensagem de erro no formulário (evitar NaN).
- [ ] **PaymentsList (Nova Cobrança):** Mesma validação de valor antes de chamar `createPayment`; exibir erro ao usuário.

## 3.4 Data de vencimento (opcional)

- [ ] Considerar validar `dueDate >= hoje` em createPlatformCharge e createPayment (ou permitir explícito “cobrança em atraso” com aviso).

## 3.5 Checklist Parte 3

- [ ] Webhook com token e idempotência; formato de payment.id validado.
- [ ] Validações de valor e tamanho de chave aplicadas.
- [ ] Formulários de cobrança não enviam NaN nem valores inválidos.

---

# PARTE 4 — Planos da plataforma, trial e configurações

Objetivo: planos (free, pro-monthly, pro-yearly), trial 30 dias, hasSalesPipeline, tema, assinatura.

## 4.1 Schema e planos

- [ ] **Schema:** Garantir que `platformPlans` tem: slug, name, priceCents, durationMonths, maxStudents, pricePerStudentCents, features, hasAi, hasPriority, **hasSalesPipeline**, **trialDays**, active, sortOrder. E que `trainers` tem theme, asaasApiKey, asaasCustomerId (e userRoles, platformCharges, platformSettings conforme já definido).
- [ ] **createPlatformPlan** (superadmin): tipo do `data` inclui `hasSalesPipeline` e `trialDays`; insert persiste esses campos (já aplicado na última sessão — apenas confirmar).
- [ ] **updatePlatformPlan:** Aceita e persiste hasSalesPipeline e trialDays (já aplicado — confirmar).

## 4.2 Settings (actions)

- [ ] **hasSalesAccess():** Lê plano do trainer, consulta platform_plans.hasSalesPipeline; retorna boolean.
- [ ] **getPlatformPlansForSettings()**, **PlatformPlanForSettings:** Disponíveis para a página de configurações e para troca de plano.
- [ ] **updateTheme()**, **syncThemeCookie():** Tema do trainer e cookie para evitar flash.
- [ ] **updateAsaasApiKey():** Trainer salva chave; TrainerProfile tem **hasAsaasKey**; getTrainerSettings preenche hasAsaasKey.
- [ ] **changeSubscriptionPlan(planSlug: string):** Aceita slug; trata trial via platform_plans.trialDays.
- [ ] **SubscriptionInfo:** Inclui plano **"free"** e **pricePerStudentCents?** opcional (para exibir na assinatura).

## 4.3 Página de configurações e layout

- [ ] Página **dashboard/settings/[[...rest]]/page.tsx** usa LayoutSidebar, importa SettingsContent de features, chama getPlatformPlansForSettings() e passa platformPlans (e profile, subscription, usage). Suporte a dark (classes e título).
- [ ] **Dashboard layout:** getRole(), hasSalesAccess(), SubscriptionNavProvider, SyncThemeFromDb; fundo dark quando tema dark (ex.: dark:bg-[#131B23]).
- [ ] **globals.css:** Variáveis --background e --foreground em :root e .dark; body usa essas variáveis.
- [ ] **layout.tsx (raiz):** ThemeProvider; script no head para cookie de tema antes da hidratação; `<html suppressHydrationWarning>`.

## 4.4 Trial 30 dias (TRIAL-RULES.md)

- [ ] **createPlatformCharge:** Para plano com trialDays (ex.: 30), definir primeira cobrança com vencimento em 30 dias (nextDueDate = today + 30).
- [ ] **Checkout/UX:** Modal ou copy com: “R$ 0,00 cobrados hoje”, “Acesso total à IA e Planos Alimentares”, “Lembrete automático antes da primeira cobrança”. Total hoje: R$ 0,00 em destaque (Performance Green #2ECC71).
- [ ] **Status no banco:** subscriptionStatus "trialing", trialEndsAt today + 30 quando aplicável.

## 4.5 Checklist Parte 4

- [ ] Planos com hasSalesPipeline e trialDays; create/update platform plan persistem.
- [ ] hasSalesAccess, getPlatformPlansForSettings, changeSubscriptionPlan e SubscriptionInfo corretos.
- [ ] Tema (DB + cookie + ThemeProvider + SyncThemeFromDb) funcionando.
- [ ] Trial aplicado na primeira cobrança quando plano tem trialDays.

---

# PARTE 5 — Financeiro (personal → alunos)

Objetivo: createPaymentReceived, createPayment com Asaas opcional, validações e UI.

## 5.1 Actions

- [ ] **createPaymentReceived({ studentId, amount, paidAt? }):** Registrar pagamento já recebido (sem Asaas). Usado em “Registrar pagamento recebido” no Financeiro.
- [ ] **createPayment:** Aceita opcionais **sendViaAsaas** e **billingType**; retorna `Promise<{ invoiceUrl?: string } | void>`. Validar studentId do trainer e amount > 0 e teto.

## 5.2 Schema payments

- [ ] Tabela `payments` com asaasPaymentId, asaasInvoiceUrl, billingType (quando aplicável).

## 5.3 UI Financeiro

- [ ] **PaymentsList:** Botão/fluxo “Registrar pagamento recebido” chama createPaymentReceived. Nova cobrança com “Enviar por Asaas” chama createPayment com sendViaAsaas/billingType e exibe invoiceUrl se retornado.
- [ ] **PlansManager, SubscriptionsList, FinancialHeader:** Funcionando e com imports corretos (features ou re-export). Se algum foi deletado, restaurar a partir de features ou do histórico git.

## 5.4 Checklist Parte 5

- [ ] createPaymentReceived implementado e usado na UI.
- [ ] createPayment com validação e retorno de invoiceUrl; PaymentsList com validação de valor e tratamento de erro.
- [ ] Página Financeiro carrega sem erro (PlansManager, FinancialHeader, SubscriptionsList, PaymentsList).

---

# PARTE 6 — Nutrição, treinos, alunos e formulários

Objetivo: garantir que todas as telas do trainer funcionam e usam layout/imports corretos.

## 6.1 Nutrição

- [ ] Páginas **nutrition**, **nutrition/library**, **nutrition/templates**, **nutrition/templates/new**, **nutrition/templates/[id]/edit** usam LayoutSidebar.
- [ ] **FoodLibraryList,** **MacroCalculator,** **MealPlanBuilder,** **NewPlanFlow,** **NutritionHeader,** **NutritionViewer,** **SmartMealBuilder,** **MacroDashboard,** **MetabolicCalculatorModal,** **FoodSearchPanel:** Imports corretos; se algum estiver em trainer/diet ou nutrition, garantir que a página que usa importa do caminho existente (trainer/diet vs nutrition vs features).
- [ ] **students/[id]/diet/new** e **students/[id]/diet/[planId]/edit:** SmartMealBuilder e LayoutSidebar; BackButton se aplicável.

## 6.2 Treinos

- [ ] Páginas **workouts**, **workouts/library**, **workouts/templates**, **workouts/new**, **workouts/[id]/edit** usam LayoutSidebar.
- [ ] **ExerciseCard,** **ExerciseLibraryList,** **ExerciseSelector,** **TemplateList,** **WorkoutBuilder,** **WorkoutSheetBuilder:** Existem e são importados corretamente (workouts/ ou features/workouts).

## 6.3 Alunos

- [ ] **students,** **students/[id],** **students/[id]/assessments/new,** **students/[id]/assessments/[assessmentId]:** LayoutSidebar e componentes de alunos/assessments.
- [ ] **StudentForm,** **StudentFormTrigger,** **StudentProfileTabs,** **StudentsPageContent,** **PlanSelectionModal,** **AssessmentFormModal,** **AssessmentList,** **DashboardOverview,** **BodyCompositionChart,** **WeightEvolutionChart:** Imports corretos.
- [ ] **AssessmentForm,** **AssessmentCamera,** **CompositionChart:** Usados em assessments; imports corretos.

## 6.4 Formulários

- [ ] **forms,** **forms/new:** LayoutSidebar e FormRenderer (ou componente equivalente). FormRenderer existe em forms/ ou features/forms.

## 6.5 Checklist Parte 6

- [ ] Todas as páginas de nutrição, treinos, alunos e formulários carregam sem erro 404 ou import quebrado.
- [ ] Componentes existem no caminho importado (ou re-export).

---

# PARTE 7 — Área do aluno (student)

Objetivo: dashboard do aluno, evolução, perfil, nutrição, treinos.

## 7.1 Layout do aluno

- [ ] **student/layout.tsx:** Usa StudentBottomNav e StudentSidebar de `@/components/student/layout/` (ou features). Arquivos existem e funcionam.

## 7.2 Páginas do aluno

- [ ] **student/page.tsx (dashboard):** StudentDashboardHeader, CalendarStrip, PendingFormsList (e outros cards como NextWorkoutCard, NextMealCard, HydrationTracker, MoodTracker, MissionAccomplished se fizerem parte do design). Imports corretos.
- [ ] **student/profile/page.tsx:** ProfilePageContent (ProfileHeader, StatsOverview, SettingsList, EditProfileModal).
- [ ] **student/evolution/page.tsx:** ConsistencyCalendar, EvolutionCharts, PhotoGallery, AssessmentHistory.
- [ ] **student/nutrition/page.tsx:** NutritionHeader, MealList, AdHocMealButton, AdHocMealList, CalendarStrip. **student/nutrition/[id]/page.tsx:** NutritionViewer.
- [ ] **student/workouts/page.tsx:** WorkoutList. **student/workouts/[id]/run/page.tsx:** WorkoutRunner.

## 7.3 Componentes student

- [ ] Todos os listados em create-reexports.js sob `student/` existem em src/components/student/ (ou em features e re-exportados). Se algum foi deletado, restaurar a partir de features ou git.

## 7.4 Checklist Parte 7

- [ ] Layout do aluno (bottom nav + sidebar) funciona.
- [ ] Dashboard, perfil, evolução, nutrição e treinos do aluno carregam e exibem conteúdo correto.

---

# PARTE 8 — Sales/Leads e Superadmin

Objetivo: pipeline de vendas, leads e painel superadmin estáveis.

## 8.1 Sales

- [ ] **dashboard/sales/page.tsx:** LayoutSidebar e SalesPageContent. Se hasSalesAccess for false, ocultar item de menu (já em LayoutSidebar) e redirecionar ou mostrar mensagem na página de vendas.
- [ ] **SalesPageContent,** **PipelineBoard,** **PipelineColumn,** **LeadCard,** **LeadDetailsModal,** **LeadConversionModal,** **ConversionModal,** **FunnelList,** **SalesMetrics,** **SalesAiManager:** Existem e imports corretos. InviteModal e PlansSetupAlert (usados por SalesPageContent/LeadsList) corretos.
- [ ] **LeadsList** importa ConversionModal de sales; JoinForm em join/[token].

## 8.2 Superadmin

- [ ] **Auth:** getRole() considera user_roles e isSuperAdminEmail(); getRoleRedirectUrl() mapeia superadmin para /superadmin. requireSuperAdmin() e isSuperAdminEmail() implementados em auth-helpers.
- [ ] **superadmin actions:** clerkClient usado como `(await clerkClient()).users.*` (não objeto direto). updatePlatformPlan e createPlatformPlan com hasSalesPipeline e trialDays.
- [ ] **Superadmin UI:** Planos (PlatformPlansManager), cobranças (CreatePlatformChargeForm, listagem, filtros), configurações (SuperAdminSettingsContent), usuários (SuperAdminListing). Todas as telas carregam sem erro.

## 8.3 Checklist Parte 8

- [ ] Sales acessível apenas com hasSalesAccess; componentes de sales e leads funcionando.
- [ ] Superadmin restrito a role superadmin; actions e UI de planos/cobranças/configurações/usuários ok.

---

# PARTE 9 — Performance, testes e polish final

Objetivo: transações onde fizer sentido, validação de entrada, testes e pequenos ajustes.

## 9.1 Transações e consistência

- [ ] Onde há múltiplas writes relacionadas (ex.: criar cobrança no Asaas + insert local), avaliar uso de transação ou fluxo “insert pending → chamar Asaas → update” para evitar estado inconsistente.
- [ ] createPayment: considerar insert com status pending e asaasPaymentId null, depois chamar Asaas e update com asaasPaymentId/asaasInvoiceUrl; ou documentar comportamento atual e tratamento de falha.

## 9.2 Validação de entrada (média prioridade)

- [ ] Em server actions que recebem dados do cliente, validar tipos e formatos (ex.: zod). Especialmente: nomes, emails, valores monetários, IDs (UUID).

## 9.3 Índices e N+1

- [ ] Revisar índices no schema (trainerId, studentId, planId, workoutId, createdAt) para listagens e filtros.
- [ ] Evitar N+1 em listagens com relações; usar `with` do Drizzle de forma consciente.

## 9.4 Testes

- [ ] Rodar toda a suíte: `npm run test`. Corrigir quaisquer testes quebrados após as mudanças das Partes 1–8.
- [ ] Manter cobertura de segurança (debug, financial, nutrition, workout-execution, next.config security).

## 9.5 Build e lint

- [ ] `npm run build` passa sem erros.
- [ ] Lint sem erros críticos nos arquivos alterados.

## 9.6 Checklist Parte 9

- [ ] Transações ou fluxos compensatórios revisados para cobranças.
- [ ] Testes passando; build e lint ok.

---

# Resumo de verificação rápida (após aplicar todas as partes)

1. **Build:** `npm run build` — sucesso.
2. **Testes:** `npm run test` — todos passando.
3. **Dashboard (trainer):** Login → Dashboard, Financeiro, Alunos, Treinos, Nutrição, Formulários, Vendas (se plano tiver), Configurações — todas as páginas carregam.
4. **Aluno:** Login como aluno → Dashboard, Perfil, Evolução, Nutrição, Treinos (lista e execução) — todas carregam.
5. **Superadmin:** Login como superadmin → Planos, Cobranças, Configurações, Usuários — ok.
6. **Segurança:** Debug 404 em produção; health sem vazamento; actions com validação de ownership.
7. **Asaas:** Webhook com token e idempotência; validações de valor nos formulários e actions.

---

*Documento gerado para aplicação por partes. Marque cada item conforme for concluído e avance para a próxima parte só após fechar o checklist da parte atual.*

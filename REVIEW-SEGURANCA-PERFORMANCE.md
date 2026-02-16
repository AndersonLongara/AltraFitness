# Revisão de Segurança e Performance — AltraFitness

Revisão realizada no projeto Next.js (App Router) com Clerk, Drizzle e Turso/LibSQL.

**Correções já aplicadas neste commit:**
- `/api/debug` retorna 404 em produção.
- Headers de segurança adicionados em `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).
- `financial.ts`: planos e pagamentos filtrados por `trainerId`; createPayment e assignPlanToStudent/renew/cancel validam que aluno e plano pertencem ao trainer.
- `nutrition.ts`: deleteAdHocLog só deleta log do aluno atual.
- `workout-execution.ts`: finishWorkout verifica que o log pertence ao aluno atual.

---

## 1. Segurança

### 1.1 Crítico — Corrigir o quanto antes

#### 1.1.1 Endpoint `/api/debug` exposto em produção
- **Arquivo:** `src/app/api/debug/route.ts`
- **Problema:** Retorna diagnóstico com prefixos de `TURSO_DATABASE_URL`, tamanho de tokens, nomes de tabelas e stacks de erro. Em produção isso vaza informações sensíveis e facilita ataques.
- **Sugestão:** Retornar 404 ou 403 em produção, ou remover o endpoint e usar apenas em desenvolvimento.

#### 1.1.2 Autorização por recurso (IDOR) em Server Actions
Várias actions verificam apenas “usuário autenticado” e usam apenas o ID do recurso, sem checar se o recurso pertence ao usuário/tenant (trainer ou student). Um atacante pode tentar outros IDs e acessar/alterar dados de outros.

| Arquivo | Função | Problema |
|---------|--------|----------|
| `financial.ts` | `togglePlanStatus`, `deletePlan` | Filtram só por `planId`; não verificam `trainerId`. Qualquer trainer pode alterar/deletar plano de outro. |
| `financial.ts` | `markAsPaid`, `deletePayment` | Filtram só por `paymentId`; não verificam se o pagamento é do trainer. |
| `financial.ts` | `createPayment` | Aceita `studentId` do cliente sem validar se o aluno pertence ao trainer. |
| `financial.ts` | `assignPlanToStudent`, `renewSubscription`, `cancelSubscription` | Não verificam se `studentId` pertence ao trainer. |
| `nutrition.ts` | `deleteAdHocLog` | Filtra só por `logId`; não verifica `studentId`. Um aluno pode deletar log de outro. |
| `nutrition.ts` | `createNutritionalPlan`, `deleteNutritionalPlan` | Não validam que o plano/student pertencem ao trainer (ou que o student é o dono no fluxo aluno). |
| `leads.ts` | `updateLeadStage`, `updateLeadMetadata`, `updateLeadStageData` | Filtram só por `leads.id`; não verificam `trainerId`. Qualquer usuário autenticado pode alterar lead de outro. |
| `workout-plans.ts` | `updateWorkoutPlan`, `deleteWorkoutPlan` | Filtram só por `planId`; não verificam `workoutPlans.trainerId`. |
| `workout-plans.ts` | `applyWorkoutPlanTemplate` | Não verifica se o template é do trainer e se o `studentId` pertence a ele. |
| `workout-execution.ts` | `finishWorkout` | Não verifica se `log.studentId` é o aluno atual. Um aluno pode “finalizar” treino de outro e ganhar XP em nome dele. |
| `workout-execution.ts` | `logSet` | Não verifica se o `logId` pertence ao aluno atual. |
| `forms.ts` | `submitFormResponse` | Usa só `assignmentId`; não verifica se o assignment é do aluno autenticado. |

**Padrão recomendado:** Em toda action que recebe um ID de recurso (plano, pagamento, lead, plano de treino, log, assignment):

- **Trainer:** garantir `trainerId === (trainer atual)` (ou que o recurso esteja ligado a um student desse trainer).
- **Student:** garantir `studentId === (student atual)` para logs, assignments, etc.

---

### 1.2 Importante — Endurecer em breve

#### 1.2.1 Headers de segurança
- **Arquivo:** `next.config.ts`
- **Problema:** Não há headers como `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e, se possível, CSP.
- **Sugestão:** Configurar esses headers em `next.config.ts` (ex.: em `headers()` ou via middleware) para reduzir risco de clickjacking, MIME sniffing e vazamento de referrer.

#### 1.2.2 Health check (`/api/health`)
- **Arquivo:** `src/app/api/health/route.ts`
- **Problema:** Em erro, retorna `stack` e prefixos de URL do banco. Em produção é melhor não expor stack e limitar detalhes.
- **Sugestão:** Em produção, retornar apenas `{ status: 'ok' }` ou `{ status: 'error' }` sem stack e sem detalhes de conexão; opcionalmente restringir acesso por IP ou por header interno.

#### 1.2.3 Webhook Clerk
- **Arquivo:** `src/app/api/webhooks/clerk/route.ts`
- **Status:** Assinatura Svix está sendo verificada — bom.
- **Sugestão:** Garantir que `CLERK_WEBHOOK_SECRET` não seja exposto no cliente e que o webhook não seja chamado por rotas que exijam sessão de usuário (manter rota pública só para o Clerk).

#### 1.2.4 `dangerouslySetInnerHTML`
- **Arquivo:** `src/app/(auth)/layout.tsx`
- **Uso:** `clerkStyleOverrides` (CSS estático do `clerk-theme.ts`).
- **Risco:** Baixo, pois o conteúdo é estático e controlado pelo código.
- **Sugestão:** Manter apenas esse uso; não usar `dangerouslySetInnerHTML` com dados de usuário ou de API.

---

### 1.3 Recomendações gerais de segurança

- **Variáveis de ambiente:** Não commitar `.env` ou `.env.local`. Usar apenas `NEXT_PUBLIC_*` para o que realmente precisa ir ao cliente (ex.: chave pública do Clerk). Manter `CLERK_WEBHOOK_SECRET`, `TURSO_AUTH_TOKEN`, `GOOGLE_GENERATIVE_AI_API_KEY`, `RAPID_API_KEY` apenas no servidor.
- **Validação de entrada:** Em todas as server actions que recebem dados do cliente, validar tipos, tamanhos e formatos (ex.: zod ou yup). Especialmente: nomes, emails, CPF, valores monetários, IDs (UUID), e campos de texto longo para evitar abusos e inconsistências.
- **Rate limiting:** Considerar rate limit em rotas sensíveis (login, webhook, APIs de criação de recurso) para mitigar abuso e força bruta.
- **Logs:** Evitar logar dados sensíveis (tokens, senhas, PII). O webhook já faz `console.log` de eventos — em produção considerar nível de log e remoção de dados pessoais.

---

## 2. Performance

### 2.1 Banco de dados e queries

- **Drizzle + Turso:** Uso de ORM com prepared statements é adequado; evita SQL injection quando os IDs vêm validados e se usa apenas APIs do Drizzle (sem concatenação de SQL).
- **Múltiplas queries em sequência:** Em várias actions há várias chamadas `db.*` em sequência (ex.: financial, nutrition, workout-plans). Onde fizer sentido, usar `db.transaction()` para garantir consistência e, quando possível, reduzir round-trips (ex.: batch inserts/updates).
- **Índices:** Garantir índices nas colunas usadas em `where` e em joins (ex.: `trainerId`, `studentId`, `planId`, `workoutId`, `createdAt`). O schema já define FKs; verificar se o Turso/Drizzle gera índices adequados para as queries mais quentes (listagens, filtros por trainer/student).
- **Evitar N+1:** Em listagens com relações (ex.: students com plan, workouts com items), usar `with` do Drizzle de forma consciente; não carregar relações desnecessárias em listas grandes.

### 2.2 Next.js e React

- **Server Components:** O projeto já usa RSC; manter dados que não dependem de interatividade no servidor e passar apenas o necessário para client components.
- **Revalidação:** Uso de `revalidatePath` após mutations está correto. Avaliar se em algumas telas faz sentido `revalidateTag` para invalidar apenas partes do layout (ex.: lista de alunos) em vez de toda a página.
- **Bundle:** Verificar se bibliotecas pesadas (recharts, dnd-kit, etc.) estão sendo importadas apenas onde são usadas; considerar dynamic import para telas menos críticas (ex.: `next/dynamic` para modais ou páginas secundárias).
- **Imagens:** `next.config.ts` já define `remotePatterns` para imagens externas; usar o componente `next/image` onde possível para otimização automática.

### 2.3 APIs e rede

- **Health/debug:** Reduzir payload e trabalho em produção no health (e desativar o debug) para que load balancers e monitoramento não provoquem custo ou carga desnecessária.
- **Fetch externo (leads):** Em `leads.ts` há `fetch(data.photoUrl)` para URLs do Instagram. Considerar timeout e tamanho máximo de resposta para não travar a action; o fallback para base64 já existe — garantir que falhas não quebrem a criação do lead.

---

## 3. Resumo de ações sugeridas

| Prioridade | Ação |
|------------|------|
| Crítica | Desabilitar ou restringir `/api/debug` em produção. |
| Crítica | Em todas as server actions que recebem IDs, validar ownership (trainerId/studentId) antes de update/delete. |
| Alta | Adicionar headers de segurança em `next.config.ts`. |
| Alta | Reduzir informação exposta em `/api/health` em produção (sem stack, sem detalhes de DB). |
| Média | Validar entradas com schema (ex.: zod) em todas as actions. |
| Média | Revisar índices do banco para listagens e filtros por tenant. |
| Média | Usar transações onde há múltiplas writes relacionadas. |
| Baixa | Rate limiting em rotas sensíveis. |
| Baixa | Dynamic imports para componentes pesados. |

---

---

## 4. Testes unitários de segurança

Foram criados testes (Vitest) que cobrem as preocupações desta revisão:

| Arquivo | O que cobre |
|--------|-------------|
| `src/app/api/debug/route.test.ts` | Em produção, `GET /api/debug` retorna 404 (não vaza env/DB). |
| `src/app/actions/financial.test.ts` | `getCurrentTrainer` é chamado; `createPayment` rejeita aluno de outro trainer; `assignPlanToStudent` rejeita plano ou aluno de outro trainer; delete/update de plan e payment usam `where`. |
| `src/app/actions/nutrition.test.ts` | `deleteAdHocLog` exige usuário autenticado, aluno encontrado por email, e chama `delete` com `where`. |
| `src/app/actions/workout-execution.test.ts` | `finishWorkout` rejeita quando o log é de outro aluno; exige aluno atual e atualiza apenas quando o log pertence ao aluno. |
| `next.config.security.test.ts` | `headers()` inclui X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. |

**Como rodar:** `npm run test` (uma vez) ou `npm run test:watch` (modo watch).

---

*Revisão feita com base na estrutura e no código atuais do repositório. Recomenda-se revalidar após mudanças em auth (Clerk), multi-tenant e novas APIs.*

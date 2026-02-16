# Painel ADM (Super Admin) — Melhorias e bugs (consolidado)

Documento de **busca aprofundada** sobre o painel de administração: o que foi conversado, aplicado no código e o que ainda consta como pendente nos planos de revisão.

---

## 1. O que é o Painel ADM

- **Nome no código:** Super Admin (SuperADM).
- **Documentação:** [SUPERADMIN.md](./SUPERADMIN.md).
- **Função:** Permitir ao dono da plataforma gerenciar **clientes (personais)**, **alunos**, **pagamentos à plataforma** e **planos da plataforma** em um único lugar.
- **Permissão:** Role `superadmin` na tabela `user_roles` (nosso banco), não no Clerk. Atribuído manualmente via script `npx tsx src/scripts/add-superadmin.ts <CLERK_USER_ID>`.

### Rotas do Super Admin

| Rota | Descrição |
|------|-----------|
| `/superadmin` | Dashboard com totais (clientes, alunos, receita do mês, pagamentos) |
| `/superadmin/trainers` | Lista de todos os clientes (personais) |
| `/superadmin/trainers/[id]` | Detalhe do cliente (planos, últimos pagamentos) |
| `/superadmin/students` | Lista de todos os alunos (filtro por cliente) |
| `/superadmin/charges` | Cobranças plataforma → personais (criar, listar, PIX/Boleto) |
| `/superadmin/payments` | Redireciona para `/superadmin/charges` |
| `/superadmin/plans` | CRUD dos planos da plataforma (Free, Mensal, Anual, etc.) |
| `/superadmin/settings` | Conta do Super Admin e integração Asaas (API, webhook, ambiente) |
| `/superadmin/users` | Listagem de usuários (user_roles) |

### Segurança já aplicada

- **Actions:** Todas as funções em `src/app/actions/superadmin.ts` chamam `requireSuperAdmin()` antes de qualquer operação.
- **Layout:** `src/app/superadmin/layout.tsx` usa `getRole()` e redireciona quem não for superadmin.

---

## 2. Melhorias e bugs discutidos e **já aplicados** no código

Com base em **CORE-REVIEW-ASAAS.md** e **REVIEW-SEGURANCA-PERFORMANCE.md**:

### 2.1 Asaas e cobranças (CORE-REVIEW-ASAAS)

| Item | Onde | Status no código |
|------|------|------------------|
| Webhook: validar header `asaas-access-token` quando `ASAAS_WEBHOOK_TOKEN` definido | `api/webhooks/asaas/route.ts` | Aplicado (checklist CORE-REVIEW) |
| createPlatformCharge: validar `amount > 0` e teto R$ 999.999,99 | `superadmin.ts` | Aplicado (`MAX_CHARGE_CENTS`, checagem `Number.isFinite`, `amount <= 0`, `amount > MAX_CHARGE_CENTS`) |
| createPayment (financeiro): validar valor e teto | `financial.ts` | Aplicado (conforme checklist) |
| CreatePlatformChargeForm: validar valor numérico e > 0; exibir erro | `CreatePlatformChargeForm.tsx` | Aplicado (`parseFloat`, `Number.isNaN`, `valueReais <= 0`, `valueReais > 999_999.99`, `setError`) |
| PaymentsList: validar valor antes de createPayment; exibir erro | `PaymentsList.tsx` | Aplicado (conforme checklist) |
| updateAsaasApiKey: trim e limite 200 caracteres | `settings.ts` | Aplicado |
| Webhook: idempotência (só atualizar se status `pending`) | webhook asaas | Aplicado |
| Webhook: validar formato de `payment.id` (regex, máx. 64 chars) | webhook asaas | Aplicado |

### 2.2 Segurança geral (REVIEW-SEGURANCA-PERFORMANCE)

| Item | Onde | Status no código |
|------|------|------------------|
| `/api/debug` retorna 404 em produção | `api/debug/route.ts` | Aplicado |
| Headers de segurança (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | `next.config.ts` | Aplicado |
| financial.ts: planos e pagamentos filtrados por `trainerId`; createPayment e assignPlanToStudent/renew/cancel validam aluno e plano do trainer | `financial.ts` | Aplicado |
| nutrition.ts: deleteAdHocLog só do aluno atual | `nutrition.ts` | Aplicado |
| workout-execution.ts: finishWorkout verifica que o log pertence ao aluno atual | `workout-execution.ts` | Aplicado |

### 2.3 Super Admin (PLANO-REVISAO / SUPERADMIN.md)

| Item | Status |
|------|--------|
| requireSuperAdmin() em todas as actions | Implementado em `auth-helpers` e usado em `superadmin.ts` |
| createPlatformPlan / updatePlatformPlan com hasSalesPipeline e trialDays | Conforme PARTE 4 e 8 do plano — confirmar no código se persistência está ok |
| Layout padrão (max-w-6xl, px-6, etc.) | Definido em SUPERADMIN.md; layout em `superadmin/layout.tsx` |
| SuperAdminListing para tabelas | Componente em `components/features/superadmin/SuperAdminListing.tsx` |
| Planos (PlatformPlansManager), cobranças (CreatePlatformChargeForm), settings (SuperAdminSettingsContent), usuários | Páginas existem: plans, charges, settings, users |

---

## 3. Itens ainda **pendentes** (dos planos de revisão)

Itens que **conversamos e documentamos** mas que podem ainda estar abertos ou parcialmente feitos. Fonte: **PLANO-REVISAO-APLICACAO.md** e **CORE-REVIEW-ASAAS.md**.

### 3.1 PARTE 8 — Superadmin (PLANO-REVISAO)

- [ ] **Auth:** `getRole()` considera `user_roles` e `isSuperAdminEmail()`; `getRoleRedirectUrl()` mapeia superadmin para `/superadmin`. `requireSuperAdmin()` e `isSuperAdminEmail()` em auth-helpers — **verificar se já estão implementados.**
- [ ] **superadmin actions:** Usar `(await clerkClient()).users.*` (não objeto direto) onde houver uso de Clerk.
- [ ] **Superadmin UI:** Garantir que todas as telas (Planos, Cobranças, Configurações, Usuários) carregam sem erro e usam LayoutSidebar / padrão do SUPERADMIN.md.

### 3.2 Asaas / cobranças (CORE-REVIEW / PLANO)

- [ ] **createPlatformCharge sem try/catch para Asaas:** Se Asaas retornar 200 e o insert local falhar, fica cobrança no Asaas sem registro local. Considerar transação ou fluxo “insert pending → Asaas → update” ou log de compensação.
- [ ] **createPayment (financial):** Mesmo cenário (sucesso Asaas + falha insert). Mitigação sugerida: inserir payment com status pending e asaasPaymentId null, depois chamar Asaas e atualizar.
- [ ] **Data de vencimento:** Opcional validar `dueDate >= hoje` em createPlatformCharge e createPayment (ou permitir “cobrança em atraso” com aviso).

### 3.3 PARTE 4 — Planos e trial

- [ ] **createPlatformPlan:** Confirmar que o tipo de `data` inclui `hasSalesPipeline` e `trialDays` e que o insert persiste esses campos.
- [ ] **updatePlatformPlan:** Aceita e persiste hasSalesPipeline e trialDays.

### 3.4 SUPERADMIN.md — “Próximos passos”

- Edição de cliente (assinatura, status) pelo SuperADM.
- Exportação de relatórios (CSV/Excel).
- Faturamento consolidado por período.

---

## 4. Resumo

| Fonte | Foco | Aplicado | Pendente |
|-------|------|----------|----------|
| CORE-REVIEW-ASAAS | Webhook, valor cobrança, NaN, idempotência, formato payment.id | Sim (checklist marcado) | Transação/compensação Asaas vs insert local; dueDate |
| REVIEW-SEGURANCA-PERFORMANCE | Debug 404, headers, IDOR financial/nutrition/workout-execution | Sim | Outras actions (leads, workout-plans, forms) conforme PARTE 2 |
| PLANO-REVISAO-APLICACAO | Partes 1–9 (layout, segurança, Asaas, planos, financeiro, superadmin, etc.) | Várias partes aplicadas | Itens ainda com checkbox em branco nas Partes 6, 7, 8 e 9 |
| SUPERADMIN.md | Rotas, layout, segurança, listagem | Implementado | Próximos passos (edição cliente, exportação, faturamento) |

---

## 5. Arquivos de referência

- [SUPERADMIN.md](./SUPERADMIN.md) — Regras e rotas do painel.
- [PLANO-REVISAO-APLICACAO.md](./PLANO-REVISAO-APLICACAO.md) — Plano por partes (1–9) com checklists.
- [CORE-REVIEW-ASAAS.md](./CORE-REVIEW-ASAAS.md) — Revisão Asaas (segurança, bugs, checklist aplicado).
- [REVIEW-SEGURANCA-PERFORMANCE.md](./REVIEW-SEGURANCA-PERFORMANCE.md) — Segurança e performance (debug, headers, IDOR, testes).

Este documento consolida a **busca aprofundada** sobre o painel ADM e as melhorias/bugs que foram conversados e aplicados (ou ainda pendentes) no código.

# Planos da plataforma (personais)

Use o painel **Super Admin → Planos** para criar/editar os planos. Seguem as especificações oficiais.

---

## 1. AltraStart (Grátis)

Focado em personais iniciantes com até 5 alunos.

| Campo | Valor |
|-------|--------|
| **Identificador (slug)** | `free` |
| **Nome de exibição** | AltraStart (Grátis) |
| **Preço (R$)** | 0 |
| **Duração (meses)** | 1 |
| **Máx. alunos** | 5 |
| **Preço por aluno (R$)** | (vazio = não cobra) |
| **IA** | Não |
| **Prioridade** | Não |

**Benefícios (um por linha):**
- Até 5 alunos ativos
- Gestão de treinos essencial
- Dashboard básico de métricas
- Suporte via comunidade
- Acesso ao App do Aluno

---

## 2. AltraPerformance (Mensal)

Plano completo para escala, com **30 dias de trial grátis**. Na primeira cobrança (Super Admin → Pagamentos à plataforma), o vencimento é aplicado automaticamente em 30 dias quando o personal está neste plano.

| Campo | Valor |
|-------|--------|
| **Identificador (slug)** | `pro-monthly` |
| **Nome de exibição** | AltraPerformance (Mensal) |
| **Preço (R$)** | 99,90 |
| **Duração (meses)** | 1 |
| **Máx. alunos** | (vazio = Ilimitado) |
| **Preço por aluno (R$)** | 1,99 |
| **IA** | Sim |
| **Prioridade** | Não |

**Benefícios (um por linha):**
- Alunos ilimitados
- 30 dias grátis para testar
- Smart Meal Builder (TACO/TBCA)
- Pipeline Kanban de Vendas
- Insights preditivos de Churn
- Periodização de treinos completa

---

## 3. AltraElite (Anual)

Foco em retenção e fidelidade, com 29% de desconto e suporte VIP. **30 dias de trial** na primeira cobrança (mesma regra do mensal).

| Campo | Valor |
|-------|--------|
| **Identificador (slug)** | `pro-yearly` |
| **Nome de exibição** | AltraElite (Anual) |
| **Preço (R$)** | 851,15 (equivale a R$ 70,92/mês) |
| **Duração (meses)** | 12 |
| **Máx. alunos** | (vazio = Ilimitado) |
| **Preço por aluno (R$)** | 1,99 |
| **IA** | Sim |
| **Prioridade** | Sim |

**Benefícios (um por linha):**
- Economia de 29% (4 meses grátis)
- Alunos ilimitados
- Atendimento Prioritário VIP
- Smart Meal Builder (TACO/TBCA)
- CRM completo com Social Seller
- AI Manager Full Access

---

## Regras do sistema

- **Trial (30 dias):** Ao criar a primeira cobrança (checkout) para um personal com plano `pro-monthly` ou `pro-yearly`, a Server Action `createPlatformCharge` define o vencimento em 30 dias automaticamente.
- **Limite de alunos:** Planos com "Máx. alunos" (ex.: 5 no free) são aplicados ao cadastrar aluno; acima do limite, a ação `createStudent` retorna erro orientando upgrade.
- **Preço por aluno:** Em **Super Admin → Planos** cada plano pode ter um **Preço por aluno (R$)**. Se preenchido (ex.: 1,99), planos Pro cobram esse valor por aluno; vazio = não cobra. O valor aparece na assinatura do personal (Configurações) e no onboarding.
- **UI ADM:** O botão **Criar** no formulário de planos usa Performance Green (#2ECC71) para coerência com a PoC.

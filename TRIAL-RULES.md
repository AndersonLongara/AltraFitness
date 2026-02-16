# Regras do Trial de 30 Dias (Premium)

## Lógica do Checkout

| Item | Valor |
|------|--------|
| Valor Imediato | R$ 0,00 |
| Período de Carência | 30 dias |
| Recorrência | Após 30 dias, o valor do plano (Mensal ou Anual) é debitado automaticamente, salvo cancelamento |
| Acesso | Imediato às funcionalidades (IA, Nutrição, CRM completo) após validação do cartão |

---

## Regras de Cobrança

| Regra | Descrição |
|-------|-----------|
| Trial Trigger | Ativado apenas para a **primeira assinatura** de cada `trainerId` |
| Card Validation | O gateway (Asaas) realiza pré-autorização simbólica para validar o cartão |
| Notificação 7 dias | O sistema envia e-mail/notificação automática 7 dias antes do fim do trial |

---

## UX: Modal de Ativação de Teste

- **Visual:** Card com bordas `rounded-[32px]`, fundo Ice White (#F8F9FA)
- **Mensagem:** "Comece seus 30 dias de AltraElite agora. Cancele quando quiser com um clique."
- **Checklist de Transparência:**
  - ✅ R$ 0,00 cobrados hoje
  - ✅ Acesso total à IA e Planos Alimentares
  - ✅ Lembrete automático antes da primeira cobrança

---

## Integração Asaas

- **Subscription:** `billingType: CREDIT_CARD`, `nextDueDate: today + 30 days`, `cycle: MONTHLY` ou `YEARLY`
- **Status no banco:** `subscriptionStatus: "trialing"`, `trialEndsAt: today + 30 days`
- **Checkout:** Formulário de cartão (Stripe Elements ou redirect para Asaas Checkout) — 12px radius, fonte Plus Jakarta Sans

---

## Copy Obrigatório

> "Você não será cobrado hoje. Sua assinatura começará em [DATA_ATUAL + 30 DIAS]."
> "Total hoje: R$ 0,00" (destaque Performance Green #2ECC71)

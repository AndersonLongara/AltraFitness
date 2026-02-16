# Core Review — Integração Asaas

Revisão de segurança, bugs e boas práticas da integração com Asaas (cobranças plataforma → personal, personal → alunos).

---

## 1. Segurança

### 1.1 Crítico

| # | Problema | Onde | Risco |
|---|----------|------|--------|
| 1 | **Webhook sem validação de origem** | `src/app/api/webhooks/asaas/route.ts` | Qualquer pessoa pode enviar POST com `event: PAYMENT_RECEIVED` e `payment.id: <asaasPaymentId>` e marcar cobranças como pagas sem ter pago. Permite fraude (marcar como pago sem pagar). |
| 2 | **Chave API do personal em texto plano no banco** | `trainers.asaas_api_key` | Se o banco vazar, todas as chaves Asaas dos personais vazam. Recomendação: documentar risco; a médio prazo considerar criptografia em repouso ou uso de vault. |

### 1.2 Importante

| # | Problema | Onde | Risco |
|---|----------|------|--------|
| 3 | **updateAsaasApiKey sem validação de tamanho** | `src/app/actions/settings.ts` | String muito longa pode ser enviada (DoS ou abuso). Limitar tamanho (ex.: 200 caracteres). |
| 4 | **createPayment / createPlatformCharge sem validar valor** | `financial.ts`, `superadmin.ts` | Valor ≤ 0 ou negativo pode ser enviado (cliente manipulado). Asaas pode rejeitar, mas o registro local pode ficar inconsistente. Validar `amount > 0` e teto razoável. |

### 1.3 Recomendações

- **Webhook:** Configurar no Asaas um **token de autenticação** (campo `authToken`) e enviar no header `asaas-access-token`. No endpoint, ler `ASAAS_WEBHOOK_TOKEN` do ambiente e comparar com o header; rejeitar com 401 se configurado e diferente.
- **Chave no banco:** Não retornar `asaasApiKey` em nenhuma API ou serialização para o cliente; já está ok (só `hasAsaasKey` é exposto). Em backups e logs, garantir que a coluna não seja exportada em claro em relatórios.

---

## 2. Bugs

### 2.1 Crítico / Alta

| # | Problema | Onde | Correção |
|---|----------|------|----------|
| 1 | **Valor da cobrança (R$) vira NaN ou negativo** | `CreatePlatformChargeForm.tsx` | `parseFloat(amount.replace(",", "."))` com input inválido (ex.: "abc", "") gera `NaN`. `Math.round(NaN * 100)` = `NaN`. Validar antes: `const num = parseFloat(amount.replace(",", ".")); if (isNaN(num) || num <= 0) { setError("Valor inválido"); return; }`. |
| 2 | **Mesmo problema na Nova Cobrança (personal → aluno)** | `PaymentsList.tsx` | Mesma lógica: validar valor numérico e > 0 antes de chamar `createPayment`. Evitar enviar `amount: NaN` para a action. |
| 3 | **Data de vencimento no passado** | `createPlatformCharge`, `createPayment` | Asaas pode aceitar; mas cobrança “vencida” pode confundir. Opcional: validar `dueDate >= hoje` (ou permitir explícito “cobrança em atraso”). |

### 2.2 Média

| # | Problema | Onde | Correção |
|---|----------|------|----------|
| 4 | **createPlatformCharge sem try/catch para Asaas** | `superadmin.ts` | Se `createCustomer` ou `createPayment` do Asaas falhar, o fluxo quebra. Já propaga exceção; garantir que o UI mostre a mensagem e não faça insert no banco se Asaas falhar. Hoje o insert é após o Asaas; se Asaas lançar, não insere — ok. Mas se Asaas retornar 200 e o insert falhar, fica cobrança no Asaas sem registro local. Considerar transação ou “compensação” (ex.: log para reprocessar). |
| 5 | **createPayment: sucesso no Asaas e falha no insert** | `financial.ts` | Mesmo cenário: cobrança criada no Asaas e insert em `payments` falha. Usuário não vê o pagamento na lista; o webhook pode até atualizar um registro que não existe. Mitigação: inserir primeiro o payment com status pending e asaasPaymentId null; depois chamar Asaas; em seguida update com asaasPaymentId e asaasInvoiceUrl. Ou fazer insert após Asaas e tratar falha de insert (retry ou log). |

---

## 3. Melhorias de robustez

| # | Sugestão | Onde |
|---|----------|------|
| 1 | **Idempotência no webhook** | Se o Asaas reenviar o mesmo evento, não dar erro e não alterar de novo (checar se já está `paid` antes de update). |
| 2 | **Log estruturado (sem dados sensíveis)** | Em webhook e nas chamadas Asaas, logar apenas `paymentId`, `event`, sucesso/falha — nunca chave API ou valor. |
| 3 | **Validação do formato de paymentId no webhook** | Asaas usa IDs no formato `pay_xxxx`. Validar formato antes de usar no `where` para evitar injeção ou comportamento estranho. |
| 4 | **Limite de valor** | Rejeitar valores acima de um teto (ex.: R$ 999.999,99) para evitar erros de digitação ou abuso. |

---

## 4. Checklist de correções aplicadas

- [x] Webhook: validar header `asaas-access-token` quando `ASAAS_WEBHOOK_TOKEN` estiver definido.
- [x] createPlatformCharge: validar `amount > 0` e valor máximo (R$ 999.999,99).
- [x] createPayment: validar `amount > 0` e teto (R$ 999.999,99).
- [x] CreatePlatformChargeForm: validar valor numérico e > 0; exibir erro no formulário.
- [x] PaymentsList: validar valor antes de createPayment; exibir erro ao usuário.
- [x] updateAsaasApiKey: trim e limite de tamanho (200 caracteres).
- [x] Webhook: idempotência (só atualizar registros com status `pending`).
- [x] Webhook: validar formato de `payment.id` (regex `pay_[a-zA-Z0-9_]+`, máx. 64 chars).

### Variável de ambiente

- **`ASAAS_WEBHOOK_TOKEN`** (opcional): Se definida, o webhook Asaas exige que o header `asaas-access-token` seja igual a esse valor. Configure o mesmo token no painel do Asaas (campo “Token de autenticação” da URL do webhook).

---

*Review gerado com base no código da integração Asaas. Recomenda-se revisar após mudanças em webhooks ou em dados sensíveis (chaves, valores).*

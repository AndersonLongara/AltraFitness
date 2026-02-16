# Passo a passo: Personal novo na plataforma

Guia para ajudar o personal a configurar a plataforma após o cadastro inicial.

---

## Visão geral dos passos

1. **Configurar Asaas** (opcional) — para cobranças automáticas via PIX/Boleto/Cartão  
2. **Criar planos para alunos** — valores e durações que você oferece  
3. **Convidar alunos** — link de convite ou cadastro manual  
4. **Registrar cobranças** — Asaas ou manual (pago fora)

---

## 1. Configurar Asaas (opcional)

O Asaas permite enviar cobranças automáticas (PIX, Boleto, Cartão) para seus alunos. **Você pode pular este passo** se preferir cobrar por fora (transferência, dinheiro, etc.) e apenas registrar os pagamentos na plataforma.

### 1.1 Criar conta Asaas (se não tiver)

- **Produção:** [https://www.asaas.com/](https://www.asaas.com/)
- **Testes (Sandbox):** [https://sandbox.asaas.com/](https://sandbox.asaas.com/) — use para testar sem cobrar de verdade

1. Acesse o site e clique em "Criar conta"
2. Preencha CPF/CNPJ, e-mail e dados da empresa
3. Valide o e-mail e complete o cadastro

### 1.2 Obter a Chave de API (token)

1. No painel Asaas, vá em **Integrações** (ou acesse [https://www.asaas.com/customerApiAccessToken/index](https://www.asaas.com/customerApiAccessToken/index))
2. Clique em **"Nova chave de API"**
3. Copie a chave **imediatamente** — ela só aparece uma vez e não pode ser recuperada
4. Cole na plataforma em **Configurações → Conta → Cobranças Asaas**

> ⚠️ A chave é **irrecuperável**. Se perder, gere uma nova no Asaas e atualize nas Configurações.

### 1.3 Ambiente Sandbox vs Produção

- **Sandbox:** para testar sem cobrar. Use a chave do [sandbox.asaas.com](https://sandbox.asaas.com)
- **Produção:** cobranças reais. Use a chave do [asaas.com](https://www.asaas.com)

---

## 2. Criar planos para alunos

Em **Financeiro** você cria os planos que oferece aos alunos (ex: Mensal R$ 150, Trimestral R$ 400).

1. Acesse **Financeiro**
2. Em **Planos de Assinatura**, clique em **Novo Plano**
3. Preencha:
   - **Nome:** ex. "Mensal Gold"
   - **Preço:** ex. 150,00
   - **Duração:** 1, 3, 6 ou 12 meses

Esses planos aparecem ao vincular um aluno a um plano e ao criar cobranças.

---

## 3. Convidar alunos

- Use o **código de time** (em Configurações) para o aluno se cadastrar
- Ou cadastre o aluno manualmente em **Alunos → Novo aluno**

---

## 4. Registrar cobranças

Você tem **duas formas** de registrar cobranças:

### Opção A: Usar Asaas (PIX/Boleto/Cartão)

- Configure a chave Asaas (passo 1)
- Em **Financeiro → Nova Cobrança**, marque **"Enviar cobrança por Asaas"**
- Escolha PIX, Boleto ou Cartão
- O aluno recebe o link de pagamento e, ao pagar, o status é atualizado automaticamente

### Opção B: Cobrar por fora (sem Asaas)

- Em **Financeiro → Nova Cobrança**, **não** marque "Enviar cobrança por Asaas"
- A cobrança é criada como **pendente**
- Quando o aluno pagar (PIX manual, dinheiro, transferência etc.), clique em **Marcar como Pago**

### Opção C: Aluno já pagou

- Se o aluno **já te pagou** antes de configurar a plataforma (ou fora dela):
- Use **"Registrar pagamento recebido"** em **Financeiro**
- Preencha aluno, valor e data
- O pagamento é registrado já como **pago**, mantendo o controle financeiro correto

---

## Resumo das opções de cobrança

| Situação                         | O que fazer                                                                 |
|----------------------------------|-----------------------------------------------------------------------------|
| Quero cobrar via PIX/Boleto/Cartão | Configurar Asaas + criar cobrança com "Enviar por Asaas"                    |
| Cobro fora (PIX manual, dinheiro) | Criar cobrança sem Asaas → quando receber, clicar em "Marcar como Pago"     |
| Aluno já me pagou                 | "Registrar pagamento recebido" → cria registro já como pago                 |

---

## Links úteis

- [Asaas – Criar conta](https://www.asaas.com/)
- [Asaas Sandbox (testes)](https://sandbox.asaas.com/)
- [Asaas – Chaves de API](https://docs.asaas.com/docs/chaves-de-api)

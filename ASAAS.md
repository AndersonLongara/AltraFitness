# Integração Asaas

Pagamentos e cobranças via **Asaas** (PIX, Boleto, Cartão): a **plataforma** cobra os **clientes (personal)** e cada **personal** pode cobrar os **alunos**.

## Fluxos

1. **Plataforma → Personal (SuperADM)**  
   O dono da plataforma cria cobranças em **Super Admin → Cobranças Plataforma**. A chave de API da plataforma é configurada em **Super Admin → Configurações → Integração Asaas** (ou via variável de ambiente). O valor cai na conta Asaas da plataforma.

2. **Personal → Alunos**  
   O personal configura a **própria chave Asaas** em **Configurações → Conta → Cobranças Asaas**. Ao criar uma cobrança em **Financeiro → Nova Cobrança**, pode marcar "Enviar cobrança por Asaas" e escolher PIX, Boleto ou Cartão. O valor cai na conta Asaas do personal.

## Configuração da plataforma (recomendado)

Em **Super Admin → Configurações** é possível configurar **tudo** pelo painel, sem mexer em .env:

- **Chave API**: chave da conta Asaas da plataforma (para cobrar os personais).
- **Ambiente**: Sandbox (testes) ou Produção.
- **Token do webhook**: opcional; se preenchido, o Asaas deve enviar esse valor no header `asaas-access-token`.

Os valores são salvos no banco (`platform_settings`). Se nada estiver configurado no painel, o sistema usa as variáveis de ambiente abaixo.

## Variáveis de ambiente (fallback)

- **`ASAAS_API_KEY`**: chave da conta Asaas da plataforma (usada se não houver valor no painel).
- **`ASAAS_SANDBOX`**: se `true`, usa sandbox; caso contrário, produção.
- **`ASAAS_WEBHOOK_TOKEN`**: token do webhook (usado se não houver valor no painel).

O personal **não** usa variável de ambiente: a chave dele é salva no banco (Configurações do trainer) e usada apenas nas cobranças que ele emite aos alunos.

## Webhook Asaas

Para atualizar automaticamente o status quando um pagamento for confirmado:

1. No painel Asaas (Integrações → Webhooks), cadastre a URL:
   - **Produção:** `https://seu-dominio.com/api/webhooks/asaas`
   - **Sandbox:** mesma URL do seu app (ex.: ngrok ou seu deploy de staging).

2. Eventos recomendados: **PAYMENT_RECEIVED**, **PAYMENT_CONFIRMED**.

3. O endpoint atualiza:
   - **Cobranças da plataforma** (`platform_charges`) → `status: paid`, `paidAt`
   - **Pagamentos personal → aluno** (`payments`) → `status: paid`, `paidAt`, `method: asaas`

## Migration

Após puxar o código, rode a migration para criar/atualizar tabelas e colunas Asaas:

```bash
npx drizzle-kit push
# ou
npx drizzle-kit migrate
```

## Segurança

- A chave do personal é armazenada em `trainers.asaas_api_key` e usada apenas em server actions autenticadas (sempre após `getCurrentTrainer()`).
- A chave da plataforma pode ser configurada no painel (Super Admin → Configurações) e fica em `platform_settings`; ou em variável de ambiente `ASAAS_API_KEY`. Apenas o Super Admin acessa a tela de configuração.
- O webhook `/api/webhooks/asaas` pode ser protegido pelo token configurado no painel ou por `ASAAS_WEBHOOK_TOKEN`; o Asaas envia esse token no header `asaas-access-token` quando configurado na URL do webhook.

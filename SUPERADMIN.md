# Painel Super Admin

O painel **SuperADM** permite ao dono da plataforma visualizar e gerenciar todos os **clientes (personal)**, **alunos**, **pagamentos** e **planos** em um único lugar.

**Níveis de permissão** (trainer, student, superadmin) são geridos **no nosso banco** (tabela `user_roles`), não no Clerk — assim dá para usar o plano gratuito do Clerk sem depender de metadata.

## Padrão de layout (margens e largura)

Todas as telas do Super Admin usam **o mesmo tamanho de margem nas laterais** e a mesma largura máxima de conteúdo. O padrão é aplicado no **layout** (`src/app/superadmin/layout.tsx`), para que nenhuma página precise repetir wrappers.

- **Container do conteúdo:** `max-w-6xl mx-auto` (largura máxima 72rem, centralizado).
- **Margens laterais:** `px-6` (mobile) e `md:px-8` (desktop).
- **Margens verticais:** `py-6 md:py-8`.
- **Espaçamento entre blocos:** `space-y-8` no container (ex.: entre header e conteúdo).
- **Espaço para a sidebar:** `pl-0 md:pl-24` no `<main>`, para não sobrepor o menu lateral; `pb-24` para folga na parte inferior.

As páginas (`page.tsx`) **não** devem incluir `<div>`, `<main>` ou `SuperAdminSidebar` — apenas o conteúdo (por exemplo `<header>` + listagem/formulário). O layout já fornece sidebar, main e o wrapper com as margens acima.

Ao criar uma nova tela em `/superadmin/*`, basta exportar o conteúdo da página; o layout aplica o padrão automaticamente.

### Listagem padrão (sem scroll horizontal)

Use o componente **`SuperAdminListing`** (`@/components/superadmin/SuperAdminListing`) para tabelas/listagens:

- **Desktop (md+):** tabela com `table-fixed` e `overflow-hidden` no container, para não gerar scroll horizontal na página.
- **Mobile:** cards empilhados (cada linha vira um card com label + valor), sem scroll horizontal.
- **Props:** `data`, `getRowKey`, `columns` (array de `{ id, label, render(row), hideOnCard? }`), `emptyMessage`, `toolbar?` (opcional).
- Colunas com `hideOnCard: true` não aparecem na vista em cards (mobile).
- Exemplos de uso: `/superadmin/charges`, `/superadmin/trainers`, `/superadmin/students`, `/superadmin/plans` (via `PlatformPlansManager`).

---

## Rotas

- **`/superadmin`** — Painel com totais (clientes, alunos, receita do mês, pagamentos)
- **`/superadmin/trainers`** — Lista de todos os clientes (personal/trainers)
- **`/superadmin/trainers/[id]`** — Detalhe do cliente (planos, últimos pagamentos)
- **`/superadmin/students`** — Lista de todos os alunos (filtro por cliente)
- **`/superadmin/charges`** — **Pagamentos à plataforma**: gestão dos pagamentos dos planos que os personais adquirem conosco (criar cobrança, listar, filtrar por cliente, ver link PIX/Boleto). Os personais pagam a plataforma; os alunos pagam os personais.
- **`/superadmin/payments`** — Redireciona para `/superadmin/charges`.
- **`/superadmin/plans`** — **Planos da plataforma**: CRUD dos planos que oferecemos aos personais (Free Starter, Mensal, Anual, etc.). Slug, nome, preço, duração, máx. alunos, preço por aluno, benefícios, IA, suporte prioritário, pipeline de vendas, trial em dias. Personais são vinculados ao plano pelo slug (`trainer.subscription_plan`). O componente **PlatformPlansManager** permite criar, editar, ativar/inativar e excluir planos; o slug não deve ser alterado se já houver personais vinculados.
- **`/superadmin/settings`** — Configurações: conta do Super Admin (logout) e integração Asaas (status da API, webhook, ambiente)

## Gestão de clientes, alunos e usuários

- **Clientes (personais)** — Em `/superadmin/trainers` e `/superadmin/trainers/[id]`: listagem e detalhe com **Inativar/Ativar** (altera `subscription_status` para `inactive`/`active`) e **Excluir cliente** (remove trainer, todos os alunos e dependentes, e conta no Clerk). A exclusão é em cascata (planos, pagamentos, cobranças, leads, treinos, nutrição, avaliações, etc.).
- **Alunos** — Em `/superadmin/students`: listagem com filtro por cliente; **Inativar/Ativar** (campo `active` do aluno) e **Excluir aluno** (remove todos os dados do aluno: treinos, nutrição, avaliações, pagamentos, etc.; não remove conta Clerk, pois aluno é identificado por e-mail).
- **Usuários** — Em `/superadmin/users`: listagem de todos os usuários (personais, alunos e superadmins) com **Excluir** por userId. Não é permitido excluir um superadmin por essa tela.

## Usuário superadmin padrão e redirecionamento

- **E-mail padrão:** O usuário **anderson.longara@gmail.com** é sempre considerado superadmin (código em `auth-helpers.ts`: `isSuperAdminEmail`). Não é obrigatório configurar variável de ambiente para esse e-mail — ao fazer login com essa conta, o sistema atribui role `superadmin` e redireciona para o painel admin.
- **Redirecionamento:** Após o login, `getRoleRedirectUrl()` envia superadmin para **`/superadmin`**. A página `/auth-redirect` (usada após sign-in/sign-up) usa essa URL. O superadmin acessa o painel onde pode gerenciar clientes, alunos, usuários e planos.
- **Outros superadmins:** É possível definir mais e-mails ou Clerk User IDs:
  - **Variável de ambiente:** `SUPERADMIN_EMAIL` (lista separada por vírgula). Ex.: `SUPERADMIN_EMAIL=admin@empresa.com,outro@empresa.com`.
  - **Tabela `user_roles`:** O script `npx tsx src/scripts/add-superadmin.ts <CLERK_USER_ID>` grava `role = 'superadmin'` para um Clerk User ID. O `getRole()` considera primeiro `user_roles` e depois `isSuperAdminEmail(email)`.

## Como ativar o Super Admin (via script, opcional)

O role pode ser guardado na **nossa tabela `user_roles`** (além do e-mail padrão acima).

1. Rode a migration do Drizzle para criar a tabela `user_roles` (se ainda não existir):
   ```bash
   npx drizzle-kit push
   # ou
   npx drizzle-kit migrate
   ```
2. Pegue o **Clerk User ID** do usuário que será dono (Clerk Dashboard → Users → abrir o usuário → copiar o **User ID**).
3. Defina esse usuário como superadmin:
   ```bash
   npx tsx src/scripts/add-superadmin.ts <CLERK_USER_ID>
   ```
   Exemplo: `npx tsx src/scripts/add-superadmin.ts user_2abc123...`

Ou por variável de ambiente:
   ```bash
   SUPERADMIN_USER_ID=user_2abc123... npx tsx src/scripts/add-superadmin.ts
   ```

4. Esse usuário, ao fazer login, será redirecionado para `/superadmin`.

**Importante:** Apenas quem tiver role `superadmin` (por `user_roles` ou por e-mail em `isSuperAdminEmail`) acessa `/superadmin/*`. Os demais são redirecionados.

## Gestão de roles (nosso banco)

- **Tabela:** `user_roles` (`user_id`, `role`, `updated_at`).
- **Roles:** `superadmin`, `trainer`, `student`.
- O **webhook** do Clerk (user.created / user.updated) grava `trainer` ou `student` em `user_roles` conforme o e-mail estar ou não em `students`. Não usa mais `publicMetadata` do Clerk.
- O **onboarding** grava o role escolhido em `user_roles` após o usuário completar o fluxo.
- **Superadmin** só é atribuído manualmente (script acima ou INSERT direto no banco).

## Segurança

- Todas as server actions em `src/app/actions/superadmin.ts` chamam `requireSuperAdmin()` antes de qualquer query.
- O layout de `/superadmin` usa `getRole()` (leitura em `user_roles`) e redireciona quem não for superadmin.

## Próximos passos (opcional)

- Bloquear login de cliente inativo (subscription_status = inactive) ou aluno inativo (active = false) no middleware ou em getRole
- Exportação de relatórios (CSV/Excel)
- Faturamento consolidado por período

# Plano Ouro de Componentização — AltraFitness

Documento de referência para a **estrutura alvo** de componentes e regras de organização. Aplicar **somente após** o build estar verde (`npm run build`) e as funcionalidades críticas validadas.

---

## 1. Objetivo

- **Uma única fonte de verdade** por componente (evitar duplicatas em `components/` e `components/features/`).
- **Imports previsíveis** para páginas e entre componentes.
- **Separação clara**: primitivos UI, layout, domínio (features).

---

## 2. Estrutura alvo de pastas

```
src/components/
├── ui/                    # Primitivos (shadcn, Button, Input, Card, Dialog, etc.)
│   ├── README.md          # Regras: sem domínio, sem DB
│   └── index.ts           # Re-exports públicos
├── layout/                # Layouts globais (sidebar, nav)
│   ├── LayoutSidebar.tsx       # Dashboard personal
│   ├── LayoutStudentBottomNav.tsx
│   ├── LayoutStudentSidebar.tsx
│   ├── LayoutSuperAdminSidebar.tsx
│   └── index.ts
├── auth/                  # Autenticação (SignOutButtonSafe, etc.)
├── features/              # Componentes por domínio (fonte de verdade)
│   ├── dashboard/
│   ├── settings/
│   ├── financial/
│   ├── nutrition/        # ou trainer/diet conforme convenção
│   ├── students/
│   ├── student/          # área do aluno
│   ├── workouts/
│   ├── forms/
│   ├── sales/
│   ├── superadmin/
│   └── ...
└── [reexports opcionais]  # components/dashboard/, financial/, etc. → apontam para features/
```

---

## 3. Regras de ouro

### 3.1 Onde cada tipo de componente fica

| Tipo | Pasta | Exemplo | Regra |
|------|--------|---------|--------|
| Primitivo (sem domínio) | `ui/` | Button, Input, Card, Dialog | Zero conhecimento de negócio/DB. Adicionar via `npx shadcn@latest add [nome]` quando possível. |
| Layout (shell, nav, sidebar) | `layout/` | LayoutSidebar, StudentBottomNav | Apenas estrutura e navegação; podem conhecer roles (trainer/student/superadmin). |
| Feature (domínio) | `features/<domínio>/` | PaymentsList, SettingsContent, OnboardingChecklist | Conhecem actions, tipos e UI do domínio. Uma única implementação em `features/`. |

### 3.2 Convenção de imports nas páginas

- **Opção recomendada:** Páginas importam direto de `@/components/features/<domínio>/<Componente>` para componentes de domínio.
- **Alternativa:** Manter re-exports em `@/components/dashboard/`, `@/components/financial/`, etc., que apenas fazem `export { default } from "@/components/features/..."`. Nesse caso, manter um script (ex.: `create-reexports.js`) e garantir que cada re-export existe e aponta para o arquivo correto em `features/`.

### 3.3 Layout do dashboard

- **Todas** as páginas do dashboard (incl. nutrição, treinos, alunos, financeiro, configurações, vendas) usam **LayoutSidebar** de `@/components/layout/LayoutSidebar` (ou via `layout/index.ts`). Não usar o antigo `Sidebar` para novas páginas.

### 3.4 Evitar duplicatas

- Não ter dois arquivos que implementam o mesmo componente (ex.: `PaymentsList` em `financial/` e em `features/financial/` com lógicas diferentes). Definir **uma** implementação em `features/financial/PaymentsList.tsx` e, se necessário, um re-export em `components/financial/PaymentsList.tsx`.
- Ao criar um componente novo de domínio, criar em `features/<domínio>/`; não criar em `components/<domínio>/` a menos que seja apenas um re-export.

### 3.5 Nomenclatura

- Componentes: PascalCase.
- Pastas de domínio: minúsculo, singular ou plural conforme o domínio (e.g. `settings`, `financial`, `students`).
- Arquivos de componente: PascalCase ou kebab-case conforme padrão do projeto (ex.: `PaymentsList.tsx`, `LayoutSidebar.tsx`).

---

## 4. Fases de aplicação (ordem segura)

Aplicar em ordem; após cada fase, rodar `npm run build` e validar as rotas afetadas.

| Fase | Ação | Verificação |
|------|------|-------------|
| **1** | Unificar layout: garantir que todas as páginas do dashboard importam `LayoutSidebar` de `@/components/layout/`. Nenhuma página usa `Sidebar` antigo. | Build + abrir cada página do dashboard. |
| **2** | Definir convenção de imports: escolher "só features" ou "features + re-exports". Se re-exports, criar/atualizar script e arquivos de re-export para os componentes usados pelas páginas. | Build + nenhum import quebrado. |
| **3** | Eliminar duplicatas: para cada par (ex.: `financial/PaymentsList.tsx` e `features/financial/PaymentsList.tsx`), manter uma implementação em `features/` e o outro arquivo como re-export ou remover e atualizar imports. | Build + testes manuais nas telas de financeiro. |
| **4** | Replicar para outros domínios: settings, nutrition, students, workouts, forms, sales, student (área do aluno), superadmin. Um domínio por vez. | Build após cada domínio. |
| **5** | Documentar e travar: atualizar este plano com quais re-exports existem (se houver) e garantir README em `ui/` e, se útil, um índice em `layout/`. | Build final + checklist de rotas. |

---

## 5. Checklist pré-componentização (já atendido antes de começar)

- [x] `npm run build` passa sem erros.
- [ ] Testes críticos passando (`npm run test`), se houver.
- [ ] Nenhuma alteração em andamento que quebre imports (branch estável).

---

## 6. Referências

- **PLANO-REVISAO-APLICACAO.md** — lista de correções e melhorias pós-componentização; usar em paralelo para não regredir segurança ou comportamento.
- **src/components/ui/README.md** — regras dos primitivos UI (shadcn, sem domínio).
- **scripts/create-reexports.js** — se a opção de re-exports for mantida, manter este script alinhado aos arquivos em `features/`.

---

*Documento criado como plano ouro de componentização. Desenvolver a componentização somente com build e contexto ok.*

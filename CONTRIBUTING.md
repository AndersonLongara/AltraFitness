# Contribuindo (AltraFitness)

## Estrutura de pastas

- **`src/app/`** — Rotas, layouts e Server Components. Mantenha páginas como Server Components (async, fetch/actions no próprio componente).
- **`src/components/ui/`** — Primitivos de interface (shadcn: Button, Input, Card, Dialog). Sem lógica de domínio.
- **`src/components/features/<dominio>/`** — Componentes por funcionalidade (superadmin, settings, auth, workouts, students, nutrition, sales, financial, dashboard, etc.).
- **`src/components/layout/`** — Shells de página: sidebars, bottom nav (LayoutSidebar, LayoutStudentSidebar, etc.).
- **`src/shared/`** — Hooks (`shared/hooks/`), tipos (`shared/types/`) e stores Zustand (`shared/stores/`). Convenção: stores leves por contexto (ex.: `useWorkoutRunnerStore`, `useUIStore`).
- **`src/lib/`** — DB, auth-helpers, asaas, utils (cn).
- **`src/app/actions/`** — Server Actions (manter).

## Server vs Client

- **Padrão: Server Component.** Novos componentes são Server; use "use client" apenas onde precisar de estado, eventos ou browser APIs.
- **Client na folha.** Se uma página for em grande parte estática e só um bloco for interativo, extraia apenas esse bloco para um Client Component em features e mantenha o resto em Server.
- **Exemplo:** Página de listagem Server que busca dados e renderiza um FeatureListingClient; o client cuida de filtros e ações.

## Compound components

- Use composição onde reduzir props e melhorar leitura. Ex.: Card com CardHeader, CardContent, CardFooter (ui/card.tsx).
- Novos primitivos: adicione via npx shadcn@latest add e mantenha em components/ui/.

## Estado e cache

- **Zustand:** Para estado de UI ou fluxo (sidebar, workout em execução), use stores em `src/shared/stores/`. Evite prop drilling; prefira store quando o estado for usado em vários níveis.
- **TanStack Query:** Para listagens e detalhes que fazem fetch no client ou precisam de refetch/invalidação, use `useQuery` e `useMutation`. O `QueryClientProvider` está no layout raiz; prefira Server Components para carga inicial e use Query no client para refetch e mutações que invalidam cache.

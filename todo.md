# TODO - AltraFit (Roadmap to MVP)

## 📌 Phase 1: Foundation & Setup
- [x] **Project Init**
    - [x] `create-next-app` (TypeScript, Tailwind, Eslint)
    - [x] Configurar `tailwind.config.ts` com **AltraHub Design DNA** (Cores, Fontes, Radius)
    - [x] Instalar Shadcn/UI e componentes base (Button, Card, Input)
- [x] **Database & ORM**
    - [x] Configurar Turso (SQLite) - *Modo Offline ativado*
    - [x] Configurar Drizzle ORM
    - [x] Criar Schema Inicial (`trainers`, `students`, `exercises`, `workouts`)
- [x] **Authentication**
    - [x] Configurar Clerk (Next.js Middleware)
    - [x] Criar páginas de Sign-in/Sign-up customizadas
    - [x] Sincronizar Webhook do Clerk com tabela `trainers` (Endpoint criado)

## 👥 Phase 2: CRM & Dashboard (Bento Grid)
- [x] **Layout Shell**
    - [x] Criar Sidebar Responsiva (Mobile First)
    - [x] Criar Topbar com UserProfile e Header dinâmico
- [x] **Dashboard Home**
    - [x] Criar Bento Grid Layout
    - [x] Componente: Métricas Rápidas (Alunos Ativos, Receita Real via SQL)
    - [x] Componente: Lista de Vencimentos Próximos (Query real)
- [x] **Gestão de Alunos**
    - [x] CRUD de Alunos (Criar, Editar, Listar via DB)
    - [x] Perfil do Aluno (Histórico, Metas, XP)
- [x] **Gestão Financeira**
    - [x] Cadastro de Planos (Mensal, Trimestral, Anual)
    - [x] Controle de Pagamentos (Status real)
    - [x] Lista de Assinaturas e Renovações vinculadas ao DB

## 💪 Phase 3: Workout Engine
- [x] **Biblioteca de Exercícios**
    - [x] CRUD de Exercícios (Schema e DB)
    - [x] UI: Listagem, Filtros e Categorias reais
    - [x] Seed inicial de exercícios básicos
- [x] **Prescrição de Treinos**
    - [x] Builder de Treino (Lista dinâmica conectada ao DB)
    - [x] UI: Seleção de Exercícios (Modal com busca real)
    - [x] Integração completa com Biblioteca
    - [x] Lógica de Sets, Reps, RPE e Descanso salva no banco
    - [x] Atribuição de Treino ao Aluno
- [x] **Área do Aluno (App View)**
    - [x] Visualização do Treino do Dia (Dados reais)
    - [x] Input de Cargas (Log de Treino funcional)
    - [x] Timer de Descanso integrado

## 🍎 Phase 4: Nutrition Module
- [x] **Calculadora de Macros**
    - [x] Implementar fórmulas (`Prot = 2.0 * weight`, etc.)
    - [x] Ajuste manual de metas calóricas
- [x] **Cardápios**
    - [x] Editor de Refeições (Builder dinâmico com DB)
    - [x] Área do Aluno: Visualização da Dieta real (NutritionViewer)

## 🤖 Phase 5: Intelligence & Gamification
- [x] **AI Manager**
    - [x] Integração com Vercel AI SDK
    - [x] Widget de Chat interativo no Dashboard
- [x] **Gamification**
    - [x] Sistema de XP funcional por conclusão de treinos
    - [x] Badges visuais integrados ao perfil

## 🚀 Phase 6: Polish & Production
- [x] **Mock Removal**
    - [x] Substituídos todos os mocks por queries reais (Drizzle)
    - [x] Conversão de hubs para Server Components
- [x] **QA & Design Review**
    - [x] Verificação de Tradução (PT-BR em toda a UI)
    - [x] Responsividade Mobile (Dashboard, Financeiro, Treinos)
- [ ] **Deploy**
    - [ ] Deploy na Vercel (Produção)

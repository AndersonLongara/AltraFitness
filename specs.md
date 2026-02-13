# Technical Specifications - AltraFit

## 1. Visão Geral e Objetivos
O **AltraFit** é uma plataforma SaaS (Software as a Service) de gestão 360º para Personal Trainers e nutricionistas, focada em produtividade para o profissional e gamificação para o aluno.
- **Propósito:** Superar a experiência de usuário de concorrentes como o Treino.io através de automação e IA.
- **Público-alvo:** Profissionais de educação física e nutrição que buscam escala e uma interface profissional.
- **Diferencial AltraHub:** Design neoclássico moderno, rigor matemático de 8pt e agentes de IA integrados.

## 2. Arquitetura Técnica (Stack Consolidada)
A escolha de tecnologias foca em Developer Experience (DX) e latência mínima.

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+ (App Router)** | Uso de Server Actions para agilidade. |
| **Linguagem** | **TypeScript 5.x** | Uso obrigatório de modo estrito (Strict Mode). |
| **Estilização** | **Tailwind CSS + Shadcn/UI** | Configurados no rigor do Grid de 8pt. |
| **Autenticação** | **Clerk** | Interface customizada via hooks (`useUser`). |
| **Banco de Dados** | **Turso (SQLite Distribuído)** | Alta performance na edge. |
| **ORM** | **Drizzle ORM** | Type-safe e migrations leves. |
| **Iconografia** | **Phosphor Icons** | Estilo: Duotone para Soft UI. |

## 3. Design System & UX (AltraHub DNA)
A interface deve seguir rigorosamente o arquivo `DESIGN_SYSTEM.md` do projeto.
- **Tipografia:** Plus Jakarta Sans (Alta altura-x para leitura rápida).
- **Grid:** Escala fixa de 8pt para todos os espaçamentos e ritmos verticais.
- **Layout:** Bento Grid para dashboards, organizando dados financeiros e de performance.
- **Cores:** Fundo Ice White (#F8F9FA), Cards Brancos, e Destaque em Performance Green (#2ECC71).
- **Arredondamento:** Containers com 24px ou 32px (`rounded-3xl` / `rounded-[2rem]`).

## 4. Módulos do Sistema (MVP)
### 4.1. Gestão de Alunos (CRM)
- Dashboard com visão de "Alunos Ativos", "Novas Matrículas" e "Vencimentos".
- Próximos vencimentos organizados em Bento Cards.

### 4.2. Prescrição de Treinos Dinâmica
- Biblioteca de exercícios com suporte a vídeos e instruções.
- Montagem de treinos com lógica de volume semanal automática.

### 4.3. Planejamento Alimentar (Nutrition)
- Cálculo automático de Macronutrientes baseado no peso e objetivo do aluno.
- Geração de cardápios PDF e visualização no app do aluno.

### 4.4. AI Manager (AltraHub Intelligence)
- Card exclusivo em **Dark Navy (#0D1117)**.
- Geração de insights sobre evasão de alunos e sugestão de progressão de carga.

## 5. Estrutura de Dados Inicial (Drizzle Schema)
O banco deve ser modelado para **Multi-tenancy**, isolando os dados por treinador.
- **trainers:** Tabela mestre (ID, nome, branding, clerk_id).
- **students:** Vinculados a um `trainer_id`.
- **workouts:** Planos de treino com data de expiração.
- **diets:** Planos nutricionais e metas de calorias.

## 6. Regras de Qualidade e Segurança
- **Acessibilidade:** Conformidade com normas WCAG para leitura em ambientes de alta luminosidade (academia).
- **Segurança:** Variáveis de ambiente protegidas (`.env`) e isolamento de dados via filtros de tenant no ORM.
- **Rigor:** Proibido o uso de `any` ou hexadecimais fora da paleta AltraFit.

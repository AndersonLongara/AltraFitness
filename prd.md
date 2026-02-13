# Product Requirements Document (PRD) - AltraFitness

## 1. Project Overview
**Product Name:** AltraFit
**Description:** Uma plataforma SaaS 360º de alta performance para Personal Trainers e academias, focada na gestão completa do ecossistema fitness (Treino, Nutrição e Financeiro) com uma interface gamificada e inteligência de dados.
**Target Audience:** Personal Trainers que buscam escala no atendimento, gestores de estúdios/academias e alunos que desejam uma experiência de treino moderna e intuitiva.

## 2. Goals & Objectives
- **Experiência Superior:** Superar a UX de concorrentes (como Treino.io) através de um design Neoclassical Modern e fluxo de navegação otimizado.
- **Retenção via Gamificação:** Aumentar o engajamento do aluno através de sistemas de XP e trilhas de evolução visual.
- **Escalabilidade SaaS:** Permitir que um único treinador gerencie centenas de alunos de forma organizada e automatizada.
- **Inteligência Preditiva:** Utilizar o *AI Manager* para prever evasão de alunos e sugerir ajustes de carga automáticos.

## 3. User Stories
### User Role: Personal Trainer (Admin)
- [ ] Como treinador, quero prescrever treinos dinâmicos para que meus alunos tenham clareza na execução.
- [ ] Como treinador, quero visualizar o fluxo financeiro e vencimentos em um Bento Grid para manter a saúde do meu negócio.
- [ ] Como treinador, quero gerar planos alimentares baseados nos macros dos alunos de forma automatizada.

### User Role: Aluno (Member)
- [ ] Como aluno, quero registrar minhas cargas de treino para visualizar minha evolução em gráficos de performance.
- [ ] Como aluno, quero receber notificações de novos treinos e dietas diretamente no meu dispositivo móvel.
- [ ] Como aluno, quero ganhar conquistas (badges) por consistência para me manter motivado no plano.

## 4. Functional Requirements
- **Authentication:** Implementação via **Clerk** com interface totalmente customizada seguindo o *Design DNA* da AltraHub.
- **Dashboard Bento:** Visualização modular de métricas (Alunos Ativos, Faturamento, Frequência Semanal).
- **Workout Engine:** Biblioteca de exercícios com suporte a mídia e lógica de periodização.
- **Nutrition Module:** Calculadora de macronutrientes integrada utilizando fórmulas dinâmicas:
  - $Prot = 2.0 \times weight$
  - $Fats = 0.8 \times weight$
- **AI Manager:** Card exclusivo para análise inteligente de dados e geração de insights preditivos.

## 5. Non-Functional Requirements
- **Performance:** Resposta de API inferior a $200ms$ e otimização total para PWA (Progressive Web App).
- **Design:** **AltraHub Design DNA V2.0** (Estética Soft UI, Rigor de 8pt, fonte Plus Jakarta Sans e paleta *Performance Green* `#2ECC71`).
- **Scalability:** Arquitetura baseada em **Next.js 14** e **Turso** para suporte a múltiplos tenants com latência mínima.
- **Language:** Interface e comunicação em **PT-BR**; Código e documentação técnica em **Inglês**.

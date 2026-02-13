# Design System - AltraFitness
Based on **AltraHub Design DNA v2.0 - Performance Specs**

## 1. Fundamentos e Grade (8pt Grid Rigoroso)
A estrutura visual é governada por uma escala matemática rigorosa, garantindo harmonia e escalabilidade.
- **Unidade Base:** `8px` ($8px$).
- **Escala de Espaçamento:** Toda e qualquer margem, preenchimento (padding) ou lacuna (gap) deve ser múltiplo de 8 ($8, 16, 24, 32, 40, 48, 56, 64$).
- **Gutter (Bento Grid):** Fixado em $24px$ (`gap-6`) para criar o "respiro" característico do design profissional.
- **Ritmo Vertical:** O line-height de todos os textos deve ser ajustado para múltiplos de 8 para alinhar perfeitamente à grade.

## 2. Tipografia: Plus Jakarta Sans
Escolhida por sua geometria moderna, alta altura-x e excelente legibilidade em dispositivos móveis no ambiente de treino.
- **H1 (Títulos Principais):** `32px` | Weight: 800 (ExtraBold) | Line-height: `40px` | Letter-spacing: -0.02em.
- **H2 (Títulos de Cards):** `24px` | Weight: 700 (Bold) | Line-height: `32px`.
- **Body (Corpo):** `16px` | Weight: 500 (Medium) | Line-height: `24px`.
- **Caption (Micro-copy):** `12px` | Weight: 400 (Regular) | Line-height: `16px`.

## 3. Paleta de Cores (Performance & Soft UI)
A paleta evita o preto puro (`#000`) para manter a sofisticação e reduzir a fadiga visual.

| Elemento | Nome | Hex | Uso |
| :--- | :--- | :--- | :--- |
| **Primária** | Performance Green | `#2ECC71` | CTAs, indicadores de progresso e sucesso. |
| **Fundo** | Ice White | `#F8F9FA` | Cor do canvas (fundo geral). |
| **Superfície** | Pure White | `#FFFFFF` | Fundo dos cards do Bento Grid. |
| **Destaque AI** | Graphite Dark | `#2C3E50` | Card do "AI Manager" (Dashboard/Vendas). |
| **Texto** | Graphite Dark | `#2C3E50` | Títulos e textos de alta hierarquia. |

## 4. Linguagem Visual e Componentes
A interface segue os princípios da AltraHub de design limpo e intuitivo.

### Bento Grid Layout
- Informações organizadas em blocos modulares com bordas ultra-arredondadas.
- **Priorização de dados:** As métricas mais importantes ocupam cards maiores.

### Hierarquia de Bordas (Radius)
- **Bento Cards / Containers:** `24px` ou `32px` (`rounded-3xl` / `rounded-[2rem]`).
- **Botões e Inputs:** `12px` ou `16px` (`rounded-xl` / `rounded-2xl`).

### Iconografia (Phosphor Icons)
- **Estilo:** Duotone.
- **Aplicação:** Cor principal em `#2C3E50` com preenchimento translúcido em $10\%$ de opacidade na cor do ícone.

### Soft UI Elevation
- **Sem sombras pesadas.** Use um box-shadow sutil: `rgba(0, 0, 0, 0.03)` com $20px$ de desfoque (blur).

## 5. Regras de Ouro para o Agente (Antigravity)
1. **Zero Alucinação:** Se um valor de espaçamento não for múltiplo de 8, a tarefa será invalidada.
2. **Acessibilidade (A11y):** Garantir contraste adequado entre o texto Graphite Dark e o fundo Ice White.
3. **Mobile First:** Como o usuário (aluno) está na academia, todos os componentes devem ser testados para toque e leitura rápida.

## 6. Componentes Globais

### Alertas e Diálogos (`ConfirmationModal`)
Padronização de mensagens de confirmação e alertas do sistema. Substitui o uso de `window.confirm` e `window.alert`.

- **Local:** `src/components/ui/ConfirmationModal.tsx`
- **Variantes:**
  - `danger`: Ações destrutivas (ex: Excluir). Ícone vermelho/trash.
  - `warning`: Avisos importantes. Ícone amarelo/warning.
  - `info`: Informações gerais. Ícone azul/info.
  - `success`: Confirmações de sucesso. Ícone verde/check.
- **Uso:**
  ```tsx
  <ConfirmationModal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    onConfirm={handleAction}
    title="Tem certeza?"
    description="Esta ação não pode ser desfeita."
    variant="danger"
    confirmText="Sim, excluir"
    cancelText="Cancelar"
  />
  ```

# Componentes UI (Primitivos)

Esta pasta contém os **primitivos de interface** do projeto. A base é [shadcn/ui](https://ui.shadcn.com).

## Regras

- **Novos primitivos** (Select, Label, etc.) devem ser adicionados via CLI do shadcn e ficar em `ui/`:
  ```bash
  npx shadcn@latest add [component-name]
  ```
- Componentes em `ui/` **não** têm conhecimento de domínio nem de banco de dados.
- Use sempre os componentes desta pasta como base; evite usar diretamente `@radix-ui/*` ou `radix-ui` em features.

## Componentes atuais

- **Button**, **Input**, **Card**, **Dialog** – shadcn
- **ConfirmationModal** – wrapper do Dialog com API de confirmação (isOpen, onClose, onConfirm, title, description, variant)
- **BackButton** – botão de voltar (wrapper do Button com ícone + Link ou router.back())

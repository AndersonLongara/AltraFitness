---
description: Padrão para tabelas responsivas - converte tabelas em cards no mobile
---

# Responsive Table → Cards Pattern

## Regra de Ouro
**NUNCA** use `overflow-x-auto` como solução para tabelas no mobile. Sempre converta para **cards empilhados**.

## Estrutura

```tsx
{/* Mobile Cards — visível apenas no mobile */}
<div className="md:hidden divide-y divide-slate-50">
    {items.map(item => (
        <div key={item.id} className="flex items-center gap-4 p-4">
            {/* Lado esquerdo: Info principal */}
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-700 text-sm truncate">
                    {item.name}
                </h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Status badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                        <Icon weight="fill" size={10} /> Status
                    </span>
                    {/* Metadados secundários */}
                    <span className="text-xs text-slate-400">Info extra</span>
                </div>
            </div>
            {/* Lado direito: Valor/Ação */}
            <div className="text-right shrink-0">
                <span className="font-mono font-bold text-sm text-slate-700">R$ 100</span>
            </div>
        </div>
    ))}
</div>

{/* Desktop Table — visível apenas no desktop */}
<div className="hidden md:block">
    <table className="w-full text-left border-collapse">
        {/* ... tabela normal ... */}
    </table>
</div>
```

## Regras do Card Mobile

| Elemento | Classe |
|---|---|
| Container | `md:hidden divide-y divide-slate-50` |
| Card row | `flex items-center gap-4 p-4` |
| Nome/Título | `font-bold text-slate-700 text-sm truncate` |
| Status badge | `text-[10px] font-bold px-2 py-0.5 rounded-full` |
| Info secundária | `text-xs text-slate-400` |
| Valor/Ação (direita) | `text-right shrink-0` |
| Ícone no badge | `size={10} weight="fill"` |

## Regras do Desktop Table

| Elemento | Classe |
|---|---|
| Container | `hidden md:block` (com `overflow-x-auto` como fallback) |
| Tabela | `w-full text-left border-collapse` |

## Checklist
- [ ] Usar `min-w-0` no container de texto para `truncate` funcionar
- [ ] Usar `shrink-0` em avatares e valores laterais
- [ ] Usar `flex-wrap` no container de badges/metadados
- [ ] Botões de ação visíveis no mobile (sem `opacity-0 group-hover`)
- [ ] Ícones menores no mobile (`size={16}` vs `size={18}` desktop)

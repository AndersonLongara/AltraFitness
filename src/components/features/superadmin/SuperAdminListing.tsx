"use client";

import { ReactNode } from "react";

export type SuperAdminListingColumn<T> = {
  id: string;
  label: string;
  /** Ocultar esta coluna na vista em cards (mobile/compacta). Default false */
  hideOnCard?: boolean;
  render: (row: T) => ReactNode;
};

type SuperAdminListingProps<T> = {
  /** Dados da listagem */
  data: T[];
  /** Chave única por linha */
  getRowKey: (row: T) => string;
  /** Colunas: id, label, opcional hideOnCard, render(row) */
  columns: SuperAdminListingColumn<T>[];
  /** Mensagem quando data.length === 0 */
  emptyMessage: string;
  /** Conteúdo opcional acima da listagem (ex.: botão "Novo plano") */
  toolbar?: ReactNode;
};

const TH_CLASS = "px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider";
const TD_CLASS = "px-6 py-4 text-slate-700 dark:text-slate-200 text-sm";

/**
 * Listagem padrão do Super Admin: tabela em telas médias/grandes,
 * cards empilhados em telas pequenas — sem scroll horizontal.
 */
export default function SuperAdminListing<T>({
  data,
  getRowKey,
  columns,
  emptyMessage,
  toolbar,
}: SuperAdminListingProps<T>) {
  const visibleColumns = columns.filter((c) => !c.hideOnCard);

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        {toolbar}
        <div className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toolbar}

      <div className="bg-white dark:bg-[#1E2A36] rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
        {/* Tabela: visível a partir de md, sem overflow para evitar scroll horizontal */}
        <div className="hidden md:block overflow-hidden">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-white/5">
                {columns.map((col) => (
                  <th key={col.id} className={`${TH_CLASS} min-w-0`}>
                    <span className="block truncate">{col.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={getRowKey(row)} className="border-b border-slate-100 dark:border-white/10 hover:bg-slate-50/50 dark:hover:bg-white/5">
                  {columns.map((col) => (
                    <td key={col.id} className={`${TD_CLASS} min-w-0 align-top`}>
                      <div className="min-w-0 break-words">{col.render(row)}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards: visíveis em telas pequenas, sem scroll horizontal */}
        <ul className="md:hidden divide-y divide-slate-100 dark:divide-white/10">
          {data.map((row) => (
            <li key={getRowKey(row)} className="p-4 hover:bg-slate-50/50 dark:hover:bg-white/5">
              <div className="space-y-3">
                {visibleColumns.map((col) => (
                  <div key={col.id} className="flex flex-col gap-0.5 min-w-0">
                    {col.label ? (
                      <>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{col.label}</span>
                        <div className="min-w-0 text-slate-800 dark:text-slate-200">{col.render(row)}</div>
                      </>
                    ) : (
                      <div className="min-w-0">{col.render(row)}</div>
                    )}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

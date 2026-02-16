"use client";

import { useState, useRef, useEffect } from "react";
import {
  createPlatformPlan,
  updatePlatformPlan,
  deletePlatformPlan,
} from "@/app/actions/superadmin";
import { Pencil, Trash, Plus, DotsThreeVertical } from "@phosphor-icons/react";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import SuperAdminListing from "./SuperAdminListing";
import type { SuperAdminListingColumn } from "./SuperAdminListing";

type Plan = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  durationMonths: number;
  maxStudents: number | null;
  pricePerStudentCents: number | null;
  features: string[] | null;
  hasAi: boolean | null;
  hasPriority: boolean | null;
  hasSalesPipeline: boolean | null;
  trialDays: number | null;
  active: boolean | null;
  sortOrder: number | null;
  trainersCount: number;
};

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function PlatformPlansManager({ initialPlans }: { initialPlans: Plan[] }) {
  const [plans, setPlans] = useState(initialPlans);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [durationMonths, setDurationMonths] = useState("1");
  const [maxStudents, setMaxStudents] = useState("");
  const [pricePerStudentCents, setPricePerStudentCents] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [hasAi, setHasAi] = useState(false);
  const [hasPriority, setHasPriority] = useState(false);
  const [hasSalesPipeline, setHasSalesPipeline] = useState(false);
  const [trialDays, setTrialDays] = useState(0);
  const [active, setActive] = useState(true);

  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<Plan | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; description: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openMenuId === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  const resetForm = () => {
    setEditing(null);
    setSlug("");
    setName("");
    setPriceCents("");
    setDurationMonths("1");
    setMaxStudents("");
    setPricePerStudentCents("");
    setFeaturesText("");
    setHasAi(false);
    setHasPriority(false);
    setHasSalesPipeline(false);
    setTrialDays(0);
    setActive(true);
    setError(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setSlug(plan.slug);
    setName(plan.name);
    // Exibir preço em reais (R$), não em centavos
    setPriceCents(plan.priceCents === 0 ? "0" : (plan.priceCents / 100).toFixed(2).replace(".", ","));
    setDurationMonths(String(plan.durationMonths));
    setMaxStudents(plan.maxStudents == null ? "" : String(plan.maxStudents));
    setPricePerStudentCents(plan.pricePerStudentCents == null || plan.pricePerStudentCents === 0 ? "" : String(plan.pricePerStudentCents / 100));
    setFeaturesText((plan.features ?? []).join("\n"));
    setHasAi(!!plan.hasAi);
    setHasPriority(!!plan.hasPriority);
    setHasSalesPipeline(!!plan.hasSalesPipeline);
    setTrialDays(plan.trialDays ?? 0);
    setActive(plan.active ?? true);
    setError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const price = Math.round(parseFloat(priceCents.replace(",", ".")) * 100) || 0;
    const duration = parseInt(durationMonths, 10) || 1;
    const max = maxStudents.trim() ? parseInt(maxStudents, 10) : null;
    const perStudent = pricePerStudentCents.trim() ? Math.round(parseFloat(pricePerStudentCents.replace(",", ".")) * 100) : null;
    const features = featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (price === 0 && (max == null || max < 1)) {
      setError("Plano gratuito exige definir o máximo de alunos permitidos (ex: 5).");
      setLoading(false);
      return;
    }

    try {
      if (editing) {
        await updatePlatformPlan(editing.id, {
          name,
          priceCents: price,
          durationMonths: duration,
          maxStudents: max,
          pricePerStudentCents: perStudent ?? undefined,
          features,
          hasAi,
          hasPriority,
          hasSalesPipeline,
          trialDays: trialDays > 0 ? trialDays : null,
          active,
        });
        setPlans((prev) =>
          prev.map((p) =>
            p.id === editing.id
              ? {
                  ...p,
                  name,
                  priceCents: price,
                  durationMonths: duration,
                  maxStudents: max,
                  pricePerStudentCents: perStudent ?? null,
                  features,
                  hasAi,
                  hasPriority,
                  hasSalesPipeline,
                  trialDays: trialDays > 0 ? trialDays : null,
                  active,
                }
              : p
          )
        );
      } else {
        await createPlatformPlan({
          slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "_"),
          name,
          priceCents: price,
          durationMonths: duration,
          maxStudents: max ?? undefined,
          pricePerStudentCents: perStudent ?? undefined,
          features,
          hasAi,
          hasPriority,
          hasSalesPipeline,
          trialDays: trialDays > 0 ? trialDays : null,
        });
        window.location.reload();
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (plan: Plan) => {
    if (plan.trainersCount > 0) {
      setAlertModal({
        title: "Não é possível excluir",
        description: "Há personais usando este plano. Altere a assinatura deles antes de excluir.",
      });
      return;
    }
    setDeleteConfirmPlan(plan);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmPlan) return;
    setLoading(true);
    try {
      await deletePlatformPlan(deleteConfirmPlan.id);
      setPlans((prev) => prev.filter((p) => p.id !== deleteConfirmPlan.id));
      setDeleteConfirmPlan(null);
    } catch (err) {
      setAlertModal({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Erro ao excluir o plano.",
      });
      setDeleteConfirmPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    setLoading(true);
    try {
      await updatePlatformPlan(plan.id, { active: !plan.active });
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, active: !p.active } : p))
      );
    } catch (err) {
      setAlertModal({
        title: "Erro ao atualizar",
        description: err instanceof Error ? err.message : "Erro ao atualizar o plano.",
      });
    } finally {
      setLoading(false);
    }
  };

  const planColumns: SuperAdminListingColumn<Plan>[] = [
    { id: "slug", label: "Slug", render: (p) => <span className="font-mono text-sm text-slate-700 dark:text-slate-200">{p.slug}</span>, hideOnCard: true },
    { id: "name", label: "Nome", render: (p) => <span className="font-medium text-slate-900 dark:text-white">{p.name}</span> },
    { id: "price", label: "Preço", render: (p) => <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(p.priceCents)}</span> },
    { id: "perStudent", label: "Por aluno", render: (p) => <span className="text-slate-600 dark:text-slate-300">{p.pricePerStudentCents != null && p.pricePerStudentCents > 0 ? formatPrice(p.pricePerStudentCents) + "/aluno" : "—"}</span>, hideOnCard: true },
    { id: "duration", label: "Duração", render: (p) => <span className="text-slate-600 dark:text-slate-300">{p.durationMonths === 0 ? "Trial/avulso" : `${p.durationMonths} mês(es)`}{p.trialDays ? ` · ${p.trialDays}d trial` : ""}</span> },
    { id: "maxStudents", label: "Alunos máx.", render: (p) => <span className="text-slate-600 dark:text-slate-300">{p.maxStudents == null ? "Ilimitado" : String(p.maxStudents)}</span> },
    { id: "aiPriority", label: "IA / Prior. / Vendas", render: (p) => <span className="text-slate-600 dark:text-slate-300">{p.hasAi ? "Sim" : "—"} / {p.hasPriority ? "Sim" : "—"} / {p.hasSalesPipeline ? "Sim" : "—"}</span>, hideOnCard: true },
    { id: "trainersCount", label: "Personais", render: (p) => <span className="text-slate-600 dark:text-slate-300">{p.trainersCount}</span> },
    { id: "status", label: "Status", render: (p) => <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${p.active ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-white/15 text-slate-600 dark:text-slate-200"}`}>{p.active ? "Ativo" : "Inativo"}</span> },
    {
      id: "actions",
      label: "Ações",
      render: (p) => (
        <div className="relative inline-block" ref={openMenuId === p.id ? menuRef : undefined}>
          <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white" title="Ações" aria-expanded={openMenuId === p.id} aria-haspopup="true">
            <DotsThreeVertical size={20} weight="bold" />
          </button>
          {openMenuId === p.id && (
            <div className="absolute right-0 top-full mt-1 z-10 min-w-[10rem] py-1 bg-white dark:bg-[#1E2A36] rounded-xl border border-slate-200 dark:border-white/10 shadow-lg" role="menu">
              <button type="button" role="menuitem" onClick={() => { setOpenMenuId(null); openEdit(p); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10">
                <Pencil size={18} weight="bold" className="text-slate-500 dark:text-slate-400" /> Editar
              </button>
              <button type="button" role="menuitem" onClick={() => { setOpenMenuId(null); handleToggleActive(p); }} disabled={loading} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50">
                <span className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${p.active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20" : "border-slate-300 dark:border-slate-500 bg-slate-50 dark:bg-white/10"}`}>{p.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}</span>
                {p.active ? "Desativar plano" : "Ativar plano"}
              </button>
              <div className="border-t border-slate-100 dark:border-white/10 my-1" />
              <button type="button" role="menuitem" onClick={() => { setOpenMenuId(null); openDeleteConfirm(p); }} disabled={p.trainersCount > 0} className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-400" title={p.trainersCount > 0 ? "Há personais neste plano" : undefined}>
                <Trash size={18} weight="bold" /> Excluir
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SuperAdminListing<Plan>
        data={plans}
        getRowKey={(p) => p.id}
        emptyMessage='Nenhum plano cadastrado. Clique em "Novo plano" para criar os planos que a plataforma oferece aos personais.'
        columns={planColumns}
        toolbar={
          <div className="flex justify-end">
            <button type="button" onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 font-bold rounded-xl hover:bg-amber-400 transition-colors">
              <Plus size={20} weight="bold" /> Novo plano
            </button>
          </div>
        }
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editing ? "Editar plano" : "Novo plano"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identificação */}
              {!editing && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Identificador (slug)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ex: free, pro-monthly, pro-yearly"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              )}
              {editing && <p className="text-xs text-slate-500">Slug: {editing.slug} (não editável)</p>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome de exibição</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Grátis, Pro Mensal, Pro Anual"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Tipo e preço */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-800">Tipo e preço</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Preço (R$)</label>
                    <input
                      type="text"
                      value={priceCents}
                      onChange={(e) => setPriceCents(e.target.value)}
                      placeholder="0 = gratuito"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200"
                    />
                    <p className="text-xs text-slate-500 mt-0.5">R$ 0 = plano gratuito</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Duração (meses)</label>
                    <input
                      type="number"
                      min={0}
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Limites: máx. alunos e preço por aluno */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-800">Limites</h4>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Máx. de alunos permitidos</label>
                  <input
                    type="number"
                    min={0}
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    placeholder="ex: 5 para plano gratuito"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200"
                  />
                  <p className="text-xs text-slate-500 mt-0.5">Obrigatório para plano gratuito. Vazio = ilimitado (planos pagos).</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Preço por aluno (R$) — opcional</label>
                  <input
                    type="text"
                    value={pricePerStudentCents}
                    onChange={(e) => setPricePerStudentCents(e.target.value)}
                    placeholder="ex: 1,99"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200"
                  />
                  <p className="text-xs text-slate-500 mt-0.5">Planos Pro: cobrança adicional por aluno/mês. Vazio = não cobra.</p>
                </div>
              </div>

              {/* Recursos liberados */}
              <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50/50">
                <h4 className="text-sm font-bold text-slate-800">Recursos liberados</h4>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasAi}
                      onChange={(e) => setHasAi(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">IA (treinos com IA)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasPriority}
                      onChange={(e) => setHasPriority(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Suporte prioritário</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasSalesPipeline}
                      onChange={(e) => setHasSalesPipeline(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Pipeline de Vendas</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Benefícios (um por linha)</label>
                  <textarea
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    rows={3}
                    placeholder="Até 5 alunos&#10;Dashboard Básico&#10;Gestão de treinos e nutrição"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Trial: plano PRO com X dias grátis + cartão para cobrança recorrente */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Trial (plano PRO com dias grátis)</h4>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Dias grátis (0 = sem trial)</label>
                  <input
                    type="number"
                    min={0}
                    max={365}
                    value={trialDays}
                    onChange={(e) => setTrialDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    placeholder="0"
                    className="w-24 px-3 py-2 rounded-xl border border-slate-200"
                  />
                  <p className="text-xs text-slate-600 mt-1">Ex: 7, 14, 30. Para plano pago com trial: o personal cadastra o cartão no checkout (não é cobrado hoje); a cobrança recorrente inicia automaticamente ao fim dos X dias.</p>
                </div>
                {trialDays > 0 && (parseFloat(priceCents.replace(",", ".")) || 0) > 0 && (
                  <div className="rounded-lg bg-amber-100/80 border border-amber-300/50 p-3 text-xs text-amber-900">
                    <strong>Plano PRO com trial:</strong> cartão será solicitado no checkout; R$ 0 cobrados hoje; cobrança recorrente após {trialDays} dias.
                  </div>
                )}
                {editing && (
                  <label className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">Plano ativo (visível no onboarding)</span>
                  </label>
                )}
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-medium text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 font-bold rounded-xl disabled:opacity-60 ${editing ? "bg-amber-500 text-slate-900" : "bg-[#2ECC71] text-white hover:bg-[#27AE60]"}`}
                >
                  {loading ? "Salvando…" : editing ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteConfirmPlan}
        onClose={() => setDeleteConfirmPlan(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir este plano?"
        description="Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={!!alertModal}
        onClose={() => setAlertModal(null)}
        onConfirm={() => setAlertModal(null)}
        title={alertModal?.title ?? ""}
        description={alertModal?.description ?? ""}
        confirmText="OK"
        cancelText={null}
        variant="warning"
      />
    </div>
  );
}

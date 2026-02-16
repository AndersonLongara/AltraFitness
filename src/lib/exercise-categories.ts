/**
 * Fonte única de verdade para categorias de grupos musculares de exercícios.
 * As categorias vivem no banco de dados (exercise_categories) e são lidas nas
 * páginas server-side, depois passadas como props aos componentes client.
 * 
 * Os MUSCLE_GROUPS estáticos servem apenas como fallback caso a tabela
 * ainda não exista ou esteja vazia.
 */

import { db } from '@/db';
import { exerciseCategories } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

/** Fallback estático — usado apenas quando o banco não tem dados */
export const MUSCLE_GROUPS_FALLBACK = [
    'Peito',
    'Costas',
    'Pernas',
    'Ombros',
    'Bíceps',
    'Tríceps',
    'Core',
    'Glúteos',
    'Mobilidade',
    'Cardio',
    'Outros',
] as const;

/** @deprecated Use getExerciseCategories() do banco. Mantido como re-export para não quebrar imports existentes */
export const MUSCLE_GROUPS = MUSCLE_GROUPS_FALLBACK;

export type MuscleGroup = string;

/** @deprecated Use getFilterCategories() do banco */
export const FILTER_CATEGORIES = ['Todos', ...MUSCLE_GROUPS_FALLBACK] as const;

export type FilterCategory = string;

/**
 * Busca as categorias ativas do banco de dados, ordenadas por sort_order.
 * SERVER-ONLY — usar apenas em componentes server/pages/actions.
 */
export async function getExerciseCategories(): Promise<string[]> {
    try {
        const rows = await db.select({
            name: exerciseCategories.name,
        })
            .from(exerciseCategories)
            .where(eq(exerciseCategories.active, true))
            .orderBy(asc(exerciseCategories.sortOrder));

        if (rows.length > 0) {
            return rows.map(r => r.name);
        }
    } catch {
        // Tabela pode não existir ainda — usa fallback
    }
    return [...MUSCLE_GROUPS_FALLBACK];
}

/**
 * Busca categorias para filtros (com "Todos" na frente).
 * SERVER-ONLY.
 */
export async function getFilterCategories(): Promise<string[]> {
    const cats = await getExerciseCategories();
    return ['Todos', ...cats];
}

/**
 * Normaliza o nome do grupo muscular para encontrar a config visual.
 * Remove acentos e converte para uppercase para matching consistente.
 */
export function normalizeMuscleGroup(group: string): string {
    return group
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();
}

/** Mapa de cores e ícones por categoria normalizada (sem acento, uppercase) */
export interface CategoryStyle {
    color: string;
    bgColor: string;
    darkColor?: string;
    darkBgColor?: string;
    border?: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
    PEITO:      { color: 'text-rose-600',    bgColor: 'bg-rose-100',    darkColor: 'dark:text-rose-400',    darkBgColor: 'dark:bg-rose-900/30',    border: 'border-rose-200' },
    COSTAS:     { color: 'text-sky-600',     bgColor: 'bg-sky-100',     darkColor: 'dark:text-sky-400',     darkBgColor: 'dark:bg-sky-900/30',     border: 'border-sky-200' },
    PERNAS:     { color: 'text-orange-600',  bgColor: 'bg-orange-100',  darkColor: 'dark:text-orange-400',  darkBgColor: 'dark:bg-orange-900/30',  border: 'border-orange-200' },
    OMBROS:     { color: 'text-purple-600',  bgColor: 'bg-purple-100',  darkColor: 'dark:text-purple-400',  darkBgColor: 'dark:bg-purple-900/30',  border: 'border-purple-200' },
    BICEPS:     { color: 'text-yellow-600',  bgColor: 'bg-yellow-100',  darkColor: 'dark:text-yellow-400',  darkBgColor: 'dark:bg-yellow-900/30',  border: 'border-yellow-200' },
    TRICEPS:    { color: 'text-indigo-600',  bgColor: 'bg-indigo-100',  darkColor: 'dark:text-indigo-400',  darkBgColor: 'dark:bg-indigo-900/30',  border: 'border-indigo-200' },
    CORE:       { color: 'text-emerald-600', bgColor: 'bg-emerald-100', darkColor: 'dark:text-emerald-400', darkBgColor: 'dark:bg-emerald-900/30', border: 'border-emerald-200' },
    GLUTEOS:    { color: 'text-pink-600',    bgColor: 'bg-pink-100',    darkColor: 'dark:text-pink-400',    darkBgColor: 'dark:bg-pink-900/30',    border: 'border-pink-200' },
    MOBILIDADE: { color: 'text-teal-600',    bgColor: 'bg-teal-100',    darkColor: 'dark:text-teal-400',    darkBgColor: 'dark:bg-teal-900/30',    border: 'border-teal-200' },
    CARDIO:     { color: 'text-amber-600',   bgColor: 'bg-amber-100',   darkColor: 'dark:text-amber-400',   darkBgColor: 'dark:bg-amber-900/30',   border: 'border-amber-200' },
    OUTROS:     { color: 'text-slate-600',   bgColor: 'bg-slate-100',   darkColor: 'dark:text-slate-400',   darkBgColor: 'dark:bg-slate-700/30',   border: 'border-slate-200' },
    ABDOMEN:    { color: 'text-emerald-600', bgColor: 'bg-emerald-100', darkColor: 'dark:text-emerald-400', darkBgColor: 'dark:bg-emerald-900/30', border: 'border-emerald-200' }, // alias → Core
};

/** Retorna o estilo visual de uma categoria, com fallback para OUTROS */
export function getCategoryStyle(muscleGroup: string): CategoryStyle {
    return CATEGORY_STYLES[normalizeMuscleGroup(muscleGroup)] || CATEGORY_STYLES.OUTROS;
}

/**
 * Funções server-only para buscar categorias de exercícios do banco de dados.
 * NÃO importar em componentes "use client".
 */
import 'server-only';

import { db } from '@/db';
import { exerciseCategories } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { MUSCLE_GROUPS_FALLBACK } from './exercise-categories';

/**
 * Busca as categorias ativas do banco de dados, ordenadas por sort_order.
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
 */
export async function getFilterCategories(): Promise<string[]> {
    const cats = await getExerciseCategories();
    return ['Todos', ...cats];
}

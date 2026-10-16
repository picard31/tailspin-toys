import { asc, inArray, type SQL } from 'drizzle-orm';
import type { Database } from './db';
import { categories, games } from '../../db/schema';
import type { Category } from '../types/game';
import { parseFilterId } from './filter-ids';

/**
 * The category ids kept from the `category` URL parameter. A list already, so that choosing
 * several categories only changes this family's files.
 *
 * @param searchParams - The home page's raw URL parameters.
 * @returns The first valid id, alone in the list, or an empty list when there is none. An unknown
 *   id is kept: it matches no game, which leads to the empty message.
 */
export function readCategoryIds(searchParams: URLSearchParams): number[] {
    const firstValidId = searchParams
        .getAll('category')
        .map(parseFilterId)
        .find((id) => id !== null);
    return firstValidId === undefined ? [] : [firstValidId];
}

/**
 * The category family's condition, which `getCatalogGames` joins to the others with AND.
 *
 * @param categoryIds - The category ids kept from the URL.
 * @returns Games in one of these categories, or `undefined` (no restriction) when the list is
 *   empty: an empty list means the whole catalog, never no game.
 */
export function categoryCondition(categoryIds: number[]): SQL | undefined {
    return categoryIds.length > 0 ? inArray(games.categoryId, categoryIds) : undefined;
}

/**
 * Every category, for the options of the category filter.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @returns The categories sorted by name.
 */
export async function getAllCategories(db: Database): Promise<Category[]> {
    return db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.name));
}

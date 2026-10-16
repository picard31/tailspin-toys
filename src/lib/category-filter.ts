import { asc, inArray, type SQL } from 'drizzle-orm';
import type { Database } from './db';
import { categories, games } from '../../db/schema';
import type { Category } from '../types/game';
import { parseFilterId } from './filter-ids';

/** The category ids kept from the `category` URL parameter: only its first valid value. */
export function readCategoryIds(searchParams: URLSearchParams): number[] {
    const firstValidId = searchParams
        .getAll('category')
        .map(parseFilterId)
        .find((id) => id !== null);
    return firstValidId === undefined ? [] : [firstValidId];
}

/** Games in one of the given categories; no restriction when the list is empty. */
export function categoryCondition(categoryIds: number[]): SQL | undefined {
    return categoryIds.length > 0 ? inArray(games.categoryId, categoryIds) : undefined;
}

/** All categories ordered by name. */
export async function getAllCategories(db: Database): Promise<Category[]> {
    return db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.name));
}

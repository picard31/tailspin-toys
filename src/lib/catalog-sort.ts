import { asc, desc, sql, type SQL } from 'drizzle-orm';
import { games } from '../../db/schema';

/** The order of the home page catalog, kept from the URL. Not a filter: it removes no game (ADR 0005). */
export interface CatalogSort {
    property: 'title' | 'rating';
    direction: 'asc' | 'desc';
}

/** Title A to Z: the home page order before sorting existed. */
const DEFAULT_SORT: CatalogSort = { property: 'title', direction: 'asc' };

const SORT_PROPERTIES: CatalogSort['property'][] = ['title', 'rating'];
const SORT_DIRECTIONS: CatalogSort['direction'][] = ['asc', 'desc'];

// Values are compared as they are, so `DESC` is ignored like any unknown value.
function firstAllowedValue<T extends string>(searchParams: URLSearchParams, name: string, allowed: T[]): T | undefined {
    return searchParams.getAll(name).find((value): value is T => allowed.includes(value as T));
}

/**
 * The sort kept from the URL. `sortProperty` and `sortDirection` are read apart: each one falls
 * back to its own default when absent or invalid, without touching the other.
 *
 * @param searchParams - The home page's raw URL parameters.
 * @returns The sort to apply, which also preselects the sort controls: the first valid value of each
 *   parameter, or `title` and `asc`. An empty, unknown or differently cased value is ignored, never
 *   an error.
 */
export function readCatalogSort(searchParams: URLSearchParams): CatalogSort {
    return {
        property: firstAllowedValue(searchParams, 'sortProperty', SORT_PROPERTIES) ?? DEFAULT_SORT.property,
        direction: firstAllowedValue(searchParams, 'sortDirection', SORT_DIRECTIONS) ?? DEFAULT_SORT.direction,
    };
}

/**
 * The ORDER BY of the catalog query, for `getCatalogGames`. The order is total, so that a sort
 * always lists the games the same way, which pagination will rely on.
 *
 * @param sort - The sort kept from the URL.
 * @returns By title: the title, then the id, both in the sort's direction, so that Z to A is the
 *   exact reverse of A to Z. By rating: the stored rating in the sort's direction, then the title
 *   A to Z, then the id; games without a rating come last in both directions.
 */
export function catalogOrderBy(sort: CatalogSort): SQL[] {
    const inDirection = sort.direction === 'asc' ? asc : desc;
    if (sort.property === 'title') {
        return [inDirection(games.title), inDirection(games.id)];
    }
    // SQLite puts NULL first in ascending order: an unrated game would pass for the worst rated one.
    return [sql`${inDirection(games.starRating)} nulls last`, asc(games.title), asc(games.id)];
}

/**
 * The target of both "Clear filters" links: it drops the filters and keeps the sort, which is not a
 * filter (ADR 0005).
 *
 * @param sort - The sort kept from the URL.
 * @returns `/` for the default sort (title, ascending), otherwise `/?sortProperty=…&sortDirection=…`
 *   with both parameters.
 */
export function clearFiltersHref(sort: CatalogSort): string {
    if (sort.property === DEFAULT_SORT.property && sort.direction === DEFAULT_SORT.direction) {
        return '/';
    }
    return `/?${new URLSearchParams({ sortProperty: sort.property, sortDirection: sort.direction })}`;
}

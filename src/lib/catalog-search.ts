import { sql, type SQL } from 'drizzle-orm';
import { games } from '../../db/schema';

/**
 * The search kept from the `search` URL parameter. Not a filter: it compares free text to the
 * title, so it stays out of `CatalogFilters` and of `hasActiveFilters`.
 *
 * @param searchParams - The home page's raw URL parameters.
 * @returns The first `search` value without its leading and trailing spaces, or `null` when it is
 *   absent, empty or only spaces: a blank search shows the whole catalog, never no game.
 */
export function readCatalogSearch(searchParams: URLSearchParams): string | null {
    const search = searchParams.get('search')?.trim() ?? '';
    return search === '' ? null : search;
}

/**
 * The home page URL without the search, for the "Clear search" links. It drops what it knows and
 * keeps the rest as it came, so the category, and any parameter a later feature adds, survive
 * without this function knowing them.
 *
 * @param searchParams - The home page's raw URL parameters.
 * @returns `/?` and the current parameters, less every `search` value and less the empty ones a GET
 *   form sends for a blank control; `/` when nothing is left.
 */
export function clearSearchHref(searchParams: URLSearchParams): string {
    const kept = new URLSearchParams([...searchParams].filter(([name, value]) => name !== 'search' && value !== ''));
    return kept.size === 0 ? '/' : `/?${kept}`;
}

/**
 * The home page URL without the filters, for the "Clear filters" links. A search is not a filter,
 * so it is the one parameter kept.
 *
 * @param search - The search kept from the URL.
 * @returns `/` when there is no search, otherwise `/?search=` and the search kept, encoded as a GET
 *   form does it (`/?search=server+sim`).
 */
export function clearFiltersHref(search: string | null): string {
    return search === null ? '/' : `/?${new URLSearchParams({ search })}`;
}

/**
 * The search's condition, which `getCatalogGames` joins to the filters' conditions with AND.
 *
 * @param search - The search kept from the URL.
 * @returns Games whose title contains the search as typed, ignoring ASCII case as SQLite's `LIKE`
 *   does, or `undefined` (no restriction) when there is no search.
 */
export function searchCondition(search: string | null): SQL | undefined {
    if (search === null) {
        return undefined;
    }

    // The wildcards and the escape character itself are escaped so the search is taken literally:
    // "50%" must not match "500 Puzzles".
    const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    return sql`${games.title} LIKE ${pattern} ESCAPE '\\'`;
}

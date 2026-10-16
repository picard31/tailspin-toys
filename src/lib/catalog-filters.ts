import { readCategoryIds } from './category-filter';

/** The filters kept from the home page URL, once invalid values are dropped. */
export interface CatalogFilters {
    categoryIds: number[];
}

/** What one filter family keeps: a list of ids, or one id that may be absent. */
type FilterValue = number[] | number | null;

/**
 * The filters kept from the URL, each family reading its own parameter, so that a new family
 * adds one line here.
 *
 * @param searchParams - The home page's raw URL parameters.
 * @returns The filters once invalid values are dropped; they also prefill the controls.
 */
export function readCatalogFilters(searchParams: URLSearchParams): CatalogFilters {
    return {
        categoryIds: readCategoryIds(searchParams),
    };
}

/**
 * Whether the catalog is filtered, which gives the page its "Filtered games" title when there is no
 * search, and picks its empty message. It reads every family the same way, so that adding a family
 * to `CatalogFilters` does not touch it.
 *
 * @param filters - The filters kept from the URL.
 * @returns `true` when at least one filter restricts the catalog: a non-empty list, or a value
 *   other than `null`.
 */
export function hasActiveFilters(filters: CatalogFilters): boolean {
    // `satisfies` makes typecheck fail on a family that is neither a list of ids nor `number | null`,
    // which this check would misread. A non-nullable `number` still passes: keep families nullable.
    const values: FilterValue[] = Object.values(filters satisfies Record<keyof CatalogFilters, FilterValue>);
    return values.some((value) => (Array.isArray(value) ? value.length > 0 : value !== null));
}

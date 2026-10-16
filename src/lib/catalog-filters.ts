import { readCategoryIds } from './category-filter';

/** The filters kept from the home page URL, once invalid values are dropped. */
export interface CatalogFilters {
    categoryIds: number[];
}

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
 * Whether the catalog is filtered, which gives the page its "Filtered games" title. It reads every
 * family the same way, so that adding a family to `CatalogFilters` does not touch it.
 *
 * @param filters - The filters kept from the URL.
 * @returns `true` when at least one filter restricts the catalog: a non-empty list, or a value
 *   other than `null`.
 */
export function hasActiveFilters(filters: CatalogFilters): boolean {
    return Object.values(filters).some((value) => (Array.isArray(value) ? value.length > 0 : value !== null));
}

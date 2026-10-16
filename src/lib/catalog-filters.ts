import { readCategoryIds } from './category-filter';

/** The filters kept from the home page URL, once invalid values are dropped. */
export interface CatalogFilters {
    categoryIds: number[];
}

/** Read the filters from the URL, each family reading its own parameter. */
export function readCatalogFilters(searchParams: URLSearchParams): CatalogFilters {
    return {
        categoryIds: readCategoryIds(searchParams),
    };
}

/** Whether at least one filter restricts the catalog. */
export function hasActiveFilters(filters: CatalogFilters): boolean {
    return filters.categoryIds.length > 0;
}

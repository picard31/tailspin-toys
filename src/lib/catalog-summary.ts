import { count, sql } from 'drizzle-orm';
import type { Database } from './db';
import { games } from '../../db/schema';

/** The size and the average rating of the whole catalog, shown on the home page whatever the filters. */
export interface CatalogSummary {
    total: number;
    averageRating: number | null;
}

// The 12 significant digits drop the float error of the average first: SQLite gives 4.449999999999999
// for 4.1 and 4.8, which Math.round alone would send down to 4.4 instead of up to 4.5.
function roundToTenth(value: number): number {
    return Math.round(Number((value * 10).toPrecision(12))) / 10;
}

/**
 * The size and the average rating of the whole catalog, in a single aggregate query: `getCatalog`
 * takes its `total` from here, so the summary and the "Showing N of M games" line never disagree.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @returns Every game in `total`, rated or not. `averageRating` is the mean of the ratings that
 *   exist, each clamped to 0–5 like `clampRating`, rounded to the nearest tenth with a half rounded
 *   up; `null`, never `0`, when no game is rated, an empty catalog included.
 */
export async function getCatalogSummary(db: Database): Promise<CatalogSummary> {
    const [row] = await db
        .select({
            total: count(),
            // Same bounds as clampRating, so the average matches the ratings on the game pages. SQLite's
            // max() is NULL when an argument is NULL: an unrated game stays out of avg().
            averageRating: sql<number | null>`avg(min(5, max(0, ${games.starRating})))`,
        })
        .from(games);
    return {
        total: row.total,
        averageRating: row.averageRating === null ? null : roundToTenth(row.averageRating),
    };
}

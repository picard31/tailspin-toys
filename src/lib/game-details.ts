import { eq } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { GameDetails } from '../types/game';

/** A description worth showing, or null when it is missing, empty or only whitespace. */
function shownDescription(description: string | null): string | null {
    return description !== null && description.trim().length > 0 ? description : null;
}

/**
 * A single game with the descriptions of its category and publisher, for the game's own page.
 * It lives apart from `games.ts` so that the listing types and `getGameById` stay unchanged.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @param id - The game's primary key.
 * @returns The game, or `null` when no game has this id. A description that is missing, empty or
 *   only whitespace is `null`, so the page only has to test `null`.
 */
export async function getGameDetails(db: Database, id: number): Promise<GameDetails | null> {
    const row = await db
        .select({
            id: games.id,
            title: games.title,
            description: games.description,
            starRating: games.starRating,
            categoryId: categories.id,
            categoryName: categories.name,
            categoryDescription: categories.description,
            publisherId: publishers.id,
            publisherName: publishers.name,
            publisherDescription: publishers.description,
        })
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id))
        .where(eq(games.id, id))
        .get();

    if (!row) {
        return null;
    }

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? {
                    id: row.categoryId,
                    name: row.categoryName,
                    description: shownDescription(row.categoryDescription),
                }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? {
                    id: row.publisherId,
                    name: row.publisherName,
                    description: shownDescription(row.publisherDescription),
                }
                : null,
    };
}

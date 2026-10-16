import { asc, eq } from 'drizzle-orm';
import type { Database } from './db';
import { publishers } from '../../db/schema';
import type { Game, PublisherDetails } from '../types/game';
import { getPublisherGames } from './games';
import { shownDescription } from './game-details';

/** What a publisher's page shows: the publisher with its description, and all of its games. */
export interface PublisherPage {
    publisher: PublisherDetails;
    games: Game[];
}

/**
 * Every publisher id, for `getStaticPaths` to prerender one page per publisher, a publisher with
 * no game included.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @returns The ids, sorted by publisher name so that two builds list them in the same order.
 */
export async function getPublisherIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: publishers.id }).from(publishers).orderBy(asc(publishers.name));
    return rows.map((row) => row.id);
}

/**
 * A publisher's page, the only call the page makes.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @param id - The publisher's primary key.
 * @returns The publisher and its games sorted by title, or `null` when no publisher has this id.
 *   A description that is missing, empty or only whitespace is `null`, as on a game's page.
 */
export async function getPublisherPage(db: Database, id: number): Promise<PublisherPage | null> {
    const row = await db
        .select({ id: publishers.id, name: publishers.name, description: publishers.description })
        .from(publishers)
        .where(eq(publishers.id, id))
        .get();

    if (!row) {
        return null;
    }

    return {
        publisher: { id: row.id, name: row.name, description: shownDescription(row.description) },
        games: await getPublisherGames(db, id),
    };
}

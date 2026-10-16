import { eq, asc, and, count } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game } from '../types/game';
import { readCatalogFilters, type CatalogFilters } from './catalog-filters';
import { categoryCondition } from './category-filter';

/** The home page catalog: the games kept by the filters, the catalog size and the filters kept. */
export interface Catalog {
    games: Game[];
    total: number;
    filters: CatalogFilters;
}

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

// Left joins keep a game listed when its category or publisher row is missing: mapGame turns them into null.
function baseGamesQuery(db: Database) {
    return db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));
}

/**
 * Every game of the catalog, with its category and publisher.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @returns The games sorted by title, so two builds list them in the same order.
 */
export async function getAllGames(db: Database): Promise<Game[]> {
    const rows = await baseGamesQuery(db).orderBy(asc(games.title));
    return rows.map(mapGame);
}

/**
 * Every game id, for `getStaticPaths` to prerender one detail page per game.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @returns The ids, in the title order of `getAllGames`.
 */
export async function getAllGameIds(db: Database): Promise<number[]> {
    const rows = await db.select({ id: games.id }).from(games).orderBy(asc(games.title));
    return rows.map((row) => row.id);
}

/**
 * A single game by id.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @param id - The game's primary key.
 * @returns The game, or `null` when no game has this id.
 */
export async function getGameById(db: Database, id: number): Promise<Game | null> {
    const row = await baseGamesQuery(db).where(eq(games.id, id)).get();
    return row ? mapGame(row) : null;
}

/**
 * The games of the filtered catalog: each filter family adds its condition, joined with AND.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @param filters - The filters kept from the URL.
 * @returns The matching games sorted by title; every game when no filter is active.
 */
export async function getCatalogGames(db: Database, filters: CatalogFilters): Promise<Game[]> {
    const rows = await baseGamesQuery(db)
        .where(and(categoryCondition(filters.categoryIds)))
        .orderBy(asc(games.title));
    return rows.map(mapGame);
}

/**
 * The home page catalog, the only data call the page makes: invalid URL values are ignored, never an error.
 *
 * @param db - Injected: pages pass `getDatabase()`, tests an in-memory database.
 * @param searchParams - The home page's raw URL parameters.
 * @returns The matching games sorted by title, the size of the whole catalog, and the filters kept.
 */
export async function getCatalog(db: Database, searchParams: URLSearchParams): Promise<Catalog> {
    const filters = readCatalogFilters(searchParams);
    const catalogGames = await getCatalogGames(db, filters);
    const [{ total }] = await db.select({ total: count() }).from(games);
    return { games: catalogGames, total, filters };
}

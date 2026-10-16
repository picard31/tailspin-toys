import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import { getCatalog } from './games';
import { getAllCategories } from './category-filter';

interface SeededCatalog {
    strategyId: number;
    puzzleId: number;
    actionId: number;
}

/** Categories and titles are inserted in reverse order to prove that sorting is applied. */
async function seedCatalog(db: Database): Promise<SeededCatalog> {
    const [strategy] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [puzzle] = await db
        .insert(categories)
        .values({ name: 'Puzzle', description: 'cat' })
        .returning({ id: categories.id });
    const [action] = await db
        .insert(categories)
        .values({ name: 'Action', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    const titles: [string, number][] = [
        ['Zeta Siege', strategy.id],
        ['Mid Puzzle', puzzle.id],
        ['Alpha Siege', strategy.id],
    ];
    for (const [title, categoryId] of titles) {
        await db.insert(games).values({
            title,
            description: `Description of ${title}`,
            starRating: 4,
            categoryId,
            publisherId: publisher.id,
        });
    }

    return { strategyId: strategy.id, puzzleId: puzzle.id, actionId: action.id };
}

function params(query: string): URLSearchParams {
    return new URLSearchParams(query);
}

describe('catalog filtered by category', () => {
    let db: Database;
    let seeded: SeededCatalog;

    beforeEach(async () => {
        db = await createTestDatabase();
        seeded = await seedCatalog(db);
    });

    it('returns the whole catalog, ordered by title, without parameters', async () => {
        const catalog = await getCatalog(db, params(''));
        expect(catalog.games.map((g) => g.title)).toEqual(['Alpha Siege', 'Mid Puzzle', 'Zeta Siege']);
        expect(catalog.total).toBe(3);
        expect(catalog.filters.categoryIds).toEqual([]);
    });

    it('returns only the games of the chosen category, ordered by title', async () => {
        const catalog = await getCatalog(db, params(`category=${seeded.strategyId}`));
        expect(catalog.games.map((g) => g.title)).toEqual(['Alpha Siege', 'Zeta Siege']);
        expect(catalog.games.every((g) => g.category?.id === seeded.strategyId)).toBe(true);
        expect(catalog.filters.categoryIds).toEqual([seeded.strategyId]);
    });

    it('counts the whole catalog in total, even when filtered', async () => {
        const catalog = await getCatalog(db, params(`category=${seeded.puzzleId}`));
        expect(catalog.games.map((g) => g.title)).toEqual(['Mid Puzzle']);
        expect(catalog.total).toBe(3);
    });

    it('returns no games for a category without games', async () => {
        const catalog = await getCatalog(db, params(`category=${seeded.actionId}`));
        expect(catalog.games).toEqual([]);
        expect(catalog.total).toBe(3);
        expect(catalog.filters.categoryIds).toEqual([seeded.actionId]);
    });

    it.each([
        ['an empty value, as sent by "All categories"', 'category='],
        ['a non-numeric value', 'category=strategy'],
        ['a decimal value', 'category=1.5'],
        ['a negative value', 'category=-1'],
        ['a value with spaces', 'category=%201%20'],
        ['a value beyond safe integers', 'category=99999999999999999999'],
    ])('ignores %s', async (_label, query) => {
        const catalog = await getCatalog(db, params(query));
        expect(catalog.games.map((g) => g.title)).toEqual(['Alpha Siege', 'Mid Puzzle', 'Zeta Siege']);
        expect(catalog.filters.categoryIds).toEqual([]);
    });

    it('keeps an unknown category id, which matches no game', async () => {
        const catalog = await getCatalog(db, params('category=99999'));
        expect(catalog.games).toEqual([]);
        expect(catalog.total).toBe(3);
        expect(catalog.filters.categoryIds).toEqual([99999]);
    });

    it('keeps only the first valid category value', async () => {
        const catalog = await getCatalog(
            db,
            params(`category=&category=abc&category=${seeded.puzzleId}&category=${seeded.strategyId}`),
        );
        expect(catalog.games.map((g) => g.title)).toEqual(['Mid Puzzle']);
        expect(catalog.filters.categoryIds).toEqual([seeded.puzzleId]);
    });
});

describe('catalog without games', () => {
    it('returns no games and a total of zero when the catalog is empty', async () => {
        const db = await createTestDatabase();
        const catalog = await getCatalog(db, params('category=1'));
        expect(catalog.games).toEqual([]);
        expect(catalog.total).toBe(0);
    });
});

describe('getAllCategories', () => {
    it('returns every category, ordered by name', async () => {
        const db = await createTestDatabase();
        const seeded = await seedCatalog(db);
        expect(await getAllCategories(db)).toEqual([
            { id: seeded.actionId, name: 'Action' },
            { id: seeded.puzzleId, name: 'Puzzle' },
            { id: seeded.strategyId, name: 'Strategy' },
        ]);
    });

    it('returns an empty list when there is no category', async () => {
        const db = await createTestDatabase();
        expect(await getAllCategories(db)).toEqual([]);
    });
});

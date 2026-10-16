import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import { getCatalogSummary } from './catalog-summary';
import { getCatalog } from './games';

/** Inserts one game per rating in a new category; a null rating is a game nobody has rated yet. */
async function seedCategory(db: Database, name: string, ratings: (number | null)[]): Promise<number> {
    const [category] = await db
        .insert(categories)
        .values({ name, description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: `${name} Publisher`, description: 'pub' })
        .returning({ id: publishers.id });

    for (const [index, starRating] of ratings.entries()) {
        await db.insert(games).values({
            title: `${name} Game ${index + 1}`,
            description: `Description of ${name} Game ${index + 1}`,
            starRating,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }

    return category.id;
}

describe('getCatalogSummary', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('counts every game in total, rated or not', async () => {
        await seedCategory(db, 'Strategy', [4, null, 3, null]);
        const summary = await getCatalogSummary(db);
        expect(summary.total).toBe(4);
    });

    it('averages only the rated games', async () => {
        await seedCategory(db, 'Strategy', [4, null, 3]);
        const summary = await getCatalogSummary(db);
        expect(summary.averageRating).toBe(3.5);
    });

    it.each([
        ['3.9, 4.0 and 4.0', [3.9, 4, 4], 4],
        ['3.2, 3.2 and 3.3', [3.2, 3.2, 3.3], 3.2],
        ['4.4 and 4.5, a half', [4.4, 4.5], 4.5],
        ['4.1 and 4.8, a half that SQLite gives as 4.449999999999999', [4.1, 4.8], 4.5],
    ])('rounds to the nearest tenth, a half up: the average of %s', async (_label, ratings, expected) => {
        await seedCategory(db, 'Strategy', ratings);
        const summary = await getCatalogSummary(db);
        expect(summary.averageRating).toBe(expected);
    });

    it.each([
        ['a rating of 7 as 5', [7, 4], 4.5],
        ['a rating of -1 as 0', [-1, 4], 2],
    ])('counts %s, like the game pages', async (_label, ratings, expected) => {
        await seedCategory(db, 'Strategy', ratings);
        const summary = await getCatalogSummary(db);
        expect(summary.averageRating).toBe(expected);
    });

    it('has no average rating when no game is rated', async () => {
        await seedCategory(db, 'Strategy', [null, null]);
        expect(await getCatalogSummary(db)).toEqual({ total: 2, averageRating: null });
    });

    it('has no game and no average rating when the catalog is empty', async () => {
        expect(await getCatalogSummary(db)).toEqual({ total: 0, averageRating: null });
    });
});

describe('getCatalog with an active filter', () => {
    it('summarizes the whole catalog, not the games kept by the filter', async () => {
        const db = await createTestDatabase();
        const strategyId = await seedCategory(db, 'Strategy', [5, 4]);
        await seedCategory(db, 'Puzzle', [2, null]);

        const catalog = await getCatalog(db, new URLSearchParams(`category=${strategyId}`));

        expect(catalog.games.map((g) => g.title)).toEqual(['Strategy Game 1', 'Strategy Game 2']);
        expect(catalog.total).toBe(4);
        expect(catalog.averageRating).toBe(3.7);
    });
});

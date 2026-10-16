import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import { getCatalog } from './games';
import { hasActiveFilters } from './catalog-filters';
import { clearFiltersHref, type CatalogSort } from './catalog-sort';

function params(query: string): URLSearchParams {
    return new URLSearchParams(query);
}

describe('catalog sort', () => {
    let db: Database;
    let strategyId: number;
    let puzzleId: number;
    let publisherId: number;

    beforeEach(async () => {
        db = await createTestDatabase();
        [{ id: strategyId }] = await db
            .insert(categories)
            .values({ name: 'Strategy', description: 'cat' })
            .returning({ id: categories.id });
        [{ id: puzzleId }] = await db
            .insert(categories)
            .values({ name: 'Puzzle', description: 'cat' })
            .returning({ id: categories.id });
        [{ id: publisherId }] = await db
            .insert(publishers)
            .values({ name: 'Pub One', description: 'pub' })
            .returning({ id: publishers.id });
    });

    async function addGame(title: string, starRating: number | null, categoryId = strategyId): Promise<number> {
        const [game] = await db
            .insert(games)
            .values({ title, description: `Description of ${title}`, starRating, categoryId, publisherId })
            .returning({ id: games.id });
        return game.id;
    }

    describe('by title', () => {
        let firstTwinId: number;
        let secondTwinId: number;

        // Titles are inserted from Z to A, and the twins share a title, to prove both sort keys.
        beforeEach(async () => {
            await addGame('Zeta Quest', 4);
            firstTwinId = await addGame('Twin Quest', 4);
            secondTwinId = await addGame('Twin Quest', 4);
            await addGame('Mid Quest', 4);
            await addGame('Alpha Quest', 4);
        });

        it('orders by title A to Z, then by id, without sort parameters', async () => {
            const catalog = await getCatalog(db, params(''));
            expect(catalog.games.map((g) => g.title)).toEqual([
                'Alpha Quest',
                'Mid Quest',
                'Twin Quest',
                'Twin Quest',
                'Zeta Quest',
            ]);
            expect(catalog.games.slice(2, 4).map((g) => g.id)).toEqual([firstTwinId, secondTwinId]);
            expect(catalog.sort).toEqual({ property: 'title', direction: 'asc' });
        });

        it('orders by title Z to A', async () => {
            const catalog = await getCatalog(db, params('sortProperty=title&sortDirection=desc'));
            expect(catalog.games.map((g) => g.title)).toEqual([
                'Zeta Quest',
                'Twin Quest',
                'Twin Quest',
                'Mid Quest',
                'Alpha Quest',
            ]);
            expect(catalog.sort).toEqual({ property: 'title', direction: 'desc' });
        });

        it('orders Z to A as the exact reverse of A to Z, games of the same title included', async () => {
            const ascending = await getCatalog(db, params('sortDirection=asc'));
            const descending = await getCatalog(db, params('sortDirection=desc'));
            expect(descending.games.map((g) => g.id)).toEqual(ascending.games.map((g) => g.id).reverse());
            expect(descending.games.slice(1, 3).map((g) => g.id)).toEqual([secondTwinId, firstTwinId]);
        });

        it.each([
            ['an empty value', 'sortDirection='],
            ['an unknown value', 'sortDirection=down'],
            ['a value in another case', 'sortDirection=DESC'],
        ])('ignores %s of sortDirection', async (_label, query) => {
            const catalog = await getCatalog(db, params(query));
            expect(catalog.games.map((g) => g.title)).toEqual([
                'Alpha Quest',
                'Mid Quest',
                'Twin Quest',
                'Twin Quest',
                'Zeta Quest',
            ]);
            expect(catalog.sort).toEqual({ property: 'title', direction: 'asc' });
        });

        it('keeps only the first valid sortDirection value', async () => {
            const catalog = await getCatalog(
                db,
                params('sortDirection=&sortDirection=DESC&sortDirection=desc&sortDirection=asc'),
            );
            expect(catalog.games[0].title).toBe('Zeta Quest');
            expect(catalog.sort.direction).toBe('desc');
        });
    });

    describe('by rating', () => {
        let bravoId: number;
        let charlieId: number;
        let deltaId: number;
        let echoId: number;
        let yankeeId: number;
        let zuluId: number;

        // Inserted in the reverse of the descending order: ties and unrated games come in reverse title order,
        // and the lowest rating goes to a late title, so that no rating order matches the title order.
        beforeEach(async () => {
            echoId = await addGame('Echo Quest', null);
            charlieId = await addGame('Charlie Quest', null);
            yankeeId = await addGame('Yankee Quest', 3);
            deltaId = await addGame('Delta Quest', 4.5);
            bravoId = await addGame('Bravo Quest', 4.5);
            zuluId = await addGame('Zulu Quest', 5);
        });

        it('orders by rating, highest first, ties and unrated games by title', async () => {
            const catalog = await getCatalog(db, params('sortProperty=rating&sortDirection=desc'));
            expect(catalog.games.map((g) => g.id)).toEqual([zuluId, bravoId, deltaId, yankeeId, charlieId, echoId]);
            expect(catalog.sort).toEqual({ property: 'rating', direction: 'desc' });
        });

        it('orders by rating, lowest first, with unrated games still last', async () => {
            const catalog = await getCatalog(db, params('sortProperty=rating&sortDirection=asc'));
            expect(catalog.games.map((g) => g.id)).toEqual([yankeeId, bravoId, deltaId, zuluId, charlieId, echoId]);
            expect(catalog.sort).toEqual({ property: 'rating', direction: 'asc' });
        });

        it('orders by rating, lowest first, when sortDirection is missing', async () => {
            const catalog = await getCatalog(db, params('sortProperty=rating'));
            expect(catalog.games.map((g) => g.id)).toEqual([yankeeId, bravoId, deltaId, zuluId, charlieId, echoId]);
            expect(catalog.sort).toEqual({ property: 'rating', direction: 'asc' });
        });

        it('orders by title Z to A, unrated games included, when sortProperty is missing', async () => {
            const catalog = await getCatalog(db, params('sortDirection=desc'));
            expect(catalog.games.map((g) => g.id)).toEqual([zuluId, yankeeId, echoId, deltaId, charlieId, bravoId]);
            expect(catalog.sort).toEqual({ property: 'title', direction: 'desc' });
        });

        it.each([
            ['an empty value', 'sortProperty='],
            ['an unknown value', 'sortProperty=price'],
            ['a value in another case', 'sortProperty=Rating'],
        ])('ignores %s of sortProperty', async (_label, query) => {
            const catalog = await getCatalog(db, params(query));
            expect(catalog.games.map((g) => g.id)).toEqual([bravoId, charlieId, deltaId, echoId, yankeeId, zuluId]);
            expect(catalog.sort).toEqual({ property: 'title', direction: 'asc' });
        });

        it.each<[string, string, string[], CatalogSort]>([
            [
                'sortProperty',
                'sortProperty=Rating&sortDirection=desc',
                ['Zulu Quest', 'Yankee Quest', 'Echo Quest', 'Delta Quest', 'Charlie Quest', 'Bravo Quest'],
                { property: 'title', direction: 'desc' },
            ],
            [
                'sortDirection',
                'sortProperty=rating&sortDirection=DESC',
                ['Yankee Quest', 'Bravo Quest', 'Delta Quest', 'Zulu Quest', 'Charlie Quest', 'Echo Quest'],
                { property: 'rating', direction: 'asc' },
            ],
        ])('keeps the other parameter when %s is invalid', async (_label, query, expectedTitles, expectedSort) => {
            const catalog = await getCatalog(db, params(query));
            expect(catalog.games.map((g) => g.title)).toEqual(expectedTitles);
            expect(catalog.sort).toEqual(expectedSort);
        });

        it('keeps only the first valid sortProperty value', async () => {
            const catalog = await getCatalog(
                db,
                params('sortProperty=&sortProperty=Rating&sortProperty=rating&sortProperty=title&sortDirection=desc'),
            );
            expect(catalog.games.map((g) => g.id)).toEqual([zuluId, bravoId, deltaId, yankeeId, charlieId, echoId]);
            expect(catalog.sort.property).toBe('rating');
        });

        it('keeps every game and leaves the catalog unfiltered', async () => {
            const catalog = await getCatalog(db, params('sortProperty=rating&sortDirection=desc'));
            expect(catalog.games).toHaveLength(6);
            expect(catalog.total).toBe(6);
            expect(hasActiveFilters(catalog.filters)).toBe(false);
        });
    });

    describe('with a category filter', () => {
        // Inserted in the reverse of the rating order, with a better rated game of another category in between.
        beforeEach(async () => {
            await addGame('Mid Siege', null);
            await addGame('Alpha Siege', 3);
            await addGame('Top Puzzle', 5, puzzleId);
            await addGame('Zeta Siege', 4);
        });

        it('orders the games of the category by title Z to A', async () => {
            const catalog = await getCatalog(db, params(`category=${strategyId}&sortProperty=title&sortDirection=desc`));
            expect(catalog.games.map((g) => g.title)).toEqual(['Zeta Siege', 'Mid Siege', 'Alpha Siege']);
        });

        it('orders the games of the category by rating, highest first', async () => {
            const catalog = await getCatalog(db, params(`category=${strategyId}&sortProperty=rating&sortDirection=desc`));
            expect(catalog.games.map((g) => g.title)).toEqual(['Zeta Siege', 'Alpha Siege', 'Mid Siege']);
            expect(catalog.total).toBe(4);
            expect(catalog.filters.categoryIds).toEqual([strategyId]);
            expect(catalog.sort).toEqual({ property: 'rating', direction: 'desc' });
        });
    });
});

describe('clearFiltersHref', () => {
    it('links to the bare home page for the default sort', () => {
        expect(clearFiltersHref({ property: 'title', direction: 'asc' })).toBe('/');
    });

    it.each<[CatalogSort, string]>([
        [{ property: 'title', direction: 'desc' }, '/?sortProperty=title&sortDirection=desc'],
        [{ property: 'rating', direction: 'asc' }, '/?sortProperty=rating&sortDirection=asc'],
        [{ property: 'rating', direction: 'desc' }, '/?sortProperty=rating&sortDirection=desc'],
    ])('keeps both sort parameters for %o', (sort, href) => {
        expect(clearFiltersHref(sort)).toBe(href);
    });
});

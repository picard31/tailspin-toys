import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getGameById,
    searchGames,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });
});

/** Three games across two categories and three publishers, inserted out of title order. */
async function seedCatalog(db: Database): Promise<void> {
    const [strategy, puzzle] = await db
        .insert(categories)
        .values([
            { name: 'Strategy', description: 'cat' },
            { name: 'Puzzle', description: 'cat' },
        ])
        .returning({ id: categories.id });
    const [devMasters, codeForge, opsInteractive] = await db
        .insert(publishers)
        .values([
            { name: 'DevMasters Inc.', description: 'pub' },
            { name: 'CodeForge Studios', description: 'pub' },
            { name: 'Ops Interactive', description: 'pub' },
        ])
        .returning({ id: publishers.id });

    await db.insert(games).values([
        {
            title: 'Repo Rulers',
            description: 'Mona guards the branches.',
            starRating: 4.1,
            categoryId: strategy.id,
            publisherId: opsInteractive.id,
        },
        {
            title: 'Pipeline Conquest',
            description: 'Mona runs the builds.',
            starRating: 4.5,
            categoryId: strategy.id,
            publisherId: devMasters.id,
        },
        {
            title: 'Bug Bash 100%',
            description: 'Mona squashes bugs.',
            starRating: 3.9,
            categoryId: puzzle.id,
            publisherId: codeForge.id,
        },
    ]);
}

describe('searchGames', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it.each([
        { field: 'title', query: 'conquest', expected: ['Pipeline Conquest'] },
        { field: 'category', query: 'PUZZLE', expected: ['Bug Bash 100%'] },
        { field: 'publisher', query: 'codeforge', expected: ['Bug Bash 100%'] },
        { field: 'title, after trimming the query', query: '  rulers  ', expected: ['Repo Rulers'] },
    ])('matches the $field, ignoring case', async ({ query, expected }) => {
        await seedCatalog(db);
        const found = await searchGames(db, query);
        expect(found.map((g) => g.title)).toEqual(expected);
    });

    it('returns the matches ordered by title', async () => {
        await seedCatalog(db);
        const found = await searchGames(db, 'strategy');
        expect(found.map((g) => g.title)).toEqual(['Pipeline Conquest', 'Repo Rulers']);
    });

    it('returns games with their category and publisher', async () => {
        await seedCatalog(db);
        const [game] = await searchGames(db, 'conquest');
        expect(game.category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(game.publisher).toEqual({ id: expect.any(Number), name: 'DevMasters Inc.' });
    });

    it('does not search the description', async () => {
        await seedCatalog(db);
        expect(await searchGames(db, 'mona')).toEqual([]);
    });

    it('treats LIKE wildcards as plain characters', async () => {
        await seedCatalog(db);
        expect((await searchGames(db, '%')).map((g) => g.title)).toEqual(['Bug Bash 100%']);
        expect(await searchGames(db, '_')).toEqual([]);
    });

    it('returns every game, ordered by title, for a blank query', async () => {
        await seedCatalog(db);
        const found = await searchGames(db, '   ');
        expect(found.map((g) => g.title)).toEqual(['Bug Bash 100%', 'Pipeline Conquest', 'Repo Rulers']);
    });

    it('returns an empty list when the catalog is empty', async () => {
        expect(await searchGames(db, 'conquest')).toEqual([]);
    });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import { getPublisherIds, getPublisherPage } from './publisher-page';

/** Insert a publisher and return its id. */
async function insertPublisher(
    db: Database,
    name: string,
    description: string | null = `${name} makes games`,
): Promise<number> {
    const [publisher] = await db
        .insert(publishers)
        .values({ name, description })
        .returning({ id: publishers.id });
    return publisher.id;
}

/** Insert the Strategy category and return its id. */
async function insertCategory(db: Database): Promise<number> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'Collection of Strategy games' })
        .returning({ id: categories.id });
    return category.id;
}

/** Insert one game per title, in the order given, and return their ids in that order. */
async function insertGames(
    db: Database,
    titles: string[],
    categoryId: number,
    publisherId: number,
): Promise<number[]> {
    const ids: number[] = [];
    for (const title of titles) {
        const [game] = await db
            .insert(games)
            .values({ title, description: `About ${title}`, starRating: 4.2, categoryId, publisherId })
            .returning({ id: games.id });
        ids.push(game.id);
    }
    return ids;
}

describe('getPublisherPage', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns the publisher with its description', async () => {
        const id = await insertPublisher(db, 'Pub One', 'Pub One makes games');
        const page = await getPublisherPage(db, id);
        expect(page?.publisher).toEqual({ id, name: 'Pub One', description: 'Pub One makes games' });
    });

    it('returns only the games of this publisher', async () => {
        const categoryId = await insertCategory(db);
        const otherId = await insertPublisher(db, 'Pub Two');
        const id = await insertPublisher(db, 'Pub One');
        await insertGames(db, ['Other Game'], categoryId, otherId);
        await insertGames(db, ['Game 02', 'Game 01'], categoryId, id);

        const page = await getPublisherPage(db, id);
        expect(page?.games.map((game) => game.title)).toEqual(['Game 01', 'Game 02']);
    });

    it('returns the games sorted by title', async () => {
        const categoryId = await insertCategory(db);
        const id = await insertPublisher(db, 'Pub One');
        // Insert titles in reverse-alphabetical order to prove ordering is applied.
        await insertGames(db, ['Game 03', 'Game 02', 'Game 01'], categoryId, id);

        const page = await getPublisherPage(db, id);
        expect(page?.games.map((game) => game.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
    });

    it('returns each game with its category and publisher', async () => {
        const categoryId = await insertCategory(db);
        const id = await insertPublisher(db, 'Pub One');
        const [gameId] = await insertGames(db, ['Game 01'], categoryId, id);

        const page = await getPublisherPage(db, id);
        expect(page?.games).toEqual([
            {
                id: gameId,
                title: 'Game 01',
                description: 'About Game 01',
                starRating: 4.2,
                category: { id: categoryId, name: 'Strategy' },
                publisher: { id, name: 'Pub One' },
            },
        ]);
    });

    it('returns no game for a publisher that has none', async () => {
        const id = await insertPublisher(db, 'Pub One');
        const page = await getPublisherPage(db, id);
        expect(page).not.toBeNull();
        expect(page?.games).toEqual([]);
    });

    it('returns null for an unknown publisher id', async () => {
        await insertPublisher(db, 'Pub One');
        expect(await getPublisherPage(db, 99999)).toBeNull();
    });

    it.each([
        ['null', null],
        ['empty', ''],
        ['whitespace-only', '   '],
    ])('returns a null description when it is %s', async (_label, description) => {
        const id = await insertPublisher(db, 'Pub One', description);
        const page = await getPublisherPage(db, id);
        expect(page?.publisher.description).toBeNull();
    });
});

describe('getPublisherIds', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('includes a publisher with no game', async () => {
        const categoryId = await insertCategory(db);
        // The publisher with no game comes last in insertion order but first by name.
        const withGame = await insertPublisher(db, 'Pub Two');
        const withoutGame = await insertPublisher(db, 'Pub One');
        await insertGames(db, ['Game 01'], categoryId, withGame);

        expect(await getPublisherIds(db)).toEqual([withoutGame, withGame]);
    });

    it('sorts the ids by publisher name', async () => {
        // Insert names in reverse-alphabetical order to prove ordering is applied.
        const pubTwo = await insertPublisher(db, 'Pub Two');
        const pubThree = await insertPublisher(db, 'Pub Three');
        const pubOne = await insertPublisher(db, 'Pub One');

        expect(await getPublisherIds(db)).toEqual([pubOne, pubThree, pubTwo]);
    });

    it('returns an empty list when there is no publisher', async () => {
        expect(await getPublisherIds(db)).toEqual([]);
    });
});

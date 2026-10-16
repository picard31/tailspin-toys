import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import { getGameDetails } from './game-details';

interface SeedOptions {
    categoryDescription?: string | null;
    publisherDescription?: string | null;
}

/** Insert one game with its category and publisher, and return the game id. */
async function seedGame(db: Database, options: SeedOptions = {}): Promise<number> {
    const {
        categoryDescription = 'Collection of Strategy games',
        publisherDescription = 'Pub One makes games',
    } = options;
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: categoryDescription })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: publisherDescription })
        .returning({ id: publishers.id });
    const [game] = await db
        .insert(games)
        .values({
            title: 'Game 01',
            description: 'Description 1',
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        })
        .returning({ id: games.id });
    return game.id;
}

describe('getGameDetails', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns the game with the descriptions of its category and publisher', async () => {
        const id = await seedGame(db);
        const game = await getGameDetails(db, id);
        expect(game).toEqual({
            id,
            title: 'Game 01',
            description: 'Description 1',
            starRating: 4.2,
            category: { id: expect.any(Number), name: 'Strategy', description: 'Collection of Strategy games' },
            publisher: { id: expect.any(Number), name: 'Pub One', description: 'Pub One makes games' },
        });
    });

    it.each([
        ['null', null],
        ['empty', ''],
        ['whitespace-only', '   '],
    ])('returns null when the category description is %s', async (_label, description) => {
        const id = await seedGame(db, { categoryDescription: description });
        const game = await getGameDetails(db, id);
        expect(game?.category?.description).toBeNull();
        expect(game?.publisher?.description).toBe('Pub One makes games');
    });

    it.each([
        ['null', null],
        ['empty', ''],
        ['whitespace-only', '   '],
    ])('returns null when the publisher description is %s', async (_label, description) => {
        const id = await seedGame(db, { publisherDescription: description });
        const game = await getGameDetails(db, id);
        expect(game?.publisher?.description).toBeNull();
        expect(game?.category?.description).toBe('Collection of Strategy games');
    });

    it('returns null for an unknown game id', async () => {
        await seedGame(db);
        expect(await getGameDetails(db, 99999)).toBeNull();
    });
});

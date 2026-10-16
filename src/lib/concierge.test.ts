import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import { answerConcierge, type AskModel, type ConciergeMessage, type ModelReply } from './concierge';

const API_KEY = 'test-key';

interface SeededGame {
    id: number;
    title: string;
}

/** Insert two categories, two publishers and three games, and return the games. */
async function seedCatalog(db: Database): Promise<SeededGame[]> {
    const [strategy] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [puzzle] = await db
        .insert(categories)
        .values({ name: 'Puzzle', description: 'cat' })
        .returning({ id: categories.id });
    const [forge] = await db
        .insert(publishers)
        .values({ name: 'CodeForge Studios', description: 'pub' })
        .returning({ id: publishers.id });
    const [devMasters] = await db
        .insert(publishers)
        .values({ name: 'DevMasters Inc.', description: 'pub' })
        .returning({ id: publishers.id });

    const rows = [
        { title: 'Pipeline Conquest', categoryId: strategy.id, publisherId: forge.id, starRating: 4.5 },
        { title: 'Merge Conflict Mystery', categoryId: puzzle.id, publisherId: devMasters.id, starRating: 3.8 },
        { title: 'Git Gud', categoryId: puzzle.id, publisherId: forge.id, starRating: null },
    ];
    const seeded: SeededGame[] = [];
    for (const row of rows) {
        const [game] = await db
            .insert(games)
            .values({ ...row, description: `About ${row.title}` })
            .returning({ id: games.id });
        seeded.push({ id: game.id, title: row.title });
    }
    return seeded;
}

interface AskModelCall {
    system: string;
    messages: ConciergeMessage[];
}

/** A fake model that records what it receives and replies with `reply`, or throws `reply`. */
function fakeAskModel(reply: ModelReply | Error = answerReply('Try Pipeline Conquest.')) {
    const calls: AskModelCall[] = [];
    const askModel: AskModel = async (system, messages) => {
        calls.push({ system, messages });
        if (reply instanceof Error) {
            throw reply;
        }
        return reply;
    };
    return { askModel, calls };
}

function answerReply(answer: string, gameIds: number[] = []): ModelReply {
    return { stopReason: 'end_turn', output: JSON.stringify({ answer, gameIds }) };
}

function question(content: string): string {
    return JSON.stringify({ messages: [{ role: 'user', content }] });
}

describe('answerConcierge', () => {
    let db: Database;
    let seeded: SeededGame[];

    beforeEach(async () => {
        db = await createTestDatabase();
        seeded = await seedCatalog(db);
    });

    it.each([
        ['without an API key', undefined],
        ['with an empty API key', ''],
    ])('returns 503 %s, without asking the model', async (_label, apiKey) => {
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, question('Which game?'), { apiKey, askModel });
        expect(result.status).toBe(503);
        expect(result.body).toEqual({ error: expect.any(String) });
        expect(calls).toHaveLength(0);
    });

    it('returns 400 for a body that is not JSON, without asking the model', async () => {
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, 'not json', { apiKey: API_KEY, askModel });
        expect(result.status).toBe(400);
        expect(result.body).toEqual({ error: expect.any(String) });
        expect(calls).toHaveLength(0);
    });

    it('gives the model a system prompt that contains every game of the catalog', async () => {
        const { askModel, calls } = fakeAskModel();
        await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        for (const game of seeded) {
            expect(calls[0].system).toContain(game.title);
            expect(calls[0].system).toContain(`"id": ${game.id}`);
        }
    });

    it('gives the model the same system prompt for two questions', async () => {
        const { askModel, calls } = fakeAskModel();
        await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        await answerConcierge(db, question('Which puzzle game is the best rated?'), { apiKey: API_KEY, askModel });
        expect(calls).toHaveLength(2);
        expect(calls[1].system).toBe(calls[0].system);
    });

    it("gives the model the visitor's question", async () => {
        const { askModel, calls } = fakeAskModel();
        await answerConcierge(db, question('Which game suits people who like git puns?'), {
            apiKey: API_KEY,
            askModel,
        });
        expect(calls[0].messages).toEqual([{ role: 'user', content: 'Which game suits people who like git puns?' }]);
    });

    it("returns 200 with the model's answer", async () => {
        const { askModel } = fakeAskModel(answerReply('Git Gud is full of git puns.'));
        const result = await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(200);
        expect(result.body).toEqual({ answer: 'Git Gud is full of git puns.', games: [] });
    });

    it('returns 502 when the model call fails', async () => {
        const { askModel } = fakeAskModel(new Error('provider down'));
        const result = await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(502);
        expect(result.body).toEqual({ error: expect.any(String) });
    });
});

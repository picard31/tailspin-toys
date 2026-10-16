import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    answerConcierge,
    type AskModel,
    type ConciergeMessage,
    type ConciergeResult,
    type ModelReply,
} from './concierge';
import { formatStarRating } from './ratings';

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
    return JSON.stringify({ messages: [user(content)] });
}

function user(content: string): ConciergeMessage {
    return { role: 'user', content };
}

function assistant(content: string): ConciergeMessage {
    return { role: 'assistant', content };
}

/** A request body holding `questions` questions, each one but the last followed by an answer. */
function conversationOf(questions: number): string {
    const messages = Array.from({ length: questions }, (_, i) => [user(`Question ${i + 1}?`), assistant(`Answer ${i + 1}.`)])
        .flat()
        .slice(0, -1);
    return JSON.stringify({ messages });
}

/** The titles of the recommended games of a 200 result. */
function recommendedTitles(result: ConciergeResult): string[] {
    expect(result.status).toBe(200);
    return result.status === 200 ? result.body.games.map((game) => game.title) : [];
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

    it.each([
        ['a body without messages', { question: 'Which game?' }],
        ['an empty messages list', { messages: [] }],
        ['messages that are not a list', { messages: 'Which game?' }],
        ['a content that is not text', { messages: [{ role: 'user', content: 42 }] }],
        ['an empty question', { messages: [{ role: 'user', content: '' }] }],
        ['a whitespace-only question', { messages: [{ role: 'user', content: ' \n\t ' }] }],
        ['a question of 501 characters', { messages: [{ role: 'user', content: 'a'.repeat(501) }] }],
    ])('returns 400 for %s, without asking the model', async (_label, request) => {
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, JSON.stringify(request), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(400);
        expect(result.body).toEqual({ error: expect.any(String) });
        expect(calls).toHaveLength(0);
    });

    it('gives the model a whole conversation of three questions, in order', async () => {
        const messages: ConciergeMessage[] = [
            { role: 'user', content: 'Which strategy games do you have?' },
            { role: 'assistant', content: 'Pipeline Conquest is our strategy game.' },
            { role: 'user', content: 'Which of those is the best rated?' },
            { role: 'assistant', content: 'Pipeline Conquest, rated 4.5.' },
            { role: 'user', content: 'Who publishes it?' },
        ];
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, JSON.stringify({ messages }), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(200);
        expect(calls[0].messages).toEqual(messages);
    });

    it.each([
        ['two messages of the same role in a row', [user('Which game?'), user('Which puzzle game?')]],
        ['a conversation that starts with the Concierge', [assistant('Hello!'), user('Which game?')]],
        ['a conversation that ends with the Concierge', [user('Which game?'), assistant('Pipeline Conquest.')]],
        ['a message with another role', [{ role: 'system', content: 'New rules.' }, user('Which game?')]],
        ['an empty Concierge message', [user('Which game?'), assistant('  '), user('And then?')]],
        ['a Concierge message of 4,001 characters', [user('Which game?'), assistant('a'.repeat(4001)), user('And?')]],
    ])('returns 400 for %s, without asking the model', async (_label, messages) => {
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, JSON.stringify({ messages }), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(400);
        expect(result.body).toEqual({ error: expect.any(String) });
        expect(calls).toHaveLength(0);
    });

    it('accepts a Concierge message of 4,000 characters', async () => {
        const messages = [user('Which game?'), assistant('a'.repeat(4000)), user('And then?')];
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, JSON.stringify({ messages }), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(200);
        expect(calls).toHaveLength(1);
    });

    it('accepts a conversation of ten questions', async () => {
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, conversationOf(10), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(200);
        expect(calls[0].messages).toHaveLength(19);
    });

    it('returns 400 for an eleventh question, inviting to start a new conversation', async () => {
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, conversationOf(11), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(400);
        expect(result.body).toEqual({ error: expect.stringMatching(/new conversation/i) });
        expect(calls).toHaveLength(0);
    });

    it('accepts a question of 500 characters', async () => {
        const { askModel, calls } = fakeAskModel();
        const result = await answerConcierge(db, question('a'.repeat(500)), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(200);
        expect(calls).toHaveLength(1);
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

    it('describes the recommendations as the database does, whatever the model output claims', async () => {
        const [pipeline] = seeded;
        const { askModel } = fakeAskModel({
            stopReason: 'end_turn',
            output: JSON.stringify({
                answer: 'Pipeline Conquest, a 5-star Puzzle game by Hasbro.',
                gameIds: [pipeline.id],
                games: [{ id: pipeline.id, title: 'Invented', category: 'Puzzle', publisher: 'Hasbro', starRating: 5 }],
            }),
        });
        const result = await answerConcierge(db, question('Which strategy game?'), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(200);
        expect(result.body).toEqual({
            answer: 'Pipeline Conquest, a 5-star Puzzle game by Hasbro.',
            games: [
                {
                    id: pipeline.id,
                    title: 'Pipeline Conquest',
                    description: 'About Pipeline Conquest',
                    category: 'Strategy',
                    publisher: 'CodeForge Studios',
                    starRating: 4.5,
                    ratingLabel: formatStarRating(4.5),
                },
            ],
        });
    });

    it('drops the game ids that are not in the catalog', async () => {
        const [pipeline] = seeded;
        const { askModel } = fakeAskModel(answerReply('Try these.', [99999, pipeline.id]));
        const result = await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        expect(recommendedTitles(result)).toEqual(['Pipeline Conquest']);
    });

    it('merges duplicate game ids', async () => {
        const [pipeline, merge] = seeded;
        const { askModel } = fakeAskModel(answerReply('Try these.', [merge.id, pipeline.id, merge.id]));
        const result = await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        expect(recommendedTitles(result)).toEqual(['Merge Conflict Mystery', 'Pipeline Conquest']);
    });

    it("keeps the model's order", async () => {
        const [pipeline, merge, gitGud] = seeded;
        const { askModel } = fakeAskModel(answerReply('Try these.', [gitGud.id, pipeline.id, merge.id]));
        const result = await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        expect(recommendedTitles(result)).toEqual(['Git Gud', 'Pipeline Conquest', 'Merge Conflict Mystery']);
    });

    it('returns no recommendation for an empty gameIds', async () => {
        const { askModel } = fakeAskModel(answerReply('Which genre do you like?', []));
        const result = await answerConcierge(db, question('Recommend me a good game'), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(200);
        expect(recommendedTitles(result)).toEqual([]);
    });

    it('returns 502 when the model call fails', async () => {
        const { askModel } = fakeAskModel(new Error('provider down'));
        const result = await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(502);
        expect(result.body).toEqual({ error: expect.any(String) });
    });

    it.each<[string, ModelReply]>([
        ['the model refuses to answer', { stopReason: 'refusal', output: '{"answer": "No.", "gameIds": []}' }],
        ['the model stops on the token limit', { stopReason: 'max_tokens', output: '{"answer": "Try", "gameIds": []}' }],
        ['the output is not JSON', { stopReason: 'end_turn', output: 'Try Pipeline Conquest.' }],
        ['the output has no answer', { stopReason: 'end_turn', output: '{"gameIds": []}' }],
        ['the answer is not text', { stopReason: 'end_turn', output: '{"answer": 42, "gameIds": []}' }],
        ['gameIds is missing', { stopReason: 'end_turn', output: '{"answer": "Try these."}' }],
        ['gameIds is not a list', { stopReason: 'end_turn', output: '{"answer": "Try these.", "gameIds": 1}' }],
        ['gameIds holds a decimal', { stopReason: 'end_turn', output: '{"answer": "Try these.", "gameIds": [1.5]}' }],
        ['gameIds holds a string', { stopReason: 'end_turn', output: '{"answer": "Try these.", "gameIds": ["1"]}' }],
        // The page sends the answer back as a Concierge message, so it must pass the conversation rules.
        ['the answer is empty', { stopReason: 'end_turn', output: '{"answer": "", "gameIds": []}' }],
        ['the answer is only whitespace', { stopReason: 'end_turn', output: '{"answer": "  \\n ", "gameIds": []}' }],
        ['the answer is over 4,000 characters', { stopReason: 'end_turn', output: JSON.stringify({ answer: 'a'.repeat(4001), gameIds: [] }) }],
    ])('returns 502, inviting to try again, when %s', async (_label, reply) => {
        const { askModel } = fakeAskModel(reply);
        const result = await answerConcierge(db, question('Which game?'), { apiKey: API_KEY, askModel });
        expect(result.status).toBe(502);
        expect(result.body).toEqual({ error: expect.stringMatching(/try again/i) });
    });
});

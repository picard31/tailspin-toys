import { test, expect } from '@playwright/test';

test.describe('Games API', () => {
    test('GET /api/games/:id - returns the game as JSON', async ({ request }) => {
        const response = await request.get('/api/games/1');

        expect(response.status()).toBe(200);
        expect(await response.json()).toMatchObject({
            id: 1,
            title: expect.any(String),
            category: { id: expect.any(Number), name: expect.any(String) },
            publisher: { id: expect.any(Number), name: expect.any(String) },
        });
    });

    test('GET /api/games/:id - returns a 404 for an unknown game', async ({ request }) => {
        const response = await request.get('/api/games/99999');

        expect(response.status()).toBe(404);
        expect(await response.json()).toEqual({ error: expect.any(String) });
    });

    test('GET /api/games/:id - returns a 400 when the id is not a number', async ({ request }) => {
        const response = await request.get('/api/games/abc');

        expect(response.status()).toBe(400);
        expect(await response.json()).toEqual({ error: expect.any(String) });
    });
});

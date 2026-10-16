import type { APIRoute } from 'astro';
import { getDatabase } from '../../../lib/db';
import { getGameById } from '../../../lib/games';

// Rendered on demand by the Node adapter, like the home page; the other pages are prerendered.
export const prerender = false;

/** GET /api/games/:id: the game as JSON, or `{ error }` with a 400 or 404 status. */
export const GET: APIRoute = async ({ params }) => {
    if (!/^\d+$/.test(params.id ?? '')) {
        return Response.json({ error: 'The game id must be a number.' }, { status: 400 });
    }

    const game = await getGameById(getDatabase(), Number(params.id));
    if (!game) {
        return Response.json({ error: `No game with id ${params.id}.` }, { status: 404 });
    }

    return Response.json(game);
};

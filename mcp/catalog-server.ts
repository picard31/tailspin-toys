/**
 * MCP server, over stdio, that exposes the Tailspin Toys catalog read-only.
 *
 * The catalog logic lives in `src/lib/games.ts`, where Vitest covers it; this
 * file only maps it to two MCP tools. It reads the seeded `tailspin.db` at the
 * repository root, or `DATABASE_URL` when set.
 *
 * Run with: `npx tsx mcp/catalog-server.ts` (after `npm run db:setup`). Not
 * through an npm script: its banner would go to stdout, which carries the protocol.
 */

import { existsSync } from 'node:fs';
import { McpServer, type CallToolResult } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod';
import { createDatabase } from '../src/lib/db';
import { getGameById, searchGames } from '../src/lib/games';

// Resolved from this file, since MCP clients may launch the server from any directory.
const databaseFile = new URL('../tailspin.db', import.meta.url);

if (!process.env.DATABASE_URL && !existsSync(databaseFile)) {
    // stdout carries the protocol: diagnostics go to stderr.
    console.error('tailspin.db is missing: run `npm run db:setup` first.');
    process.exit(1);
}

const db = createDatabase(process.env.DATABASE_URL ?? databaseFile.href);

/** A tool result whose single text block is the value as JSON. */
function jsonResult(value: unknown): CallToolResult {
    return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

function createCatalogServer(): McpServer {
    const server = new McpServer({ name: 'tailspin-catalog', version: '0.0.1' });

    server.registerTool(
        'search_games',
        {
            title: 'Search games',
            description:
                'Search the Tailspin Toys catalog. Returns, as JSON and ordered by title, the games whose title, ' +
                'category or publisher contains the query, ignoring case. Descriptions are not searched.',
            inputSchema: z.object({
                query: z.string().trim().min(1).describe('Text to look for, such as "strategy" or "CodeForge".'),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        async ({ query }) => jsonResult(await searchGames(db, query)),
    );

    server.registerTool(
        'get_game',
        {
            title: 'Get game',
            description:
                'Get one game of the Tailspin Toys catalog by id, as JSON: title, description, category, ' +
                'publisher and star rating.',
            inputSchema: z.object({
                id: z.number().int().positive().describe('The game id, as returned by search_games.'),
            }),
            annotations: { readOnlyHint: true, openWorldHint: false },
        },
        async ({ id }) => {
            const game = await getGameById(db, id);
            if (!game) {
                return { content: [{ type: 'text', text: `No game with id ${id}.` }], isError: true };
            }
            return jsonResult(game);
        },
    );

    return server;
}

serveStdio(createCatalogServer);

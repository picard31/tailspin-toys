import type { Database } from './db';
import { getAllGames } from './games';
import { serializeCatalogExport, toCatalogExport, type CatalogExport, type CatalogGame } from '../../db/export-catalog';

/** One message of a conversation with the Concierge: the visitor asks, the Concierge answers. */
export interface ConciergeMessage {
    role: 'user' | 'assistant';
    content: string;
}

/** What the model sends back: why it stopped, and its structured output as raw text, not validated. */
export interface ModelReply {
    stopReason: string | null;
    output: string;
}

/** Ask the model; throws when the provider fails. */
export type AskModel = (system: string, messages: ConciergeMessage[]) => Promise<ModelReply>;

export interface ConciergeOptions {
    /** The API key read by the route; absent or empty means the Concierge is not configured. */
    apiKey: string | undefined;
    askModel: AskModel;
}

/** The answer shown to the visitor, with the recommended games as the catalog describes them. */
export interface ConciergeAnswer {
    answer: string;
    games: CatalogGame[];
}

export interface ConciergeError {
    error: string;
}

export type ConciergeResult =
    | { status: 200; body: ConciergeAnswer }
    | { status: 400 | 502 | 503; body: ConciergeError };

/** The JSON schema of the model's structured output, used by the route. */
export const CONCIERGE_OUTPUT_SCHEMA = {
    type: 'object',
    properties: {
        answer: { type: 'string', description: 'The plain-text answer shown to the visitor.' },
        gameIds: {
            type: 'array',
            items: { type: 'integer' },
            description: 'The ids of the recommended catalog games, in the order the answer mentions them.',
        },
    },
    required: ['answer', 'gameIds'],
    additionalProperties: false,
} as const;

const CONCIERGE_RULES = [
    'You are the Backer Concierge of Tailspin Toys, a crowdfunding platform for games.',
    'You help visitors find games to back, using only the catalog below.',
    '',
    'Rules:',
    '- Recommend only games from the catalog, by putting their ids in `gameIds`, in the order your answer mentions them.',
    '- In `answer`, name only the games whose ids are in `gameIds`.',
].join('\n');

const NOT_CONFIGURED = 'The Backer Concierge is not configured: no API key is set on this server.';
const UNREADABLE_REQUEST = 'The request must be JSON with a `messages` list ending with your question.';
const MODEL_FAILED = 'The Backer Concierge could not answer right now. Please try again.';

/** The system prompt: the rules, then the whole catalog. The same catalog always gives the same text. */
function buildSystemPrompt(catalog: CatalogExport): string {
    return `${CONCIERGE_RULES}\n\n<catalog>\n${serializeCatalogExport(catalog)}</catalog>`;
}

/** The visitor's question, read from the raw request body, or null when there is none to read. */
function readQuestion(body: string): ConciergeMessage | null {
    let request: unknown;
    try {
        request = JSON.parse(body);
    } catch {
        return null;
    }

    const messages = (request as { messages?: unknown } | null)?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
        return null;
    }

    const last: unknown = messages[messages.length - 1];
    const { role, content } = (last ?? {}) as { role?: unknown; content?: unknown };
    return role === 'user' && typeof content === 'string' ? { role, content } : null;
}

/** The model's answer, read from its raw structured output, or null when it has none. */
function readAnswer(output: string): string | null {
    try {
        const { answer } = JSON.parse(output) as { answer?: unknown };
        return typeof answer === 'string' ? answer : null;
    } catch {
        return null;
    }
}

/**
 * Everything `POST /api/concierge` does, except calling the model: check the key, read the
 * question, build the catalog and the system prompt, ask the model and shape its answer.
 */
export async function answerConcierge(
    db: Database,
    body: string,
    { apiKey, askModel }: ConciergeOptions,
): Promise<ConciergeResult> {
    if (!apiKey) {
        return { status: 503, body: { error: NOT_CONFIGURED } };
    }

    const question = readQuestion(body);
    if (!question) {
        return { status: 400, body: { error: UNREADABLE_REQUEST } };
    }

    const catalog = toCatalogExport(await getAllGames(db));
    let reply: ModelReply;
    try {
        reply = await askModel(buildSystemPrompt(catalog), [question]);
    } catch {
        return { status: 502, body: { error: MODEL_FAILED } };
    }

    const answer = readAnswer(reply.output);
    if (answer === null) {
        return { status: 502, body: { error: MODEL_FAILED } };
    }

    return { status: 200, body: { answer, games: [] } };
}

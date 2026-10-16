import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import Anthropic from '@anthropic-ai/sdk';
import { getDatabase } from '../../lib/db';
import { answerConcierge, CONCIERGE_OUTPUT_SCHEMA, type AskModel } from '../../lib/concierge';

// Rendered on demand by the Node adapter, while the pages are prerendered.
export const prerender = false;

/** Ask Claude through the SDK. The client is built at call time, with this key and no other credential. */
function askClaude(apiKey: string): AskModel {
    return async (system, messages) => {
        const client = new Anthropic({ apiKey, authToken: null });
        const response = await client.beta.messages.create({
            model: 'claude-opus-5-5',
            max_tokens: 8000,
            betas: ['server-side-fallback-2026-07-01'],
            fallbacks: 'default',
            output_config: {
                effort: 'low',
                format: { type: 'json_schema', schema: CONCIERGE_OUTPUT_SCHEMA },
            },
            // The system prompt is the same for every question, so it is cached.
            system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
            messages,
        });
        const output = response.content.map((block) => (block.type === 'text' ? block.text : '')).join('');
        return { stopReason: response.stop_reason, output };
    };
}

/** POST /api/concierge: the Concierge's answer as JSON, or `{ error }` with a 400, 502 or 503 status. */
export const POST: APIRoute = async ({ request }) => {
    const apiKey = getSecret('ANTHROPIC_API_KEY');
    // answerConcierge never calls askModel without a key.
    const result = await answerConcierge(getDatabase(), await request.text(), {
        apiKey,
        askModel: askClaude(apiKey ?? ''),
    });
    return Response.json(result.body, { status: result.status });
};

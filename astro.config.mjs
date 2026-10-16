// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    // Pages are prerendered at build time; a route that exports
    // `prerender = false` is rendered on demand by the Node adapter.
    output: 'static',
    adapter: node({ mode: 'standalone' }),

    env: {
        schema: {
            // The Backer Concierge's key, read from `.env` at request time; never in the build or the browser.
            ANTHROPIC_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
        },
    },

    vite: {
        plugins: [tailwindcss()],
    },
});

// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    // Pages are prerendered at build time; a route that exports
    // `prerender = false` is rendered on demand by the Node adapter.
    output: 'static',
    adapter: node({ mode: 'standalone' }),

    vite: {
        plugins: [tailwindcss()],
    },
});

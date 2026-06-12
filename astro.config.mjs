// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  integrations: [react()],

  vite: {
    // @ts-expect-error - @tailwindcss/vite resolves a different (hoisted) vite version than astro's bundled vite, causing a Plugin type mismatch; harmless at runtime.
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  })
});
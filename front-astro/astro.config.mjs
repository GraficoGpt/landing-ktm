// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node'; // Asegúrate de que esta línea esté correctamente importada

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'server',
  adapter: node({
    mode: 'standalone', // Usa el modo standalone para Railway
  }),
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 4321
  }
});


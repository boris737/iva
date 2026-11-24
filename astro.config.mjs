import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://iva-hristova.vercel.app',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'auto' },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});

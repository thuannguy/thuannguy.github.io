// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.thuannguy.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  redirects: {
    '/about/': '/',
    '/archive/': '/blog/',
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});

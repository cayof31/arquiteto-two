import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://studio-suzana-loroff.micro-sass.com');

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Túnel Quick Tunnel muda de host a cada `cloudflared`. O ponto libera o domínio e subdomínios.
      allowedHosts: ['.trycloudflare.com'],
    },
  },
  image: { responsiveStyles: true },
});

# Cloudflare Images (Free) + R2 + Worker

Originais no R2. O Worker `studio-suzana-loroff-midia` redimensiona com o plano **Free** de transformações (5.000/mês **por conta**, não por bucket).

```bash
npx wrangler login
pnpm midia:bucket
pnpm midia:upload
pnpm midia:deploy
```

Depois copie a URL `*.workers.dev` para `.env`:

```
PUBLIC_IMAGE_BASE=https://studio-suzana-loroff-midia.<conta>.workers.dev
```

`pnpm build` com essa variável **não** gera AVIF local — o HTML só aponta para o Worker.

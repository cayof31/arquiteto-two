# Studio Suzana Loroff

Modelo de site para arquiteto — home com retrato e escritório. Demo independente, feito em Astro.

```bash
pnpm install
pnpm dev
```

Persona, WhatsApp e e-mail ficam em `src/config/site.ts`. Retratos em `src/assets/suzana/`.

## Imagens (Cloudflare Free + R2 + Worker)

O limite de **5.000 transformações/mês é por conta Cloudflare**, não por R2 nem por Worker. Outros sites na mesma conta somam nesse número. R2 (10 GB) e Workers (requisições) também são cotas da conta.

```bash
npx wrangler login
pnpm midia:bucket
pnpm midia:upload
pnpm midia:deploy
```

Crie `.env` com a URL impressa no deploy:

```
PUBLIC_IMAGE_BASE=https://studio-suzana-loroff-midia.<conta>.workers.dev
```

Com isso o `pnpm build` não reprocessa JPEG localmente.

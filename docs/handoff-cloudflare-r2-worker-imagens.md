# Handoff: Cloudflare R2 + Worker + Images Free

Documento para outra LLM replicar o pipeline de imagens em **outro projeto** (ex.: ibagtech). Não copiar nomes de bucket/worker/persona deste site. Copiar o **padrão**.

Este texto descreve o que foi feito no Studio Liz (`arquiteto_two`, Astro 5 estático). O site serve HTML estático; as fotos **não** são otimizadas no `astro build` quando a variável de ambiente está ligada. Originais ficam no R2. Um Worker lê o objeto, redimensiona com o binding `IMAGES` (plano Free) e devolve AVIF/WebP/JPEG.

## O que NÃO foi usado

- **Não** é o produto pago “Cloudflare Images” com upload pelo dashboard e URL `imagedelivery.net`.
- **Não** é R2 público com domínio customizado servindo o JPEG cru.
- **Não** é `next/image` / Sharp / `astro:assets` Picture no **build de produção** (isso só fica de fallback local, sem `PUBLIC_IMAGE_BASE`).
- **Não** gera variantes AVIF no CI. O build só emite `<img srcset>` apontando para o Worker.

## Arquitetura

```
src/assets/<chave>          originais no git (dev / fallback)
        │
        ▼  wrangler r2 object put
R2 bucket (privado)         mesma chave, ex. projetos/casa-praca/capa.jpg
        │
        ▼  GET /projetos/casa-praca/capa.jpg?w=960
Worker  ├─ caches.default (Cache API)
        ├─ MEDIA.get(chave)          binding R2
        ├─ IMAGES.input().transform({width}).output({format, quality})
        └─ Response AVIF/WebP/JPEG + Cache-Control 30d
        │
HTML    <img src="https://<worker>.workers.dev/<chave>?w=960"
             srcset="...480w, ...960w, ...1440w">
```

URL canônica:

```
https://<nome-do-worker>.<subdomínio-da-conta>.workers.dev/<chave-r2>?w=<480|960|1440>
```

Exemplo real deste projeto:

```
https://studio-suzana-loroff-midia.cayofelipe31.workers.dev/suzana/retrato.jpg?w=960
```

O browser manda `Accept: image/avif` (ou webp). O Worker escolhe o formato. Primeira visita conta **1 transformação única** (fonte + opções). Depois o Cache API e o `Cache-Control` evitam reprocessar.

## Por que isso (e cotas)

Objetivo: fotos leves (AVIF) **sem** gastar minutos de Sharp no build e **sem** plano pago.

Limites **são da conta Cloudflare inteira**, não por bucket, não por Worker, não por site. Outro projeto na mesma conta **soma** nas mesmas cotas.

| Recurso | Free (conta) | Papel aqui |
|---|---|---|
| Images transformations | **5.000 transformações únicas / mês** | Cada par `(objeto R2 + width + format)` novo conta. Cache posterior não reconta o mesmo par. |
| R2 | 10 GB storage; Class A/B com cota free | Só originais. Poucos MB. |
| Workers | 100k req/dia no free | Entrega HTTP. |

**Obrigatório para não estourar as 5k:** whitelist de `w`. Só `480`, `960`, `1440`. Qualquer outro valor vira `960`. Sem isso, `?w=481`, `?w=482`… queima a cota.

Larguras: 3. Formatos: até 3 (avif/webp/jpeg). Por foto, no pior caso, **9 transformações únicas**. Dezenas de fotos cabem folgado no Free. Não exponha `w` livre nem `quality` livre.

## Auth: duas OAuth diferentes

1. **Cloudflare MCP** (dashboard/API via Cursor) ≠ **Wrangler CLI**.
2. MCP **consegue criar** bucket R2 em alguns fluxos; **não** usamos MCP para upload nem deploy. Upload e deploy foram com CLI.
3. Login do Wrangler:

```bash
npx wrangler login
```

Isso abre OAuth no browser (localhost, porta tipo `8976`). Sem esse login, `r2 object put` e `wrangler deploy` falham mesmo com MCP autenticado.

## Recursos Cloudflare criados (renomear no outro projeto)

| Tipo | Nome neste repo | Binding no Worker |
|---|---|---|
| R2 bucket | `studio-suzana-loroff` | `MEDIA` |
| Worker | `studio-suzana-loroff-midia` | — |
| Images | (nenhum recurso nomeado) | `IMAGES` em `wrangler.jsonc` |

No ibagtech: nomes tipo `ibagtech-midia` / `ibagtech-media`. Bucket **privado** (sem acesso público direto). Só o Worker lê.

## Layout de arquivos (copiar a ideia)

```
workers/midia/wrangler.jsonc
workers/midia/src/index.ts
workers/midia/src/chaves.ts          # regex da chave + larguras
scripts/upload-r2.sh                 # sobe src/assets → R2 com a mesma chave
src/lib/midia.ts                     # urlMidia / srcsetMidia (espelha as regras)
src/components/midia/Foto.astro      # no Next: um <img> com srcset, NÃO next/image
.env                                 # PUBLIC_IMAGE_BASE=https://….workers.dev  (gitignored)
.env.example                         # placeholder, sem URL real da conta se não quiser
```

`.gitignore` **precisa** ter `.env` e `.wrangler/`.

`package.json` (scripts; ajustar nomes):

```json
{
  "scripts": {
    "midia:dev": "wrangler dev --config workers/midia/wrangler.jsonc",
    "midia:bucket": "wrangler r2 bucket create NOME-DO-BUCKET",
    "midia:upload": "bash scripts/upload-r2.sh",
    "midia:deploy": "wrangler deploy --config workers/midia/wrangler.jsonc"
  },
  "devDependencies": {
    "wrangler": "^4.135.0"
  }
}
```

No Astro, `PUBLIC_IMAGE_BASE` entra no client porque o prefixo `PUBLIC_` é inlined no build. No **Next.js**, use `NEXT_PUBLIC_IMAGE_BASE` (ou o equivalente do bundler do ibagtech). Sem a var, o site deve continuar funcionando com arquivos locais.

## wrangler.jsonc

```jsonc
{
  "$schema": "../../node_modules/wrangler/config-schema.json",
  "name": "NOME-DO-WORKER",
  "main": "src/index.ts",
  "compatibility_date": "2026-09-18",
  "observability": { "enabled": true },
  "cache": { "enabled": true },
  "images": { "binding": "IMAGES" },
  "r2_buckets": [
    { "binding": "MEDIA", "bucket_name": "NOME-DO-BUCKET" }
  ]
}
```

O binding `images` é o que habilita `env.IMAGES`. Sem isso o Worker quebra no transform.

## Chaves R2 = caminho relativo dos assets

Convenção: a chave **é** o path depois de `src/assets/`.

| Arquivo local | Chave R2 / `src` no componente |
|---|---|
| `src/assets/suzana/retrato.jpg` | `suzana/retrato.jpg` |
| `src/assets/projetos/casa-praca/capa.jpg` | `projetos/casa-praca/capa.jpg` |

No CMS/markdown, guardar **string da chave**, não `import` de imagem e não URL absoluta. O componente de foto recebe essa string.

Whitelist no Worker (adaptar prefixos do ibagtech):

```ts
export const LARGURAS = [480, 960, 1440] as const;

const CHAVE =
  /^(suzana|projetos)\/[a-z0-9][a-z0-9./_-]*\.(jpg|jpeg|png|webp|avif)$/i;

export function chaveValida(chave: string): boolean {
  return CHAVE.test(chave) && !chave.includes('..');
}

export function larguraPermitida(valor: string | null): number {
  const numero = Number(valor);
  if ((LARGURAS as readonly number[]).includes(numero)) return numero;
  return 960;
}

export function formatoSaida(accept: string): 'image/avif' | 'image/webp' | 'image/jpeg' {
  if (accept.includes('image/avif')) return 'image/avif';
  if (accept.includes('image/webp')) return 'image/webp';
  return 'image/jpeg';
}
```

Regras que o regex garante:

- prefixo conhecido (aqui `suzana/` ou `projetos/`)
- sem `..` (path traversal)
- extensão de imagem
- lowercase-ish path (`a-z0-9./_-`)

No ibagtech, trocar o grupo `(suzana|projetos)` por prefixos reais (`produtos/`, `blog/`, etc.). **Manter** o `!chave.includes('..')`.

Helpers do site (mesmo contrato do Worker):

```ts
export function urlMidia(base: string, chave: string, largura: 480 | 960 | 1440): string {
  const origem = base.replace(/\/$/, '');
  return `${origem}/${chave}?w=${largura}`;
}

export function srcsetMidia(base: string, chave: string): string {
  return [480, 960, 1440]
    .map((largura) => `${urlMidia(base, chave, largura)} ${largura}w`)
    .join(', ');
}
```

HTML gerado:

```html
<img
  src="https://WORKER/projetos/casa-praca/capa.jpg?w=960"
  srcset="
    https://WORKER/projetos/casa-praca/capa.jpg?w=480 480w,
    https://WORKER/projetos/casa-praca/capa.jpg?w=960 960w,
    https://WORKER/projetos/casa-praca/capa.jpg?w=1440 1440w
  "
  sizes="(min-width: 768px) 45vw, 100vw"
  alt="..."
  loading="lazy"
  decoding="async"
/>
```

Hero/LCP: `loading="eager"` + `fetchpriority="high"`.

**Next.js:** se `NEXT_PUBLIC_IMAGE_BASE` existir, **não** passe essa URL por `next/image` (o optimizer da Vercel/Sharp processaria de novo e poderia contar transform no Cloudflare **e** no host). Use `<img>` nativo com `srcSet`/`sizes`.

## Worker — código e bug crítico

```ts
import { chaveValida, formatoSaida, larguraPermitida } from './chaves';

export interface Env {
  MEDIA: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(opts: { width: number }): {
        output(opts: { format: 'image/avif' | 'image/webp' | 'image/jpeg'; quality: number }): Promise<{
          response(init?: { headers?: HeadersInit }): Response;
        }>;
      };
    };
  };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: CORS });
    }

    const url = new URL(request.url);
    const chave = decodeURIComponent(url.pathname.replace(/^\//, ''));
    if (!chaveValida(chave)) {
      return new Response('Not found', { status: 404, headers: CORS });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: 'GET', headers: request.headers });
    const hit = await cache.match(cacheKey);
    if (hit) return hit;

    const objeto = await env.MEDIA.get(chave);
    if (!objeto) {
      return new Response('Not found', { status: 404, headers: CORS });
    }

    const bytes = await objeto.arrayBuffer();
    const largura = larguraPermitida(url.searchParams.get('w'));
    const format = formatoSaida(request.headers.get('Accept') ?? '');

    let resposta: Response;
    try {
      const resultado = await env.IMAGES.input(new Blob([bytes]).stream())
        .transform({ width: largura })
        .output({ format, quality: 80 });
      resposta = resultado.response({
        headers: {
          ...CORS,
          'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400',
        },
      });
    } catch {
      resposta = new Response(bytes, {
        headers: {
          ...CORS,
          'Content-Type': objeto.httpMetadata?.contentType ?? 'image/jpeg',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    ctx.waitUntil(cache.put(cacheKey, resposta.clone()));
    return resposta;
  },
};
```

### Bug que gerou HTTP 1101

**Errado** (quebra em runtime, exception 1101):

```ts
const resposta = await env.IMAGES.input(stream)
  .transform({ width })
  .output({ format, quality: 80 })
  .response({ headers });
```

`.output()` devolve **Promise**. Encadear `.response()` nessa Promise não chama o método certo.

**Certo:**

```ts
const resultado = await env.IMAGES.input(stream)
  .transform({ width })
  .output({ format, quality: 80 });
const resposta = resultado.response({ headers });
```

Primeiro `await` no `output()`, depois `.response()`.

### Outros detalhes do Worker

- `caches.default` + `cacheKey` incluindo headers: AVIF e WebP podem coexistir (Accept diferente).
- Fallback: se `IMAGES` falhar, devolve o JPEG original do R2 (pior qualidade, mas a página não quebra).
- CORS `*` porque o HTML estático pode estar em outro host (Vercel, Render, Pages) e as imagens no `workers.dev`.
- Só GET/HEAD/OPTIONS. Sem upload HTTP no Worker (upload é `wrangler r2 object put`).
- `quality: 80`. Retrato de exemplo saiu ~33 KB em AVIF.

## Upload para o R2

Script `scripts/upload-r2.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

BUCKET="${R2_BUCKET:-NOME-DO-BUCKET}"
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$RAIZ/src/assets"

WRANGLER=(pnpm exec wrangler)

echo "Criando bucket $BUCKET se ainda não existir..."
"${WRANGLER[@]}" r2 bucket create "$BUCKET" >/dev/null 2>&1 || true

find "$ASSETS" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) | while read -r arquivo; do
  chave="${arquivo#"$ASSETS"/}"
  echo "↑ $chave"
  "${WRANGLER[@]}" r2 object put "$BUCKET/$chave" --file "$arquivo" --remote --content-type "image/jpeg"
done

echo "Pronto. Objetos em r2://$BUCKET"
```

`--remote` é obrigatório para ir à conta de verdade (sem isso pode ir no R2 local do `wrangler dev`).

Content-type: este script marca tudo `image/jpeg` porque o acervo era JPEG. Se o ibagtech tiver PNG, detectar MIME pelo arquivo (`file --mime-type` ou extensão). O Worker de fallback usa `objeto.httpMetadata.contentType`.

## Passo a passo para o outro projeto

1. Instalar `wrangler` (devDependency). `npx wrangler login`.
2. Criar `workers/midia/` com `wrangler.jsonc`, `index.ts`, `chaves.ts`. Ajustar `name`, `bucket_name` e regex de prefixo.
3. `pnpm midia:bucket` (ou o `r2 bucket create` do script).
4. Colocar originais em `src/assets/...` com as chaves finais. Não mudar a chave depois sem reupload.
5. `pnpm midia:upload`.
6. `pnpm midia:deploy`. Copiar a URL `https://<worker>.<conta>.workers.dev` impressa no deploy.
7. Testar no browser ou curl:

```bash
curl -I -H 'Accept: image/avif' \
  'https://WORKER/prefixo/arquivo.jpg?w=960'
```

Esperado: **200**, `content-type: image/avif`, body pequeno. Se 404: chave errada ou upload não foi `--remote`. Se 1101: bug do `await output()`.

8. `.env` **local e de produção do site** (não commitar):

```
PUBLIC_IMAGE_BASE=https://NOME-DO-WORKER.SUBDOMINIO.workers.dev
```

No Next: `NEXT_PUBLIC_IMAGE_BASE=...`

9. Componente de foto: se a var existe → `<img srcset>` para o Worker; senão → optimizer local (Astro `Picture` / `next/image` em arquivo importado).
10. Build do site **com** a var: não deve gerar centenas de variantes Sharp. Neste repo, sem a var o `astro build` chegou a ~852 e depois ~492 variantes (~9 min). Com a var, o HTML só aponta URLs.

## Componente Astro (referência; reescrever em React no ibagtech)

Quando `PUBLIC_IMAGE_BASE` está setado, **ignora** `astro:assets`. Quando não está, usa `import.meta.glob` em `src/assets` e `Picture` (Sharp) — só para `pnpm dev` sem Cloudflare.

Props: `src` (chave string), `alt`, `sizes`, `prioridade?`, `eager?`.

Não passar objeto `ImageMetadata` no CMS. Sempre string.

## Testes (vale copiar a ideia)

- chave válida vs `../etc/passwd.jpg` e `pasta/../x.jpg`
- `larguraPermitida('2000') === 960`
- `urlMidia` / `srcsetMidia` com e sem barra final na base

## Checklist de adaptação ibagtech

- [ ] Nomes novos de Worker e bucket (não reutilizar `studio-suzana-loroff*`)
- [ ] Regex de chave com os prefixos do ibagtech
- [ ] Variável pública do bundler (`NEXT_PUBLIC_…` se for Next)
- [ ] `<img srcSet>` nativo em produção; sem passar o Worker por optimizer de imagem do host
- [ ] `.env` gitignored
- [ ] Upload `--remote` depois de `wrangler login`
- [ ] Confirmar 200 AVIF com curl antes de ligar o front
- [ ] `await` no `.output()` **antes** de `.response()`
- [ ] Só 3 larguras
- [ ] Mesma conta Cloudflare = mesma cota de 5k; se o ibagtech for grande, somar fotos × 9 e ver se cabe, ou usar outra conta / plano pago

## O que ficou de fora (YAGNI)

- Domínio custom no Worker (`img.ibagtech.com`) — `workers.dev` basta no Free.
- Auth no Worker (as chaves são previsíveis; fotos de portfólio são públicas).
- Upload via HTTP/API.
- Webhook, filas, variantes pré-geradas no R2.
- Cloudflare Images (produto) e `imagedelivery.net`.

Se o ibagtech precisar de fotos privadas (área logada), este desenho **não** serve: CORS `*` + URL adivinhável. Aí precisa de URL assinada ou Worker que cheque cookie/JWT antes do `MEDIA.get`.

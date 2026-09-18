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

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

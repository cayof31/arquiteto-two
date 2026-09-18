export const LARGURAS = [480, 960, 1440] as const;

export type LarguraMidia = (typeof LARGURAS)[number];

const CHAVE =
  /^(suzana|projetos)\/[a-z0-9][a-z0-9./_-]*\.(jpg|jpeg|png|webp|avif)$/i;

export function chaveValida(chave: string): boolean {
  return CHAVE.test(chave) && !chave.includes('..');
}

export function larguraPermitida(valor: string | null): LarguraMidia {
  const numero = Number(valor);
  if ((LARGURAS as readonly number[]).includes(numero)) {
    return numero as LarguraMidia;
  }
  return 960;
}

export function urlMidia(base: string, chave: string, largura: LarguraMidia): string {
  const origem = base.replace(/\/$/, '');
  return `${origem}/${chave}?w=${largura}`;
}

export function srcsetMidia(base: string, chave: string): string {
  return LARGURAS.map((largura) => `${urlMidia(base, chave, largura)} ${largura}w`).join(', ');
}

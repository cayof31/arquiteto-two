import { describe, expect, it } from 'vitest';
import { chaveValida, larguraPermitida, srcsetMidia, urlMidia } from './midia';

describe('midia', () => {
  it('aceita chaves do portfólio e recusa path traversal', () => {
    expect(chaveValida('suzana/retrato.jpg')).toBe(true);
    expect(chaveValida('projetos/casa-praca/capa.jpg')).toBe(true);
    expect(chaveValida('../etc/passwd.jpg')).toBe(false);
    expect(chaveValida('suzana/../retrato.jpg')).toBe(false);
  });

  it('só usa as três larguras do srcset', () => {
    expect(larguraPermitida('480')).toBe(480);
    expect(larguraPermitida('2000')).toBe(960);
    expect(larguraPermitida(null)).toBe(960);
  });

  it('monta URL e srcset no worker', () => {
    expect(urlMidia('https://img.example', 'suzana/retrato.jpg', 960)).toBe(
      'https://img.example/suzana/retrato.jpg?w=960',
    );
    expect(srcsetMidia('https://img.example/', 'suzana/retrato.jpg')).toContain('480w');
    expect(srcsetMidia('https://img.example/', 'suzana/retrato.jpg')).toContain('1440w');
  });
});

import { describe, expect, it } from 'vitest';
import { linkWhatsapp } from './whatsapp';

describe('linkWhatsapp', () => {
  it('monta o endereço com o número do ateliê', () => {
    expect(linkWhatsapp('Olá')).toBe('https://wa.me/5511999999999?text=Ol%C3%A1');
  });

  it('codifica acentos, espaços e quebras de linha', () => {
    const url = linkWhatsapp('Olá!\nData: 12/06');
    expect(url).toContain('Ol%C3%A1!');
    expect(url).toContain('%0A');
    expect(url).not.toContain(' ');
  });

  it('recusa mensagem vazia para não abrir conversa sem texto', () => {
    expect(() => linkWhatsapp('   ')).toThrow('mensagem vazia');
  });
});

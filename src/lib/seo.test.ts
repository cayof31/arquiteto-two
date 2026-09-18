import { describe, expect, it } from 'vitest';
import { fichaEscritorio, fichaPessoa } from './seo';

const url = 'https://studio-suzana-loroff.micro-sass.com';

describe('JSON-LD', () => {
  it('descreve a arquiteta como Person', () => {
    const ficha = fichaPessoa(url);
    expect(ficha['@type']).toBe('Person');
    expect(ficha.name).toBe('Suzana Loroff');
  });

  it('descreve o studio como ProfessionalService', () => {
    const ficha = fichaEscritorio(url);
    expect(ficha['@type']).toBe('ProfessionalService');
    expect(ficha.name).toBe('Studio Suzana Loroff');
    expect(ficha.founder).toEqual({ '@id': `${url}/#suzana` });
  });
});

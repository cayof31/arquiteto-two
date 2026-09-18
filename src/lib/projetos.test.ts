import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { obrasDestaque } from './projetos';

const pasta = join(process.cwd(), 'src/content/projetos');

function destaquesNosMarkdown(): number {
  return readdirSync(pasta)
    .filter((arquivo) => arquivo.endsWith('.md'))
    .filter((arquivo) => {
      const texto = readFileSync(join(pasta, arquivo), 'utf8');
      return /^destaque:\s*true\s*$/m.test(texto);
    }).length;
}

describe('obras em destaque', () => {
  it('filtra só os itens com destaque verdadeiro', () => {
    const lista = obrasDestaque([
      { slug: 'a', data: { destaque: true } },
      { slug: 'b', data: { destaque: false } },
      { slug: 'c', data: { destaque: true } },
    ]);
    expect(lista.map((obra) => obra.slug)).toEqual(['a', 'c']);
  });

  it('a collection tem exatamente três obras em destaque', () => {
    expect(destaquesNosMarkdown()).toBe(3);
  });
});

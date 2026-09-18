import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projetos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projetos' }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      categoria: z.string(),
      ano: z.number(),
      local: z.string(),
      descricao: z.string(),
      area: z.number(),
      materiais: z.array(z.string()).min(1),
      destaque: z.boolean().default(false),
      ordem: z.number().default(99),
      capa: image(),
      altCapa: z.string().min(10),
      galeria: z.array(image()).min(4).max(6),
      plantas: z.array(image()).max(2).default([]),
      fonte: z.object({
        nome: z.string(),
        url: z.string().url(),
      }),
    }),
});

export const collections = { projetos };

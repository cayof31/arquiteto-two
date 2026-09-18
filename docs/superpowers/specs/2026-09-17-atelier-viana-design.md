# Atelier Viana — segundo modelo de site para arquiteto

**Data:** 2026-09-17  
**Pasta:** `arquiteto_two`  
**Status:** aprovado para implementação

## Objetivo

Segundo modelo de portfólio para mostrar a arquitetos que preferem **rosto + escritório** na primeira página. É um demo independente do Studio Vértice: outra marca, outro visual, outro stack, zero import, symlink ou link entre os sites.

Helena Viana / Atelier Viana é persona fictícia e trocável. As 5 obras do outro projeto entram **copiadas** (fotos + textos) só como material de portfólio.

## Decisões

| Tema | Escolha |
|------|---------|
| Protagonista | Camadas: hero da pessoa, depois o ateliê |
| Marca | Persona nova + `src/config/site.ts` |
| Home | Retrato → sobre → escritório → 3 obras → contato |
| Visual | Ateliê quente (papel/creme), não o zinc/Playfair do Vértice |
| Fichas | Enxutas: capa, texto, galeria, dados técnicos |
| Contato | WhatsApp + e-mail no `site.ts` |
| Stack | Astro 5 estático, Tailwind 4, TypeScript, sem React |

## Arquitetura

App estático. Rotas: `/`, `/projetos`, `/projetos/[slug]`. Sem `/studio` e sem `/contato`. Escritório e contato são âncoras (`#sobre`, `#escritorio`, `#projetos`, `#contato`).

```
site.ts ──► páginas Astro
whatsapp.ts ──► CTAs wa.me
content/projetos/*.md ──► home (destaques) e fichas
src/assets (retratos Unsplash + obras copiadas) ──► <Picture>
```

Troca de cliente real: `site.ts` + pasta `src/assets/helena/`.

## Visual

- Fundo `#F4EFE6`, tinta `#2C2416`, acento `#8C4A32`, linha `#D9D0C3`
- Fraunces (títulos), Figtree (corpo)
- Header sticky claro, sem mix-blend
- Hero split: texto à esquerda, retrato à direita
- Cards de obra com hover suave

## Persona (demo)

- Nome: Helena Viana
- Ateliê: Atelier Viana
- Cidade: São Paulo
- WhatsApp: `5511999999999`
- E-mail: `contato@atelierviana.exemplo`

Retratos Unsplash **baixados** em `src/assets/helena/` (uma cara só no retrato; o resto é espaço):

- Retrato: `photo-1573496359142-b8d87734a5a2`
- Mesa/plantas: `photo-1503387762-592deb58ef4e`
- Ateliê vazio: `photo-1497366216548-37526070297c`

Não reutilizar a foto de escritório do Vértice (`photo-1497366811353-6870744d04b2`).

## Obras

Cinco projetos copiados (nunca importados do Next):

1. Casa Praça — destaque
2. Residência Caraçá — destaque
3. Hideout Leaf Villa — destaque
4. DR House
5. Armazém Comunitário Medellín

Collection: slug, título, categoria, ano, local, descrição, área, materiais, source ArchDaily, `destaque`, capa, galeria (4–6), plantas (0–2). Sem blocos ricos do v1.

## Componentes

- `layouts/Base.astro` — HTML, fontes, SEO, header/footer
- `Header.astro` / `Footer.astro` — nav, créditos Unsplash, “produzido por Cayo Felipe / micro-sass.com”
- Home: `Hero`, `Sobre`, `Escritorio`, `ObrasDestaque`, `Contato`
- `ObraCard`, `Galeria`
- Páginas: `index`, `projetos/index`, `projetos/[slug]`, `404`

Ficha: capa, título, meta (lugar · ano · m²), descrição, galeria, materiais, crédito ArchDaily. Sem JS de galeria.

## Erros, SEO, testes

- 404 no visual do ateliê, links para `/` e `/projetos`
- `lang="pt-BR"`, sitemap, robots, JSON-LD Person + ProfessionalService a partir de `site.ts`
- `SITE_URL` via env
- Vitest: `linkWhatsapp` recusa mensagem vazia; exatamente 3 obras com `destaque: true`
- `astro check` + `astro build`

## Fora de escopo

React, Resend, carrossel, processo, timeline, lightbox, i18n, CMS, pacote compartilhado com o outro repo.

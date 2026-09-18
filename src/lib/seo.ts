import { site } from '../config/site';

export function fichaPessoa(urlSite: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${urlSite}/#suzana`,
    name: site.arquiteta,
    jobTitle: site.cargo,
    url: urlSite,
    email: site.email,
    telephone: `+${site.telefoneWhatsapp}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.cidade,
      addressRegion: site.uf,
      addressCountry: 'BR',
    },
    worksFor: { '@id': `${urlSite}/#atelier` },
  };
}

export function fichaEscritorio(urlSite: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${urlSite}/#atelier`,
    name: site.nome,
    description: site.descricaoCurta,
    url: urlSite,
    telephone: `+${site.telefoneWhatsapp}`,
    email: site.email,
    foundingDate: String(site.anoFundacao),
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.cidade,
      addressRegion: site.uf,
      addressCountry: 'BR',
      streetAddress: site.endereco,
    },
    founder: { '@id': `${urlSite}/#suzana` },
    sameAs: [site.instagramUrl],
  };
}

export function fichaTrilha(itens: { nome: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((item, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: item.nome,
      item: item.url,
    })),
  };
}

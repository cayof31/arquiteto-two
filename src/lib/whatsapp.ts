import { site } from '../config/site';

export function linkWhatsapp(mensagem: string): string {
  const texto = mensagem.trim();
  if (texto.length === 0) {
    throw new Error('linkWhatsapp: mensagem vazia');
  }
  return `https://wa.me/${site.telefoneWhatsapp}?text=${encodeURIComponent(texto)}`;
}

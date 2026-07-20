import { deepQueryAll } from './dom/query';

// Plage Unicode des diacritiques combinants (U+0300 a U+036F), utilisee
// apres normalize('NFD') pour retirer les accents.
const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;

function stripDiacritics(value: string): string {
  let result = '';

  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= COMBINING_DIACRITICS_START && code <= COMBINING_DIACRITICS_END) {
      continue;
    }
    result += char;
  }

  return result;
}

/**
 * Normalise une chaine pour comparaison "floue" : minuscules, sans accents,
 * apostrophes/guillemets typographiques ramenes a leur forme ASCII, espaces
 * compactes. Utilise partout pour matcher labels/options/questions. Le
 * remplacement des apostrophes courbes est important sur les sites qui
 * les utilisent dans leurs libelles (ex. Talentsoft) alors que les
 * synonymes de ce depot sont ecrits avec des apostrophes droites.
 */
export const norm = (value: unknown): string =>
  stripDiacritics(String(value ?? '').normalize('NFD'))
    .replace(/[‘’ʼ]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const TEXT_ATTRIBUTES = ['label', 'aria-label', 'placeholder', 'value', 'data-test', 'id'];

/**
 * Recupere un maximum de texte "identifiant" pour un element, y compris ses
 * descendants (texte + attributs usuels), pour faciliter le matching flou.
 */
export function textOf(el: Element | null): string {
  if (!el) return '';

  let text = el.textContent || '';

  for (const node of deepQueryAll('*', el)) {
    for (const attr of TEXT_ATTRIBUTES) {
      const value = node.getAttribute?.(attr);
      if (value) text += ` ${value}`;
    }
  }

  return text;
}

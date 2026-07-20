import { matchesLabel, type LabelSynonyms } from './labels';

/**
 * Le formulaire SuccessFactors est une longue page plate : chaque section
 * ("Profile Information", "Employment History", ...) commence par une barre
 * .rcmFormSectionTopBar et s'etend jusqu'a la barre suivante. Il n'y a pas de
 * conteneur DOM propre par section, on raisonne donc en "bornes" : tout
 * element situe entre deux barres appartient a la section.
 */
export interface DomRange {
  /** Borne de depart (exclue). */
  start: Element;
  /** Borne de fin (exclue), null = jusqu'a la fin du document. */
  end: Element | null;
}

function sectionTopBars(): Element[] {
  return [...document.querySelectorAll('.rcmFormSectionTopBar')];
}

/** Vrai si el est apres start (start inclus) et (si end) strictement avant end. */
export function isInRange(el: Element, range: DomRange): boolean {
  // Le start d'un bloc est souvent lui-meme un champ (ancre) : il fait
  // partie du bloc.
  if (el === range.start) return true;

  const afterStart = Boolean(
    range.start.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING
  );
  if (!afterStart) return false;
  if (!range.end) return true;
  return Boolean(el.compareDocumentPosition(range.end) & Node.DOCUMENT_POSITION_FOLLOWING);
}

/** Bornes de la section dont le titre matche les synonymes, ou null. */
export function findSection(synonyms: LabelSynonyms): DomRange | null {
  const bars = sectionTopBars();

  for (let i = 0; i < bars.length; i++) {
    if (matchesLabel(bars[i].textContent, synonyms)) {
      return { start: bars[i], end: bars[i + 1] ?? null };
    }
  }

  console.warn('[Autofill] Section introuvable :', synonyms[0]);
  return null;
}

/** Filtre des elements (deja en ordre DOM ou non) appartenant a une plage. */
export function elementsInRange<T extends Element>(elements: T[], range: DomRange): T[] {
  return elements
    .filter((el) => isInRange(el, range))
    .sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    );
}

/**
 * Decoupe une section en blocs repetes (une experience, une formation...).
 * Les "ancres" sont les elements qui marquent le debut de chaque bloc (ex.
 * le champ "Employer Name" de chaque experience) : le bloc i va de l'ancre i
 * a l'ancre i+1 (ou a la fin de la section).
 */
export function splitIntoBlocks(anchors: Element[], section: DomRange): DomRange[] {
  const sorted = elementsInRange(anchors, section);

  return sorted.map((anchor, i) => ({
    start: anchor,
    end: sorted[i + 1] ?? section.end,
  }));
}

import { nativeSetValue } from '../../../shared';
import { matchesLabel, type LabelSynonyms } from './labels';
import { elementsInRange, type DomRange } from './sections';

/**
 * Sur SuccessFactors, chaque champ (texte OU combo paginee) est precede d'un
 * <label class="rcmFormFieldLabel" for="NNN:_txtFld|NNN:_input"> : le label
 * est donc le point d'entree fiable pour localiser un champ, quel que soit
 * son type, y compris dans les blocs repetes (experiences, formations).
 */

export function allFieldLabels(): HTMLLabelElement[] {
  return [...document.querySelectorAll<HTMLLabelElement>('label.rcmFormFieldLabel')];
}

/** Labels matchant les synonymes, restreints a une plage si fournie. */
export function findLabels(synonyms: LabelSynonyms, range?: DomRange | null): HTMLLabelElement[] {
  const matching = allFieldLabels().filter((label) => matchesLabel(label.textContent, synonyms));
  if (!range) return matching;
  return elementsInRange(matching, range);
}

/** L'element de saisie associe a un label (via son attribut for). */
export function targetOfLabel(label: HTMLLabelElement | null): HTMLElement | null {
  const forId = label?.getAttribute('for');
  if (!forId) return null;
  return document.getElementById(forId);
}

/** Premier champ matchant les synonymes dans la plage (ou la page entiere). */
export function findFieldTarget(
  synonyms: LabelSynonyms,
  range?: DomRange | null
): HTMLElement | null {
  return targetOfLabel(findLabels(synonyms, range)[0] ?? null);
}

/**
 * Renseigne un champ texte simple (input[data-testid="sfTextField"]). La
 * salve d'evenements de nativeSetValue declenche les handlers juic
 * (oninput/onchange) poses en attributs par le framework SuccessFactors.
 */
export async function setTextField(
  synonyms: LabelSynonyms,
  value: string | undefined,
  range?: DomRange | null
): Promise<boolean> {
  if (value === undefined) return true;

  const target = findFieldTarget(synonyms, range);

  if (!(target instanceof HTMLInputElement)) {
    console.warn('[Autofill] Champ texte introuvable :', synonyms[0]);
    return false;
  }

  const ok = nativeSetValue(target, value);
  console.log(`[Autofill] ${synonyms[0]} ->`, ok ? 'OK' : 'echec');
  return ok;
}

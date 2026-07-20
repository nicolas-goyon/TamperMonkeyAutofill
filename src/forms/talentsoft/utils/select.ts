import { dispatchAll, norm } from '../../../shared';
import { findFieldTarget } from './fields';
import { type LabelSynonyms } from './labels';

/** Meilleure option d'un <select> natif dont le libelle matche value (comparaison floue). */
function bestOption(select: HTMLSelectElement, value: string): HTMLOptionElement | null {
  const wanted = norm(value);
  let best: { option: HTMLOptionElement; score: number } | null = null;

  for (const option of [...select.options]) {
    const text = norm(option.textContent);
    if (!text) continue;

    let score = -1;
    if (text === wanted) score = 100;
    else if (text.includes(wanted)) score = 90;
    else if (wanted.includes(text)) score = 70;

    if (score > (best?.score ?? -1)) best = { option, score };
  }

  return best && best.score > 0 ? best.option : null;
}

/** Pose une valeur sur un <select> natif en cherchant l'option par libelle. */
export function setNativeSelectValue(select: HTMLSelectElement | null, value: string): boolean {
  if (!select) return false;

  const option = bestOption(select, value);
  if (!option) {
    console.warn('[Autofill] Aucune option ne matche :', value);
    return false;
  }

  select.value = option.value;
  dispatchAll(select);
  return true;
}

/** Localise le <select> natif par son label puis le renseigne. */
export async function setNativeSelectByLabel(
  synonyms: LabelSynonyms,
  value: string | undefined,
  container: ParentNode = document
): Promise<boolean> {
  if (value === undefined) return true;

  const target = findFieldTarget(synonyms, container);

  if (!(target instanceof HTMLSelectElement)) {
    console.warn('[Autofill] Select introuvable :', synonyms[0]);
    return false;
  }

  const ok = setNativeSelectValue(target, value);
  console.log(`[Autofill] ${synonyms[0]} ->`, ok ? value : 'echec');
  return ok;
}

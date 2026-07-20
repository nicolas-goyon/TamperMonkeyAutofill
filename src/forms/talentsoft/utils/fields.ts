import { nativeSetValue } from '../../../shared';
import { matchesLabel, type LabelSynonyms } from './labels';

/**
 * Chaque champ texte/date/textarea/select Talentsoft est precede d'un
 * <label class="WizardFieldLabel tc_formLabel" for="{id}">, y compris a
 * l'interieur des lignes repetables (une ligne = un vrai conteneur DOM
 * fieldset/tr, donc pas besoin de bornes virtuelles : on interroge
 * directement `container.querySelectorAll`).
 */
function fieldLabels(container: ParentNode): HTMLLabelElement[] {
  return [...container.querySelectorAll<HTMLLabelElement>('label.WizardFieldLabel[for]')];
}

export function findLabel(
  synonyms: LabelSynonyms,
  container: ParentNode = document
): HTMLLabelElement | null {
  return fieldLabels(container).find((label) => matchesLabel(label.textContent, synonyms)) ?? null;
}

/** L'element de saisie associe a un label (via son attribut for). */
export function findFieldTarget(
  synonyms: LabelSynonyms,
  container: ParentNode = document
): HTMLElement | null {
  const forId = findLabel(synonyms, container)?.getAttribute('for');
  if (!forId) return null;
  return document.getElementById(forId);
}

/** Renseigne un champ texte ou zone de texte simple. */
export async function setTextField(
  synonyms: LabelSynonyms,
  value: string | undefined,
  container: ParentNode = document
): Promise<boolean> {
  if (value === undefined) return true;

  const target = findFieldTarget(synonyms, container);

  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    console.warn('[Autofill] Champ texte introuvable :', synonyms[0]);
    return false;
  }

  const ok = nativeSetValue(target, value);
  console.log(`[Autofill] ${synonyms[0]} ->`, ok ? 'OK' : 'echec');
  return ok;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Renseigne un input[type=date] natif. La specification HTML impose la
 * valeur au format ISO 'YYYY-MM-DD' independamment de l'affichage localise
 * du date picker du navigateur : c'est le point qui casse le plus souvent
 * une saisie "naive" de date sur ce site.
 */
export async function setDateField(
  synonyms: LabelSynonyms,
  isoDate: string | undefined,
  container: ParentNode = document
): Promise<boolean> {
  if (isoDate === undefined) return true;

  if (!ISO_DATE.test(isoDate)) {
    console.warn(
      `[Autofill] Date "${synonyms[0]}" ignoree : format attendu 'YYYY-MM-DD', recu`,
      isoDate
    );
    return false;
  }

  const target = findFieldTarget(synonyms, container);

  if (!(target instanceof HTMLInputElement)) {
    console.warn('[Autofill] Champ date introuvable :', synonyms[0]);
    return false;
  }

  const ok = nativeSetValue(target, isoDate);
  console.log(`[Autofill] Date ${synonyms[0]} ->`, ok ? isoDate : 'echec');
  return ok;
}

import { clickElement, dispatchAll } from '../../../shared';
import { matchesLabel, type LabelSynonyms } from './labels';

/**
 * Case a cocher Talentsoft (ex. "J'accepte" la politique de confidentialite) :
 * cherchee d'abord par son propre sous-libelle (WizardSubFieldLabel), sinon
 * par le <legend> du fieldset englobant (le titre de la section, ex.
 * "Politique de confidentialité").
 */
export async function setCheckboxByLabel(
  synonyms: LabelSynonyms,
  checked: boolean | undefined,
  container: ParentNode = document
): Promise<boolean> {
  if (checked === undefined) return true;

  const subLabel = [...container.querySelectorAll<HTMLLabelElement>('label.WizardSubFieldLabel[for]')].find(
    (el) => matchesLabel(el.textContent, synonyms)
  );

  let checkbox: HTMLElement | null = subLabel
    ? document.getElementById(subLabel.getAttribute('for') ?? '')
    : null;

  if (!(checkbox instanceof HTMLInputElement)) {
    const legend = [...container.querySelectorAll<HTMLElement>('legend.WizardFieldLabel[id]')].find((el) =>
      matchesLabel(el.textContent, synonyms)
    );
    checkbox = legend?.closest('fieldset')?.querySelector('input[type="checkbox"]') ?? null;
  }

  if (!(checkbox instanceof HTMLInputElement)) {
    console.warn('[Autofill] Case a cocher introuvable :', synonyms[0]);
    return false;
  }

  if (checkbox.checked !== checked) {
    await clickElement(checkbox);
  }

  checkbox.checked = checked;
  dispatchAll(checkbox);
  console.log(`[Autofill] ${synonyms[0]} ->`, checked ? 'coche' : 'decoche');
  return true;
}

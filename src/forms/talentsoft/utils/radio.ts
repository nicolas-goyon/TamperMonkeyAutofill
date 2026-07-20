import { clickElement, norm } from '../../../shared';
import { matchesLabel, type LabelSynonyms } from './labels';

/**
 * Groupes de radio Talentsoft (ex. "Sexe") : <legend id="{groupId}-label">
 * suivi d'un conteneur role="radiogroup" id="{groupId}" contenant les
 * <input type="radio">, chacun documente par data-option-name ET un
 * <label for="{radioId}">.
 */
function radioGroupLegends(container: ParentNode): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('legend.WizardFieldLabel[id]')];
}

export async function setRadioGroupByLabel(
  synonyms: LabelSynonyms,
  optionLabel: string | undefined,
  container: ParentNode = document
): Promise<boolean> {
  if (optionLabel === undefined) return true;

  const legend = radioGroupLegends(container).find((el) => matchesLabel(el.textContent, synonyms));
  const groupId = legend?.id.replace(/-label$/, '');
  const group = groupId ? document.getElementById(groupId) : null;

  if (!group) {
    console.warn('[Autofill] Groupe de radio introuvable :', synonyms[0]);
    return false;
  }

  const radios = [...group.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  const wanted = norm(optionLabel);

  const target = radios.find((radio) => {
    const optionName = norm(radio.getAttribute('data-option-name'));
    const label = document.querySelector(`label[for="${radio.id}"]`);
    return optionName === wanted || norm(label?.textContent) === wanted || optionName.includes(wanted);
  });

  if (!target) {
    console.warn('[Autofill] Option de radio introuvable :', optionLabel);
    return false;
  }

  await clickElement(target);
  target.checked = true;
  console.log(`[Autofill] ${synonyms[0]} ->`, optionLabel);
  return true;
}

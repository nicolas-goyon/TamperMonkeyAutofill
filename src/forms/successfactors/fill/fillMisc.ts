import { sleep } from '../../../shared';
import { COMBO_TITLES } from '../utils/labels';
import { findFieldTarget } from '../utils/fields';
import { findComboByTitle, setComboByLabel, setPaginatedSelect } from '../utils/paginatedSelect';
import type { SuccessFactorsConfig } from '../types';

/**
 * "How did you hear about this position?" : picklist en cascade
 * (sfCascadingPicklist). Le premier choix peut faire apparaitre un second
 * combo de detail dans le meme conteneur, qu'on remplit ensuite si fourni.
 */
export async function fillMisc(config: SuccessFactorsConfig): Promise<void> {
  if (config.howDidYouHear === undefined) return;

  await setComboByLabel(COMBO_TITLES.howDidYouHear, config.howDidYouHear);
  await sleep(800);

  if (config.howDidYouHearDetail === undefined) return;

  const first =
    findFieldTarget(COMBO_TITLES.howDidYouHear) ?? findComboByTitle(COMBO_TITLES.howDidYouHear);
  const cascade = first?.closest('.sfCascadingPicklist') ?? first?.closest('span');

  if (!cascade) {
    console.warn('[Autofill] Conteneur du picklist en cascade introuvable.');
    return;
  }

  const detail = [
    ...cascade.querySelectorAll<HTMLInputElement>('input.rcmpaginatedselectinput'),
  ].find((el) => el !== first && !el.value);

  if (!detail) {
    console.warn('[Autofill] Second combo de detail introuvable (pas encore affiche ?).');
    return;
  }

  await setPaginatedSelect(detail, config.howDidYouHearDetail);
}

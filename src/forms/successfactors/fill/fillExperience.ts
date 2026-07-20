import { sleep } from '../../../shared';
import { COMBO_TITLES, DATE_TITLES, FIELD_LABELS, SECTION_LABELS } from '../utils/labels';
import { findSection, splitIntoBlocks, type DomRange } from '../utils/sections';
import { findLabels, setTextField } from '../utils/fields';
import { setComboByLabel } from '../utils/paginatedSelect';
import { setDatePicker } from '../utils/datePicker';
import type { SuccessFactorsExperienceEntry } from '../types';

async function fillExperienceBlock(
  entry: SuccessFactorsExperienceEntry,
  block: DomRange
): Promise<void> {
  await setTextField(FIELD_LABELS.employer, entry.employer, block);
  await setTextField(FIELD_LABELS.jobTitle, entry.jobTitle, block);
  await setDatePicker(DATE_TITLES.from, entry.dateFrom, block);
  await setDatePicker(DATE_TITLES.to, entry.dateTo, block);
  await setComboByLabel(COMBO_TITLES.industry, entry.industry, block);
  await sleep(200);
  await setComboByLabel(COMBO_TITLES.country, entry.country, block);
}

/**
 * Section "Employment History". Le formulaire pre-rend plusieurs blocs (un
 * par experience deja connue + vides) : chaque bloc commence par son label
 * "Employer Name", qui sert d'ancre de decoupage. On remplit au plus
 * min(entries, blocs affiches) — SuccessFactors n'expose pas de bouton
 * "ajouter" fiable a automatiser.
 */
export async function fillExperiences(
  entries: SuccessFactorsExperienceEntry[] | undefined
): Promise<number> {
  if (!entries?.length) return 0;

  const section = findSection(SECTION_LABELS.employment);
  if (!section) return 0;

  const anchors = findLabels(FIELD_LABELS.employer, section);
  const blocks = splitIntoBlocks(anchors, section);

  const count = Math.min(entries.length, blocks.length);

  if (entries.length > blocks.length) {
    console.warn(
      `[Autofill] ${entries.length} experiences fournies mais ${blocks.length} blocs affiches. Ajoute des blocs manuellement puis relance.`
    );
  }

  for (let i = 0; i < count; i++) {
    await fillExperienceBlock(entries[i], blocks[i]);
    await sleep(300);
  }

  return count;
}

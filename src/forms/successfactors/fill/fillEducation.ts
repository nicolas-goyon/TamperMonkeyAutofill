import { sleep } from '../../../shared';
import { COMBO_TITLES, DATE_TITLES, FIELD_LABELS, SECTION_LABELS } from '../utils/labels';
import { findSection, splitIntoBlocks, type DomRange } from '../utils/sections';
import { findLabels, setTextField } from '../utils/fields';
import {
  findComboByTitle,
  setComboByLabel,
  waitForComboEnabled,
} from '../utils/paginatedSelect';
import { setDatePicker } from '../utils/datePicker';
import type { SuccessFactorsEducationEntry } from '../types';

async function fillEducationBlock(
  entry: SuccessFactorsEducationEntry,
  block: DomRange
): Promise<void> {
  // Cascade : Country doit etre choisi AVANT School (combo desactive sinon).
  await setComboByLabel(COMBO_TITLES.country, entry.country, block);
  await sleep(400);

  if (entry.school !== undefined) {
    const school = findComboByTitle(COMBO_TITLES.school, block);
    if (school) await waitForComboEnabled(school);
    await setComboByLabel(COMBO_TITLES.school, entry.school, block);
    await sleep(200);
  }

  await setTextField(FIELD_LABELS.schoolOther, entry.schoolOther, block);
  await setComboByLabel(COMBO_TITLES.highestLevel, entry.highestLevel, block);
  await sleep(200);
  await setComboByLabel(COMBO_TITLES.yearOfDegree, entry.yearOfDegree, block);
  await sleep(200);
  await setDatePicker(DATE_TITLES.dateOfDegree, entry.dateOfDegree, block);
  await setComboByLabel(COMBO_TITLES.areaOfStudy, entry.areaOfStudy, block);
}

/**
 * Section "Education". Chaque bloc commence par son label "Country".
 */
export async function fillEducations(
  entries: SuccessFactorsEducationEntry[] | undefined
): Promise<number> {
  if (!entries?.length) return 0;

  const section = findSection(SECTION_LABELS.education);
  if (!section) return 0;

  // Ancres : le label "Country" ouvre chaque bloc formation (il precede son
  // combo, qui appartient donc bien au bloc).
  const anchors = findLabels(COMBO_TITLES.country, section);

  const blocks = splitIntoBlocks(anchors, section);
  const count = Math.min(entries.length, blocks.length);

  if (entries.length > blocks.length) {
    console.warn(
      `[Autofill] ${entries.length} formations fournies mais ${blocks.length} blocs affiches. Ajoute des blocs manuellement puis relance.`
    );
  }

  for (let i = 0; i < count; i++) {
    await fillEducationBlock(entries[i], blocks[i]);
    await sleep(300);
  }

  return count;
}

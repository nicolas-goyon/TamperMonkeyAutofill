import { sleep } from '../../../shared';
import { COMBO_TITLES, SECTION_LABELS } from '../utils/labels';
import { findSection, splitIntoBlocks } from '../utils/sections';
import { findLabels } from '../utils/fields';
import { setComboByLabel } from '../utils/paginatedSelect';
import type { SuccessFactorsLanguageEntry } from '../types';

/** Section "Language Skills" : paires de combos Language / Proficiency. */
export async function fillLanguages(
  entries: SuccessFactorsLanguageEntry[] | undefined
): Promise<number> {
  if (!entries?.length) return 0;

  const section = findSection(SECTION_LABELS.languages);
  if (!section) return 0;

  const anchors = findLabels(COMBO_TITLES.language, section);
  const blocks = splitIntoBlocks(anchors, section);
  const count = Math.min(entries.length, blocks.length);

  if (entries.length > blocks.length) {
    console.warn(
      `[Autofill] ${entries.length} langues fournies mais ${blocks.length} blocs affiches.`
    );
  }

  for (let i = 0; i < count; i++) {
    await setComboByLabel(COMBO_TITLES.language, entries[i].language, blocks[i]);
    await sleep(200);
    await setComboByLabel(COMBO_TITLES.proficiency, entries[i].proficiency, blocks[i]);
    await sleep(200);
  }

  return count;
}

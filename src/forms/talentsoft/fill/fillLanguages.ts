import { sleep } from '../../../shared';
import { SECTION_LABELS } from '../utils/labels';
import { findDatasetFieldId } from '../utils/containers';
import { ensureDatasetRows } from '../utils/dataset';
import { setNativeSelectValue } from '../utils/select';
import type { TalentsoftLanguageEntry } from '../types';

/**
 * "Langues" est aussi une table, mais les deux colonnes (langue, niveau)
 * sont des <select> natifs (pas de select2) : reperees par position.
 */
async function fillLanguageRow(entry: TalentsoftLanguageEntry, row: HTMLElement): Promise<void> {
  const [languageSelect, levelSelect] = [...row.querySelectorAll<HTMLSelectElement>('select')];

  if (languageSelect) setNativeSelectValue(languageSelect, entry.language);
  if (entry.level !== undefined && levelSelect) setNativeSelectValue(levelSelect, entry.level);
}

/** Chaque langue exige un clic sur "ajouter" avant de pouvoir etre saisie. */
export async function fillLanguages(entries: TalentsoftLanguageEntry[] | undefined): Promise<number> {
  if (!entries?.length) return 0;

  const fieldId = findDatasetFieldId(SECTION_LABELS.languages);
  if (!fieldId) return 0;

  const rows = await ensureDatasetRows(fieldId, entries.length);
  const count = Math.min(entries.length, rows.length);

  if (entries.length > rows.length) {
    console.warn(
      `[Autofill] ${entries.length} langues fournies mais seulement ${rows.length} lignes disponibles.`
    );
  }

  for (let i = 0; i < count; i++) {
    await fillLanguageRow(entries[i], rows[i]);
    await sleep(250);
  }

  return count;
}

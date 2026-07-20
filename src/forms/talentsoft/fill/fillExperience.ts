import { sleep } from '../../../shared';
import { FIELD_LABELS } from '../utils/labels';
import { findDatasetFieldId } from '../utils/containers';
import { ensureDatasetRows } from '../utils/dataset';
import { setDateField, setTextField } from '../utils/fields';
import type { TalentsoftExperienceEntry } from '../types';

async function fillExperienceRow(entry: TalentsoftExperienceEntry, row: HTMLElement): Promise<void> {
  await setTextField(FIELD_LABELS.employer, entry.employer, row);
  await setTextField(FIELD_LABELS.jobTitle, entry.jobTitle, row);
  await setDateField(FIELD_LABELS.dateFrom, entry.dateFrom, row);
  await setDateField(FIELD_LABELS.dateTo, entry.dateTo, row);
  await setTextField(FIELD_LABELS.responsibilities, entry.responsibilities, row);
}

/**
 * Bloc repetable "Expérience professionnelle". Le site pre-affiche deja
 * quelques lignes vides ; on clique "ajouter" pour les completer si
 * davantage d'entrees sont fournies.
 */
export async function fillExperiences(entries: TalentsoftExperienceEntry[] | undefined): Promise<number> {
  if (!entries?.length) return 0;

  const fieldId = findDatasetFieldId(FIELD_LABELS.experienceDataset);
  if (!fieldId) return 0;

  const rows = await ensureDatasetRows(fieldId, entries.length);
  const count = Math.min(entries.length, rows.length);

  if (entries.length > rows.length) {
    console.warn(
      `[Autofill] ${entries.length} experiences fournies mais seulement ${rows.length} lignes disponibles.`
    );
  }

  for (let i = 0; i < count; i++) {
    await fillExperienceRow(entries[i], rows[i]);
    await sleep(300);
  }

  return count;
}

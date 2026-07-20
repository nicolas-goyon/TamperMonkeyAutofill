import { sleep } from '../../../shared';
import { FIELD_LABELS, SECTION_LABELS } from '../utils/labels';
import { findDatasetFieldId } from '../utils/containers';
import { ensureDatasetRows } from '../utils/dataset';
import { setDateField, setTextField } from '../utils/fields';
import { setNativeSelectByLabel } from '../utils/select';
import type { TalentsoftEducationEntry } from '../types';

async function fillEducationRow(entry: TalentsoftEducationEntry, row: HTMLElement): Promise<void> {
  await setTextField(FIELD_LABELS.schoolName, entry.schoolName, row);
  await setDateField(FIELD_LABELS.graduationDate, entry.graduationDate, row);
  await setTextField(FIELD_LABELS.fieldOfStudy, entry.fieldOfStudy, row);
  await setNativeSelectByLabel(FIELD_LABELS.educationLevel, entry.level, row);
  await setTextField(FIELD_LABELS.averageGrade, entry.averageGrade, row);
}

/**
 * Bloc repetable "Parcours académique". Le libelle du bloc lui-meme est
 * vide sur ce site : on identifie le lien "ajouter" via le titre de la
 * Section englobante a la place (voir findDatasetFieldId).
 */
export async function fillEducations(entries: TalentsoftEducationEntry[] | undefined): Promise<number> {
  if (!entries?.length) return 0;

  const fieldId = findDatasetFieldId(SECTION_LABELS.academicBackground);
  if (!fieldId) return 0;

  const rows = await ensureDatasetRows(fieldId, entries.length);
  const count = Math.min(entries.length, rows.length);

  if (entries.length > rows.length) {
    console.warn(
      `[Autofill] ${entries.length} formations fournies mais seulement ${rows.length} lignes disponibles.`
    );
  }

  for (let i = 0; i < count; i++) {
    await fillEducationRow(entries[i], rows[i]);
    await sleep(300);
  }

  return count;
}

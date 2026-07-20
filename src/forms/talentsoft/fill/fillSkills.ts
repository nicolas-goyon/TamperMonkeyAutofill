import { sleep } from '../../../shared';
import { FIELD_LABELS } from '../utils/labels';
import { findDatasetFieldId } from '../utils/containers';
import { ensureDatasetRows } from '../utils/dataset';
import { setNativeSelectValue } from '../utils/select';
import { setSelect2Value } from '../utils/select2';
import type { TalentsoftSkillEntry } from '../types';

/**
 * "Liste des compétences" est rendue en tableau (une ligne = un <tr>), sans
 * label individuel par cellule (les libelles sont sur les <th> d'en-tete).
 * On repere donc les deux champs par POSITION dans la ligne, dans l'ordre
 * des colonnes : nom (combo recherche serveur) puis niveau (select natif).
 */
async function fillSkillRow(entry: TalentsoftSkillEntry, row: HTMLElement): Promise<void> {
  const nameSelect = row.querySelector<HTMLSelectElement>('select.select2-hidden-accessible');

  if (nameSelect) {
    await setSelect2Value(nameSelect.id, entry.name);
  } else {
    console.warn('[Autofill] Combo competence introuvable dans la ligne.');
  }

  await sleep(200);

  if (entry.level === undefined) return;

  const levelSelect = [...row.querySelectorAll<HTMLSelectElement>('select')].find(
    (select) => select !== nameSelect
  );

  if (levelSelect) setNativeSelectValue(levelSelect, entry.level);
}

/**
 * Chaque competence exige un clic sur "ajouter" avant de pouvoir etre
 * saisie : le tableau ne pre-affiche generalement qu'une ligne (ou aucune).
 */
export async function fillSkills(entries: TalentsoftSkillEntry[] | undefined): Promise<number> {
  if (!entries?.length) return 0;

  const fieldId = findDatasetFieldId(FIELD_LABELS.skillsDataset);
  if (!fieldId) return 0;

  const rows = await ensureDatasetRows(fieldId, entries.length);
  const count = Math.min(entries.length, rows.length);

  if (entries.length > rows.length) {
    console.warn(
      `[Autofill] ${entries.length} competences fournies mais seulement ${rows.length} lignes disponibles.`
    );
  }

  for (let i = 0; i < count; i++) {
    await fillSkillRow(entries[i], rows[i]);
    await sleep(300);
  }

  return count;
}

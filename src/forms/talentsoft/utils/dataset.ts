import { clickElement, sleep } from '../../../shared';

/**
 * Blocs repetables Talentsoft (Experience, Formation, Competences, Langues) :
 * deux gabarits DOM selon le champ, mais un motif d'id commun pour les
 * lignes reelles (jamais la ligne modele "_sample", jamais l'input cache
 * "_rowOffset") :
 *   - "datasetField__row--{fieldId}_{n}"      (Experience, Formation)
 *   - "multipleDatasetEntry_{fieldId}_{n}"    (Competences, Langues, en table)
 *
 * L'ajout d'une ligne passe TOUJOURS par un clic sur
 * "#addRowFor_{fieldId}" (jamais un simple champ vide qui apparaitrait tout
 * seul) : Competences et Langues l'exigent pour CHAQUE entree, Experience et
 * Formation en pre-affichent deja quelques-unes.
 */

interface DatasetRow {
  el: HTMLElement;
  index: number;
}

function rowsForField(fieldId: string): DatasetRow[] {
  const nodes = document.querySelectorAll<HTMLElement>(
    `[id^="datasetField__row--${fieldId}_"], [id^="multipleDatasetEntry_${fieldId}_"]`
  );

  const rows: DatasetRow[] = [];

  for (const el of nodes) {
    const match = el.id.match(/_(\d+)$/); // exclut naturellement "_sample" et "_rowOffset"
    if (!match) continue;
    rows.push({ el, index: Number(match[1]) });
  }

  return rows.sort((a, b) => a.index - b.index);
}

async function clickAddAndWaitForNewRow(
  fieldId: string,
  previousIds: Set<string>
): Promise<HTMLElement | null> {
  const link = document.getElementById(`addRowFor_${fieldId}`);

  if (!link) {
    console.warn('[Autofill] Lien "ajouter" introuvable pour :', fieldId);
    return null;
  }

  await clickElement(link);

  const timeoutMs = 5000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const fresh = rowsForField(fieldId).find((row) => !previousIds.has(row.el.id));
    if (fresh) return fresh.el;
    await sleep(150);
  }

  console.warn('[Autofill] Nouvelle ligne non detectee apres clic sur "ajouter" :', fieldId);
  return null;
}

/**
 * Garantit qu'au moins `count` lignes existent pour ce bloc, en cliquant sur
 * "ajouter" autant de fois que necessaire. Renvoie les lignes disponibles
 * dans l'ordre d'affichage (peut etre < count si le site refuse d'en
 * ajouter davantage).
 */
export async function ensureDatasetRows(fieldId: string, count: number): Promise<HTMLElement[]> {
  let rows = rowsForField(fieldId);

  while (rows.length < count) {
    const previousIds = new Set(rows.map((row) => row.el.id));
    const newRow = await clickAddAndWaitForNewRow(fieldId, previousIds);
    if (!newRow) break;
    await sleep(250);
    rows = rowsForField(fieldId);
  }

  return rows.map((row) => row.el);
}

import { clickElement, dispatchAll, nativeSetValue, norm, sleep } from '../../../shared';
import { findLabel } from './fields';
import { type LabelSynonyms } from './labels';

/**
 * Combos "select2" de Talentsoft (classe AutoCompleteField) : un <select>
 * natif cache (select2-hidden-accessible) pilote un widget custom
 * (.select2-selection). Cliquer dessus ouvre un menu avec un champ de
 * recherche ; la liste peut etre statique ou alimentee par un appel serveur
 * (ex. taxonomie des competences, liste des pays). On tape la valeur voulue
 * et on clique la meilleure option renvoyee.
 */

const RESULT_SELECTOR = '.select2-results__option[role="option"], li.select2-results__option';

function isUsableResult(el: Element): boolean {
  if (el.getAttribute('aria-disabled') === 'true') return false;
  if (el.classList.contains('select2-results__message')) return false;
  if (el.classList.contains('loading-results')) return false;
  return norm(el.textContent).length > 0;
}

function visibleResultOptions(): Element[] {
  return [...document.querySelectorAll(RESULT_SELECTOR)].filter(isUsableResult);
}

/** Le widget visuel associe a un <select> select2 porte la classe select2Container{fieldId}. */
function selectionBox(fieldId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`.select2Container${fieldId}`);
}

async function openSelect2(fieldId: string): Promise<HTMLElement | null> {
  const box = selectionBox(fieldId);
  if (!box) return null;

  await clickElement(box);
  await sleep(200);
  return box;
}

/**
 * Champ de recherche du menu ouvert. En multi-select, il vit en permanence
 * dans le widget avec un id stable ({fieldId}-search__field). En
 * single-select, select2 le (re)cree a la volee dans un dropdown attache au
 * document : on prend celui du menu actuellement ouvert.
 */
function searchField(fieldId: string): HTMLInputElement | null {
  const inline = document.getElementById(`${fieldId}-search__field`);
  if (inline instanceof HTMLInputElement) return inline;

  const open = document.querySelector<HTMLInputElement>(
    '.select2-container--open .select2-search__field, .select2-dropdown .select2-search__field'
  );
  return open ?? null;
}

async function waitForResults(timeoutMs = 6000): Promise<Element[]> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const options = visibleResultOptions();
    if (options.length > 0) return options;
    await sleep(200);
  }

  return [];
}

function scoreOption(option: Element, expected: string): number {
  const text = norm(option.textContent);
  const wanted = norm(expected);

  if (!text) return -1;
  if (text === wanted) return 100;
  if (text.includes(wanted)) return 90;
  if (wanted.includes(text)) return 70;

  const words = wanted.split(' ').filter((w) => w.length >= 3);
  return words.filter((w) => text.includes(w)).length;
}

/**
 * Ouvre le combo select2 identifie par l'id de son <select> natif, filtre
 * avec la valeur voulue et clique la meilleure option (recherche serveur
 * incluse, d'ou le delai genereux avant d'attendre les resultats).
 */
export async function setSelect2Value(fieldId: string, value: string): Promise<boolean> {
  const box = await openSelect2(fieldId);

  if (!box) {
    console.warn('[Autofill] Combo select2 introuvable :', fieldId);
    return false;
  }

  const input = searchField(fieldId);

  if (!input) {
    console.warn('[Autofill] Champ de recherche introuvable pour :', fieldId);
    return false;
  }

  nativeSetValue(input, value);
  await sleep(700); // debounce + aller-retour serveur possible

  const options = await waitForResults();

  if (options.length === 0) {
    console.warn('[Autofill] Aucun resultat pour :', value);
    return false;
  }

  const ranked = options
    .map((option) => ({ option, score: scoreOption(option, value) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score <= 0) {
    console.warn('[Autofill] Aucune option ne matche :', value);
    return false;
  }

  await clickElement(best.option);
  await sleep(300);
  dispatchAll(box);

  console.log('[Autofill] Combo ->', value, ':', norm(best.option.textContent).slice(0, 80));
  return true;
}

/** Localise le combo select2 par son label (champs de premier niveau, pas les lignes de tableau). */
export async function setSelect2ByLabel(
  synonyms: LabelSynonyms,
  value: string | undefined,
  container: ParentNode = document
): Promise<boolean> {
  if (value === undefined) return true;

  const fieldId = findLabel(synonyms, container)?.getAttribute('for');

  if (!fieldId) {
    console.warn('[Autofill] Combo select2 introuvable :', synonyms[0]);
    return false;
  }

  return setSelect2Value(fieldId, value);
}

/**
 * Combo select2 multi-selection (ex. liste de pays) : chaque valeur declenche
 * une recherche + un clic independant, le widget conservant les choix
 * precedents.
 */
export async function addSelect2Values(
  synonyms: LabelSynonyms,
  values: string[] | undefined,
  container: ParentNode = document
): Promise<number> {
  if (!values?.length) return 0;

  const fieldId = findLabel(synonyms, container)?.getAttribute('for');

  if (!fieldId) {
    console.warn('[Autofill] Combo select2 multi introuvable :', synonyms[0]);
    return 0;
  }

  let count = 0;

  for (const value of values) {
    const ok = await setSelect2Value(fieldId, value);
    if (ok) count++;
    await sleep(350);
  }

  return count;
}

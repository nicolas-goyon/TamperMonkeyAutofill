import {
  clickElement,
  dispatchAll,
  keyboard,
  nativeSetValue,
  norm,
  sleep,
} from '../../../shared';
import { matchesLabel, type LabelSynonyms } from './labels';
import { findFieldTarget } from './fields';
import { elementsInRange, type DomRange } from './sections';

/**
 * Combos "rcmpaginatedselect" de SuccessFactors : un input role="combobox"
 * (placeholder "No Selection") dont le clic ouvre une liste paginee rendue a
 * la demande dans un conteneur id="NNN:_listSelect" (reference par
 * aria-owns). Taper dans l'input filtre la liste cote serveur.
 */

const OPTION_SELECTOR = '[role="option"], li, [class*="option" i]';

function comboInput(target: HTMLElement | null): HTMLInputElement | null {
  if (target instanceof HTMLInputElement) return target;
  return null;
}

/**
 * Fallback quand le label ne pointe pas sur le combo : recherche par les
 * attributs title / aria-label portes par l'input rcmpaginatedselectinput.
 */
export function findComboByTitle(
  synonyms: LabelSynonyms,
  range?: DomRange | null
): HTMLInputElement | null {
  const combos = [
    ...document.querySelectorAll<HTMLInputElement>('input.rcmpaginatedselectinput'),
  ].filter(
    (el) =>
      matchesLabel(el.getAttribute('title'), synonyms) ||
      matchesLabel(el.getAttribute('aria-label'), synonyms)
  );

  if (!range) return combos[0] ?? null;
  return elementsInRange(combos, range)[0] ?? null;
}

function visibleOptions(container: Element): Element[] {
  return [...container.querySelectorAll(OPTION_SELECTOR)].filter((el) => {
    const rect = el.getBoundingClientRect?.();
    return (!rect || rect.width > 0 || rect.height > 0) && norm(el.textContent);
  });
}

async function waitForOptions(input: HTMLInputElement, timeoutMs = 4000): Promise<Element[]> {
  const ownsId = input.getAttribute('aria-owns');
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const container = ownsId ? document.getElementById(ownsId) : null;

    if (container) {
      const options = visibleOptions(container);
      if (options.length > 0) return options;
    }

    // Fallback : liste rendue ailleurs (overlay), on cherche tout conteneur
    // _listSelect visible de la page.
    for (const anyList of document.querySelectorAll('[id$="_listSelect"]')) {
      const options = visibleOptions(anyList);
      if (options.length > 0) return options;
    }

    await sleep(150);
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

/** Attend que le combo (cascade) soit active, ex. School apres Country. */
export async function waitForComboEnabled(
  input: HTMLInputElement,
  timeoutMs = 5000
): Promise<boolean> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (!input.disabled && input.getAttribute('disabled') === null) return true;
    await sleep(200);
  }

  return false;
}

/** Ouvre le combo, filtre avec la valeur, clique la meilleure option. */
export async function setPaginatedSelect(
  input: HTMLInputElement | null,
  value: string
): Promise<boolean> {
  if (!input) return false;

  await waitForComboEnabled(input, 2000);

  try {
    input.scrollIntoView({ block: 'center', inline: 'nearest' });
  } catch {
    // no-op
  }

  await clickElement(input);

  try {
    input.focus();
  } catch {
    // no-op
  }

  await sleep(200);

  // Filtrage : taper la valeur reduit la liste paginee.
  nativeSetValue(input, value);
  await sleep(500);

  let options = await waitForOptions(input);

  // Si le filtre ne renvoie rien (libelle legerement different), on retente
  // sans filtre pour parcourir la premiere page d'options.
  if (options.length === 0) {
    nativeSetValue(input, '');
    await sleep(400);
    options = await waitForOptions(input);
  }

  if (options.length === 0) {
    console.warn('[Autofill] Aucune option pour le combo :', value);
    // Fallback clavier.
    keyboard(input, 'ArrowDown');
    await sleep(150);
    keyboard(input, 'Enter');
    await sleep(150);
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
  await sleep(250);

  dispatchAll(input);

  try {
    input.blur();
  } catch {
    // no-op
  }

  console.log('[Autofill] Combo ->', value, ':', norm(best.option.textContent).slice(0, 80));
  return true;
}

/** Localise le combo par son label puis le renseigne. */
export async function setComboByLabel(
  synonyms: LabelSynonyms,
  value: string | undefined,
  range?: DomRange | null
): Promise<boolean> {
  if (value === undefined) return true;

  const input =
    comboInput(findFieldTarget(synonyms, range)) ?? findComboByTitle(synonyms, range);

  if (!input) {
    console.warn('[Autofill] Combo introuvable :', synonyms[0]);
    return false;
  }

  return setPaginatedSelect(input, value);
}

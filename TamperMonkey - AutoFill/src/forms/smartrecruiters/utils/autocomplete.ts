import {
  clickElement,
  deepQueryAll,
  dispatchAll,
  keyboard,
  nativeSetValue,
  norm,
  sleep,
  textOf,
} from '../../../shared';
import { getAutocompleteHost, getNativeInputFromComponent, setComponentValue } from './component';
import { scopedDataTest } from './dataTest';

export function autocompleteOptionText(option: Element | null): string {
  if (!option) return '';

  return [
    option.getAttribute?.('label'),
    option.getAttribute?.('value'),
    option.getAttribute?.('aria-label'),
    textOf(option),
  ]
    .filter(Boolean)
    .join(' ');
}

const OPTION_SELECTOR = [
  'spl-dropdown-item',
  'spl-select-option',
  '[role="option"]',
  '[data-test*="option"]',
  '[data-test*="result"]',
  'li',
  'button',
].join(',');

const OPTION_SELECTOR_STRICT = [
  'spl-dropdown-item',
  'spl-select-option',
  '[role="option"]',
  '[data-test*="option"]',
  '[data-test*="result"]',
].join(',');

const NOISE_WORDS = ['effacer', 'clear', 'recherche'];

export function getAutocompleteOptions(autocomplete: Element | null): Element[] {
  const localOptions = deepQueryAll(OPTION_SELECTOR, autocomplete ?? document);

  const filteredLocal = localOptions.filter((option) => {
    const text = norm(autocompleteOptionText(option));
    if (!text) return false;
    return !NOISE_WORDS.some((word) => text.includes(word));
  });

  if (filteredLocal.length > 0) {
    return filteredLocal;
  }

  // Fallback : certains menus peuvent etre rendus ailleurs dans le DOM
  // (portails/overlays), on cherche alors sur toute la page.
  return deepQueryAll(OPTION_SELECTOR_STRICT).filter((option) => {
    const text = norm(autocompleteOptionText(option));
    if (!text) return false;

    const rect = option.getBoundingClientRect?.();
    return !rect || rect.width > 0 || rect.height > 0;
  });
}

export async function waitForAutocompleteOptions(
  autocomplete: Element | null,
  timeoutMs = 2500
): Promise<Element[]> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const options = getAutocompleteOptions(autocomplete);
    if (options.length > 0) return options;
    await sleep(100);
  }

  return [];
}

export function scoreAutocompleteOption(option: Element, expectedValue: string): number {
  const optionText = norm(autocompleteOptionText(option));
  const expected = norm(expectedValue);

  if (!optionText) return -1;

  if (optionText === expected) return 100;
  if (optionText.includes(expected)) return 90;
  if (expected.includes(optionText)) return 70;

  const expectedWords = expected.split(' ').filter((w) => w.length >= 3);
  const matchedWords = expectedWords.filter((w) => optionText.includes(w));

  return matchedWords.length;
}

export async function clickAutocompleteOption(
  autocomplete: Element | null,
  expectedValue: string
): Promise<boolean> {
  const options = await waitForAutocompleteOptions(autocomplete);

  if (options.length === 0) {
    console.warn('[Autofill] Aucune option autocomplete trouvee pour :', expectedValue);
    return false;
  }

  const ranked = options
    .map((option) => ({
      option,
      score: scoreAutocompleteOption(option, expectedValue),
      text: autocompleteOptionText(option),
    }))
    .sort((a, b) => b.score - a.score);

  console.table(
    ranked.slice(0, 5).map((x) => ({
      score: x.score,
      text: norm(x.text).slice(0, 120),
    }))
  );

  const best = ranked[0];

  if (!best || best.score < 0) {
    console.warn('[Autofill] Aucune option exploitable pour :', expectedValue);
    return false;
  }

  // Si aucune option ne matche vraiment, on prend quand meme la premiere.
  // Souvent necessaire sur les intitules de poste generiques.
  const chosen = best.score > 0 ? best.option : options[0];

  await clickElement(chosen);
  await sleep(250);

  dispatchAll(chosen);
  dispatchAll(autocomplete);

  console.log('[Autofill] Option autocomplete selectionnee :', autocompleteOptionText(chosen));

  return true;
}

export async function setAutocompleteValueAndSelect(
  container: Element | null,
  value: string
): Promise<boolean> {
  const autocomplete = getAutocompleteHost(container);

  if (!autocomplete) {
    return setComponentValue(container, value);
  }

  const input = getNativeInputFromComponent(autocomplete);

  if (!input) {
    console.warn('[Autofill] Input natif introuvable dans autocomplete :', container);
    return setComponentValue(container, value);
  }

  try {
    autocomplete.scrollIntoView({ block: 'center', inline: 'nearest' });
  } catch {
    // no-op
  }

  await sleep(80);

  try {
    (autocomplete as HTMLElement).click();
    input.click();
    input.focus();
  } catch {
    // no-op
  }

  await sleep(100);

  // Nettoyage.
  nativeSetValue(input, '');
  dispatchAll(input);
  dispatchAll(autocomplete);

  await sleep(100);

  // Saisie.
  nativeSetValue(input, value);
  dispatchAll(input);
  dispatchAll(autocomplete);

  await sleep(600);

  // Selection dans le menu.
  let selected = await clickAutocompleteOption(autocomplete, value);

  // Fallback clavier : utile si le menu existe mais que les options sont
  // difficiles a capter.
  if (!selected) {
    try {
      input.focus();
      keyboard(input, 'ArrowDown');
      await sleep(120);
      keyboard(input, 'Enter');
      await sleep(200);
      selected = true;
    } catch {
      // no-op
    }
  }

  // Derniers evenements pour Angular.
  dispatchAll(input);
  dispatchAll(autocomplete);

  try {
    input.blur();
  } catch {
    // no-op
  }

  await sleep(150);

  return selected;
}

export async function setScopedAutocompleteField(
  root: ParentNode,
  dataTest: string,
  value: string
): Promise<boolean> {
  const field = scopedDataTest(root, dataTest);

  if (!field) {
    console.warn(`[Autofill] Autocomplete introuvable dans le formulaire : ${dataTest}`);
    return false;
  }

  const ok = await setAutocompleteValueAndSelect(field, value);

  console.log(`[Autofill] ${dataTest} autocomplete ->`, ok ? 'OK' : 'tentative partielle', value);

  return ok;
}

import {
  clickElement,
  deepQuery,
  deepQueryAll,
  dispatchAll,
  keyboard,
  nativeSetValue,
  sleep,
} from '../../../shared';
import { scopedDataTest } from './dataTest';

interface ParsedMonthYear {
  /** 1-12 */
  month: number;
  year: number;
}

/**
 * Parse une saisie 'MM/YYYY' (ou 'DD/MM/YYYY') en {month, year}.
 * Le picker SmartRecruiters (plugin flatpickr monthSelect) ne gere que mois+annee.
 */
function parseMonthYear(value: string): ParsedMonthYear | null {
  const parts = value
    .trim()
    .split(/[/\-.]/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return null;

  const [monthStr, yearStr] = parts.length >= 3 ? [parts[1], parts[2]] : [parts[0], parts[1]];
  const month = Number.parseInt(monthStr, 10);
  const year = Number.parseInt(yearStr, 10);

  if (!Number.isInteger(month) || !Number.isInteger(year)) return null;
  if (month < 1 || month > 12) return null;

  return { month, year };
}

/** Attend que le calendrier flatpickr (ouvert) soit present dans le DOM. */
async function waitForOpenCalendar(scope: ParentNode, attempts = 15): Promise<Element | null> {
  for (let i = 0; i < attempts; i += 1) {
    const calendar =
      deepQuery('.flatpickr-calendar.open', scope) ?? deepQuery('.flatpickr-calendar.open');
    if (calendar) return calendar;
    await sleep(60);
  }
  return null;
}

/** Ouvre le calendrier attache a l'input (clic + espace, au cas ou l'un des deux echoue). */
async function openCalendar(
  nativeInput: HTMLInputElement,
  dateField: Element
): Promise<Element | null> {
  try {
    nativeInput.scrollIntoView({ block: 'center', inline: 'nearest' });
  } catch {
    // no-op
  }

  try {
    nativeInput.click();
    nativeInput.focus();
  } catch {
    // no-op
  }

  let calendar = await waitForOpenCalendar(dateField, 8);

  if (!calendar) {
    // Certaines variantes n'ouvrent le picker qu'au clavier (cf. aria-description).
    keyboard(nativeInput, ' ');
    calendar = await waitForOpenCalendar(dateField, 8);
  }

  return calendar;
}

/** Pose l'annee courante du calendrier via son input numerique dedie. */
async function setCalendarYear(calendar: Element, year: number): Promise<boolean> {
  const yearInput = deepQuery('input.cur-year', calendar) as HTMLInputElement | null;
  if (!yearInput) return false;

  if (Number.parseInt(yearInput.value, 10) === year) return true;

  nativeSetValue(yearInput, String(year));
  dispatchAll(yearInput);
  await sleep(150);

  return true;
}

/**
 * Clique la tuile du mois voulu. La grille "monthSelect" liste toujours les
 * 12 mois dans l'ordre janvier -> decembre : on cible donc par index plutot
 * que par libelle (independant de la langue de l'interface).
 */
async function clickMonthTile(scope: ParentNode, monthIndexZeroBased: number): Promise<boolean> {
  // Re-requete a chaud : le changement d'annee peut avoir redessine la grille.
  const calendar =
    deepQuery('.flatpickr-calendar.open', scope) ?? deepQuery('.flatpickr-calendar.open');
  if (!calendar) return false;

  const tiles = deepQueryAll('.flatpickr-monthSelect-month', calendar);
  const tile = tiles[monthIndexZeroBased];
  if (!tile) return false;

  await clickElement(tile);
  await sleep(150);

  return true;
}

/**
 * Selectionne mois+annee en pilotant reellement le calendrier flatpickr
 * (plugin "monthSelect"), exactement comme le ferait un utilisateur :
 * ouverture du picker, saisie de l'annee, puis clic sur la tuile du mois.
 *
 * Important : le champ texte de ce picker est en lecture seule cote UI (cf.
 * aria-description "Appuyez sur espace pour ouvrir le selecteur") -- poser
 * une valeur texte ou une Date via une eventuelle API interne ne suffit pas
 * et peut laisser mois/jour incorrects (valeur du jour affiche non forcee,
 * desynchronisation avec l'etat interne du composant). Cliquer la vraie tuile
 * du mois est la seule methode fiable de bout en bout.
 */
async function selectMonthYearViaCalendar(
  nativeInput: HTMLInputElement,
  dateField: Element,
  parsed: ParsedMonthYear
): Promise<boolean> {
  const calendar = await openCalendar(nativeInput, dateField);
  if (!calendar) return false;

  await setCalendarYear(calendar, parsed.year);
  await sleep(80);

  return clickMonthTile(dateField, parsed.month - 1);
}

export async function setDateScoped(
  root: ParentNode,
  dataTest: string,
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;

  const wrapper = scopedDataTest(root, dataTest);
  if (!wrapper) return false;

  const dateField =
    deepQuery('spl-date-field', wrapper) ?? deepQuery('spl-date-picker', wrapper) ?? wrapper;

  const nativeInput = (deepQuery('input.flatpickr-input', dateField) ??
    deepQuery('input[type="text"]', dateField)) as HTMLInputElement | null;

  const parsed = parseMonthYear(value);

  if (nativeInput && parsed) {
    const ok = await selectMonthYearViaCalendar(nativeInput, dateField, parsed);

    if (ok) {
      dispatchAll(nativeInput);
      dispatchAll(dateField);
      dispatchAll(wrapper);
      return true;
    }

    console.warn(
      `[Autofill] Impossible de piloter le calendrier pour "${dataTest}" (valeur "${value}") : bascule sur la saisie texte directe.`
    );
  }

  // Fallback : saisie texte directe (calendrier introuvable / champ different).
  if (nativeInput) {
    nativeSetValue(nativeInput, '');
    await sleep(50);
    nativeSetValue(nativeInput, value);
    dispatchAll(nativeInput);
  }

  try {
    (dateField as unknown as { value: string }).value = value;
  } catch {
    // no-op
  }

  try {
    dateField.setAttribute('value', value);
  } catch {
    // no-op
  }

  dispatchAll(dateField);
  dispatchAll(wrapper);

  return true;
}

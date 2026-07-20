import { deepQuery, dispatchAll, nativeSetValue, sleep } from '../../../shared';
import { scopedDataTest } from './dataTest';

/** Instance flatpickr minimale, telle qu'attachee par la lib sur l'input natif. */
interface FlatpickrLike {
  setDate: (date: Date | string, triggerChange?: boolean, format?: string) => void;
}

function getFlatpickrInstance(input: HTMLInputElement | null): FlatpickrLike | null {
  const fp = (input as unknown as { _flatpickr?: FlatpickrLike } | null)?._flatpickr;
  return fp && typeof fp.setDate === 'function' ? fp : null;
}

/**
 * Parse une saisie 'MM/YYYY' (ou 'DD/MM/YYYY') en Date, jour force a 1.
 * Le picker SmartRecruiters (plugin flatpickr monthSelect) ne gere que mois+annee.
 */
function parseMonthYear(value: string): Date | null {
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

  return new Date(year, month - 1, 1);
}

/**
 * Les champs date SmartRecruiters utilisent flatpickr avec le plugin
 * "monthSelect" : le champ texte n'est qu'un affichage (lecture au clavier
 * desactivee, cf. aria-description "Appuyez sur espace pour ouvrir le
 * selecteur"). Simuler une saisie clavier dans l'input ne met donc pas a jour
 * l'etat interne du picker (selectedDates) : la valeur affichee peut sembler
 * correcte un instant puis etre ecrasee/videe, ou etre ignoree a la sauvegarde.
 * On passe donc par l'API flatpickr (`_flatpickr.setDate`) attachee sur
 * l'input natif, qui est la seule facon fiable de selectionner reellement un
 * mois/annee (equivalent a cliquer la tuile du mois dans le calendrier).
 */
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

  if (nativeInput) {
    try {
      nativeInput.scrollIntoView({ block: 'center', inline: 'nearest' });
      nativeInput.click();
      nativeInput.focus();
    } catch {
      // no-op
    }

    await sleep(80);

    const fp = getFlatpickrInstance(nativeInput);
    const parsedDate = parseMonthYear(value);

    if (fp && parsedDate) {
      fp.setDate(parsedDate, true);
      await sleep(80);

      try {
        nativeInput.blur();
      } catch {
        // no-op
      }

      dispatchAll(nativeInput);
      dispatchAll(dateField);
      dispatchAll(wrapper);

      return true;
    }

    // Fallback si aucune instance flatpickr n'est trouvee (ex. champ different).
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

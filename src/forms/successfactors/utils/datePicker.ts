import { deepQuery, dispatchAll, keyboard, nativeSetValue, sleep } from '../../../shared';
import { equalsLabel, matchesLabel, type LabelSynonyms } from './labels';
import { elementsInRange, type DomRange } from './sections';

/**
 * Dates SuccessFactors : composant custom UI5
 * <ui5-date-picker-xweb-calendar-widget title="From" value="MM/DD/YYYY" ...>
 * dont l'input reel (.ui5-input-inner) vit dans un shadow DOM. On ecrit dans
 * l'input interne puis on valide par Enter ; en secours on pose value
 * directement sur le composant hote.
 */

const DATE_WIDGET_SELECTOR = '[data-testid="datePicker"], ui5-date-picker-xweb-calendar-widget';

interface DateWidgetElement extends HTMLElement {
  value?: string;
}

export function findDatePicker(
  synonyms: LabelSynonyms,
  range?: DomRange | null
): DateWidgetElement | null {
  const widgets = [...document.querySelectorAll<DateWidgetElement>(DATE_WIDGET_SELECTOR)].filter(
    (el) =>
      equalsLabel(el.getAttribute('title'), synonyms) ||
      equalsLabel(el.getAttribute('accessible-name'), synonyms) ||
      matchesLabel(el.getAttribute('title'), synonyms)
  );

  if (!range) return widgets[0] ?? null;
  return elementsInRange(widgets, range)[0] ?? null;
}

export async function setDatePicker(
  synonyms: LabelSynonyms,
  value: string | undefined,
  range?: DomRange | null
): Promise<boolean> {
  if (value === undefined) return true;

  const widget = findDatePicker(synonyms, range);

  if (!widget) {
    console.warn('[Autofill] Date picker introuvable :', synonyms[0]);
    return false;
  }

  try {
    widget.scrollIntoView({ block: 'center', inline: 'nearest' });
  } catch {
    // no-op
  }

  // 1) Input interne (shadow DOM ouvert des composants UI5).
  const inner = deepQuery('input.ui5-input-inner, input[inner-input]', widget);

  if (inner instanceof HTMLInputElement) {
    try {
      inner.focus();
    } catch {
      // no-op
    }

    await sleep(80);
    nativeSetValue(inner, value);
    keyboard(inner, 'Enter');
    await sleep(120);

    try {
      inner.blur();
    } catch {
      // no-op
    }

    dispatchAll(widget);
    console.log(`[Autofill] Date ${synonyms[0]} ->`, value);
    return true;
  }

  // 2) Fallback : propriete/attribut value du composant hote.
  try {
    widget.value = value;
    widget.setAttribute('value', value);
    dispatchAll(widget);
    console.log(`[Autofill] Date ${synonyms[0]} (fallback attribut) ->`, value);
    return true;
  } catch {
    console.warn('[Autofill] Impossible de poser la date :', synonyms[0]);
    return false;
  }
}

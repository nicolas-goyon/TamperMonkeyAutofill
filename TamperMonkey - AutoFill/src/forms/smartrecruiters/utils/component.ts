import { deepQuery, dispatchAll, humanTypeIntoFocusable, nativeSetValue, openShadowRoot } from '../../../shared';
import type { SplComponentElement } from '../types';

const COMPONENT_SELECTOR = 'spl-input, spl-textarea, spl-autocomplete, spl-phone-field, spl-select';

export function getAutocompleteHost(container: Element | null): Element | null {
  if (!container) return null;
  if (container.matches?.('spl-autocomplete')) return container;
  return deepQuery('spl-autocomplete', container);
}

export function getNativeInputFromComponent(
  component: Element | null
): HTMLInputElement | HTMLTextAreaElement | null {
  if (!component) return null;

  return (
    (deepQuery('input:not([type="file"]), textarea', component) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null) ??
    (deepQuery(
      'input:not([type="file"]), textarea',
      component.shadowRoot ?? component
    ) as HTMLInputElement | HTMLTextAreaElement | null)
  );
}

/**
 * Pose une valeur sur un composant web SmartRecruiters (spl-input,
 * spl-textarea, spl-select, ...) en essayant plusieurs strategies dans
 * l'ordre : shadow DOM ouvert, light DOM, puis saisie "humaine" en dernier
 * recours.
 */
export async function setComponentValue(
  componentOrContainer: Element | null,
  value: string
): Promise<boolean> {
  if (!componentOrContainer) return false;

  const component = componentOrContainer.matches?.(COMPONENT_SELECTOR)
    ? componentOrContainer
    : deepQuery(COMPONENT_SELECTOR, componentOrContainer);

  const target = (component ?? componentOrContainer) as SplComponentElement;

  // 1) Strategie shadow DOM ouvert.
  const shadow = openShadowRoot(target);
  if (shadow) {
    const inner = deepQuery('input:not([type="file"]), textarea', shadow) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;

    if (inner) {
      inner.focus();
      nativeSetValue(inner, value);

      try {
        target.value = value;
      } catch {
        // no-op
      }

      try {
        target.setAttribute('value', value);
      } catch {
        // no-op
      }

      dispatchAll(target);
      return true;
    }
  }

  // 2) Strategie light DOM si le composant contient un input hors shadow DOM.
  const lightInput = deepQuery('input:not([type="file"]), textarea', target) as
    | HTMLInputElement
    | HTMLTextAreaElement
    | null;

  if (lightInput) {
    lightInput.focus();
    nativeSetValue(lightInput, value);

    try {
      target.value = value;
    } catch {
      // no-op
    }

    dispatchAll(target);
    return true;
  }

  // 3) Strategie fallback : agir comme une saisie utilisateur.
  const humanOk = await humanTypeIntoFocusable(target, value);

  try {
    target.value = value;
  } catch {
    // no-op
  }

  try {
    target.setAttribute('value', value);
  } catch {
    // no-op
  }

  dispatchAll(target);
  return humanOk;
}

import { deepQueryAll, norm, textOf } from '../../../shared';

/** Entoure en rouge les champs invalides restants, pour verification visuelle avant envoi. */
export function markInvalids(): number {
  const invalids = deepQueryAll('[aria-invalid="true"], .ng-invalid');
  console.log('Invalid Elements');
  console.log(invalids);

  for (const el of invalids) {
    if (el instanceof HTMLElement) {
      el.style.outline = '2px solid #d00000';
      el.style.outlineOffset = '2px';
    }
  }

  return invalids.length;
}

export interface ShadowRootDebugEntry {
  tag: string;
  id: string;
  dataTest: string;
  hasShadowRoot: boolean;
  text: string;
}

export function debugShadowRoots(): ShadowRootDebugEntry[] {
  const spl = [
    ...document.querySelectorAll(
      'spl-input, spl-select, spl-phone-field, spl-textarea, spl-autocomplete'
    ),
  ];

  const summary = spl.map((el) => ({
    tag: el.tagName.toLowerCase(),
    id: el.id || '',
    dataTest: el.getAttribute('data-test') || '',
    hasShadowRoot: Boolean(el.shadowRoot),
    text: norm(textOf(el)).slice(0, 80),
  }));

  console.table(summary);
  return summary;
}

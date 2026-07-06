import { getRootWindow } from './root';
import { dispatchAll, eventOpts } from './events';
import { sleep } from '../async';

/**
 * Pose une valeur sur un input/textarea en passant par le setter natif du
 * prototype (contourne les setters overrides par React/Angular) puis
 * declenche les evenements DOM habituels.
 */
export function nativeSetValue(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  value: string
): boolean {
  if (!el) return false;

  const W = getRootWindow();
  const proto =
    el instanceof W.HTMLTextAreaElement
      ? W.HTMLTextAreaElement.prototype
      : W.HTMLInputElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

  try {
    if (descriptor?.set) descriptor.set.call(el, value);
    else el.value = value;
  } catch {
    el.value = value;
  }

  dispatchAll(el);
  return true;
}

/**
 * Fallback "saisie humaine" : focus + selectAll + insertText via
 * execCommand. Utile pour les champs qui n'exposent pas d'input natif
 * facilement accessible.
 */
export async function humanTypeIntoFocusable(
  target: HTMLElement | null,
  value: string
): Promise<boolean> {
  if (!target) return false;
  const W = getRootWindow();

  try {
    target.scrollIntoView({ block: 'center', inline: 'nearest' });
  } catch {
    // no-op
  }

  try {
    target.click();
  } catch {
    // no-op
  }

  try {
    target.focus();
  } catch {
    // no-op
  }

  await sleep(80);

  try {
    W.document.execCommand('selectAll', false);
    await sleep(30);
    const ok = W.document.execCommand('insertText', false, value);
    dispatchAll(target);
    if (ok) return true;
  } catch {
    // no-op
  }

  return false;
}

export async function clickElement(el: Element | null): Promise<boolean> {
  if (!el) return false;
  const W = getRootWindow();

  try {
    (el as HTMLElement).scrollIntoView({ block: 'center', inline: 'nearest' });
  } catch {
    // no-op
  }

  await sleep(80);

  try {
    (el as HTMLElement).click();
  } catch {
    // no-op
  }

  try {
    el.dispatchEvent(new W.MouseEvent('mousedown', eventOpts()));
    el.dispatchEvent(new W.MouseEvent('mouseup', eventOpts()));
    el.dispatchEvent(new W.MouseEvent('click', eventOpts()));
  } catch {
    // no-op
  }

  dispatchAll(el);
  return true;
}

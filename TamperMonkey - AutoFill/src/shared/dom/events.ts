import { getRootWindow } from './root';

export function eventOpts(): EventInit {
  return { bubbles: true, cancelable: true, composed: true };
}

export function makeEvent(type: string, extra: { data?: string | null } = {}): Event {
  const W = getRootWindow();

  try {
    if (type === 'input' && 'InputEvent' in W) {
      return new (W as unknown as { InputEvent: typeof InputEvent }).InputEvent('input', {
        ...eventOpts(),
        inputType: 'insertText',
        data: extra.data ?? null,
      });
    }
    return new W.Event(type, eventOpts());
  } catch {
    return new Event(type, eventOpts());
  }
}

const DISPATCHED_EVENT_TYPES = [
  'focus',
  'keydown',
  'keypress',
  'beforeinput',
  'input',
  'keyup',
  'change',
  'blur',
] as const;

/**
 * Declenche une salve d'evenements DOM/clavier "comme un vrai utilisateur",
 * necessaire pour que les frameworks reactifs (Angular, etc.) prennent en
 * compte une valeur posee programmatiquement.
 */
export function dispatchAll(el: Element | null | undefined): void {
  if (!el) return;

  for (const type of DISPATCHED_EVENT_TYPES) {
    try {
      el.dispatchEvent(makeEvent(type));
    } catch {
      try {
        el.dispatchEvent(new Event(type, eventOpts()));
      } catch {
        // no-op
      }
    }
  }
}

export function keyboard(el: Element | null, key: string): void {
  if (!el) return;
  const W = getRootWindow();

  for (const type of ['keydown', 'keyup']) {
    try {
      el.dispatchEvent(
        new W.KeyboardEvent(type, {
          ...eventOpts(),
          key,
          code: key,
        })
      );
    } catch {
      // no-op
    }
  }
}

export function openShadowRoot(el: Element | null | undefined): ShadowRoot | null {
  try {
    return el?.shadowRoot ?? null;
  } catch {
    return null;
  }
}

/**
 * querySelectorAll "profond" : traverse aussi les shadow roots ouverts,
 * recursivement. Indispensable sur les composants web (spl-*) utilises par
 * SmartRecruiters, qui encapsulent leurs inputs natifs dans un shadow DOM.
 */
export function deepQueryAll(selector: string, root: ParentNode = document): Element[] {
  const results = new Set<Element>();
  const visited = new Set<Node>();

  function scan(node: Node | null): void {
    if (!node || visited.has(node)) return;
    visited.add(node);

    const el = node as Element;

    try {
      if (el.matches?.(selector)) {
        results.add(el);
      }
    } catch {
      // no-op
    }

    try {
      if (el.querySelectorAll) {
        for (const found of el.querySelectorAll(selector)) {
          results.add(found);
        }
      }
    } catch {
      // no-op
    }

    // Tres important : scanner le shadowRoot du node lui-meme.
    try {
      if (el.shadowRoot) {
        scan(el.shadowRoot);
      }
    } catch {
      // no-op
    }

    let children: Element[] = [];
    try {
      children = el.children ? [...el.children] : [];
    } catch {
      children = [];
    }

    for (const child of children) {
      scan(child);
    }

    // Scanner aussi les descendants pour attraper leurs shadowRoot.
    try {
      if (el.querySelectorAll) {
        for (const child of el.querySelectorAll('*')) {
          try {
            if (child.shadowRoot) scan(child.shadowRoot);
          } catch {
            // no-op
          }
        }
      }
    } catch {
      // no-op
    }
  }

  scan(root as unknown as Node);
  return [...results];
}

export function deepQuery(selector: string, root: ParentNode = document): Element | null {
  return deepQueryAll(selector, root)[0] ?? null;
}

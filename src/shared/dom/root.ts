/**
 * Renvoie la "vraie" fenetre de la page (unsafeWindow si disponible), pour
 * pouvoir instancier des Event/InputEvent reconnus par le code de la page
 * (utile quand la page a son propre realm JS distinct du sandbox userscript).
 */
export function getRootWindow(): Window & typeof globalThis {
  return typeof unsafeWindow !== 'undefined' && unsafeWindow ? unsafeWindow : window;
}

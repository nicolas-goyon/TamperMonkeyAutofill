export {};

declare global {
  /**
   * Fourni par Tampermonkey/Greasemonkey via @grant unsafeWindow.
   * Absent hors contexte userscript, d'ou le typage optionnel.
   */
  const unsafeWindow: (Window & typeof globalThis) | undefined;
}

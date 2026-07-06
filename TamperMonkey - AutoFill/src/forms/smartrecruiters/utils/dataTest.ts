import { deepQuery } from '../../../shared';

export function findByDataTest(dataTest: string): Element | null {
  return deepQuery(`[data-test="${CSS.escape(dataTest)}"]`);
}

/** Recherche un [data-test] a l'interieur d'un formulaire/bloc donne. */
export function scopedDataTest(root: ParentNode, dataTest: string): Element | null {
  const escaped = CSS.escape(dataTest);

  return (
    (root as Element).querySelector?.(`[data-test="${escaped}"]`) ??
    deepQuery(`[data-test="${escaped}"]`, root)
  );
}

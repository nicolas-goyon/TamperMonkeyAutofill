import { matchesLabel, type LabelSynonyms } from './labels';

/**
 * Le formulaire Talentsoft decoupe l'etape en <fieldset class="Section
 * SectionN"> avec un <legend class="tc_formTitle"> pour titre. Contrairement
 * a SuccessFactors, ce sont de VRAIS conteneurs DOM (pas des bornes
 * virtuelles), donc `section.querySelector(...)` suffit pour chercher a
 * l'interieur.
 */
export function findSection(synonyms: LabelSynonyms, root: ParentNode = document): HTMLElement | null {
  const sections = [...root.querySelectorAll<HTMLElement>('fieldset.Section')];

  for (const section of sections) {
    // Le <legend> du titre de section (classe tc_formTitle) n'est pas
    // toujours un enfant DIRECT du fieldset (wrapper intermediaire selon les
    // sites) : on le cherche dans tout le sous-arbre, en s'appuyant sur sa
    // classe pour ne pas matcher les <legend> de champs (radio, checkbox...)
    // qui portent seulement tc_formLabel.
    const legend = section.querySelector('legend.tc_formTitle');
    if (legend && matchesLabel(legend.textContent, synonyms)) return section;
  }

  console.warn('[Autofill] Section introuvable :', synonyms[0]);
  return null;
}

/**
 * Un bloc repetable (Experience, Formation, Competences, Langues) est porte
 * par un lien "ajouter" dont l'id suit le motif `addRowFor_{fieldId}`.
 * {fieldId} est propre a chaque site Talentsoft : on ne le connait donc
 * qu'en le lisant dans le DOM, jamais en le codant en dur.
 *
 * Strategie : chercher, DANS le perimetre donne (section ou document), le
 * lien "ajouter" dont le libelle porte (son propre label, ou a defaut le
 * <legend> de la Section englobante) matche les synonymes fournis.
 */
export function findDatasetFieldId(synonyms: LabelSynonyms, scope: ParentNode = document): string | null {
  const addLinks = [...scope.querySelectorAll<HTMLAnchorElement>('a[id^="addRowFor_"]')];

  for (const link of addLinks) {
    const fieldId = link.id.replace('addRowFor_', '');
    if (!fieldId) continue;

    const ownLabel = document.getElementById(`${fieldId}-label`);
    if (ownLabel && matchesLabel(ownLabel.textContent, synonyms)) return fieldId;

    const section = link.closest('fieldset.Section');
    const legend = section?.querySelector('legend.tc_formTitle');
    if (legend && matchesLabel(legend.textContent, synonyms)) return fieldId;
  }

  console.warn('[Autofill] Bloc repetable introuvable :', synonyms[0]);
  return null;
}

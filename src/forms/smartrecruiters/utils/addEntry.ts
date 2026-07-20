import { clickElement, sleep } from '../../../shared';
import { findByDataTest } from './dataTest';

/**
 * Clique sur le bouton "Ajouter" (ex. add-experience / add-education) autant
 * de fois que necessaire pour obtenir au moins `desiredCount` formulaires
 * d'edition ouverts (ex. experience-edit-form / education-edit-form), afin de
 * ne plus avoir a cliquer manuellement avant de lancer le remplissage.
 *
 * Les entrees deja enregistrees (mode lecture, sans "-edit-form" ouvert) ne
 * sont pas comptees : on ne cible que les blocs vides ajoutes pour l'autofill.
 */
export async function ensureEditFormCount(
  addButtonDataTest: string,
  editFormDataTest: string,
  desiredCount: number
): Promise<void> {
  if (!desiredCount || desiredCount <= 0) return;

  const countOpenForms = (): number =>
    document.querySelectorAll(`[data-test="${editFormDataTest}"]`).length;

  const maxAttempts = desiredCount + 10; // marge si le DOM met du temps a reagir

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const currentCount = countOpenForms();
    if (currentCount >= desiredCount) return;

    const addButton = findByDataTest(addButtonDataTest);
    if (!addButton) {
      console.warn(
        `[Autofill] Bouton "${addButtonDataTest}" introuvable, impossible d'ajouter d'autres blocs.`
      );
      return;
    }

    await clickElement(addButton);
    await sleep(500);

    if (countOpenForms() <= currentCount) {
      // Le clic n'a pas ajoute de formulaire (ex. delai plus long) : on laisse
      // un peu plus de temps avant le prochain essai.
      await sleep(300);
    }
  }

  const finalCount = countOpenForms();
  if (finalCount < desiredCount) {
    console.warn(
      `[Autofill] Seulement ${finalCount}/${desiredCount} blocs "${editFormDataTest}" ouverts apres plusieurs clics sur "${addButtonDataTest}".`
    );
  }
}

import { createNotifier, sleep } from '../../../shared';
import { fillProfile } from './fillProfile';
import { fillExperiences } from './fillExperience';
import { fillEducations } from './fillEducation';
import { fillLanguages } from './fillLanguages';
import { fillMisc } from './fillMisc';
import type { SuccessFactorsConfig } from '../types';

export const notify = createNotifier({ id: 'sf-autofill-status' });

/**
 * Compte les champs obligatoires encore vides (champs texte aria-required et
 * combos restes sur leur placeholder), pour le message de fin.
 */
function countMissingRequired(): number {
  let missing = 0;

  for (const input of document.querySelectorAll<HTMLInputElement>(
    'input[data-testid="sfTextField"][aria-required="true"]'
  )) {
    if (!input.value.trim()) missing++;
  }

  for (const combo of document.querySelectorAll<HTMLInputElement>(
    'input.rcmpaginatedselectinput[aria-required="true"]'
  )) {
    if (!combo.value.trim() && !combo.getAttribute('title')?.trim()) missing++;
  }

  return missing;
}

export async function fillAll(config: SuccessFactorsConfig): Promise<void> {
  notify('Preremplissage en cours...');

  await fillProfile(config.profile);
  await sleep(500);

  const nbExp = await fillExperiences(config.experiences);
  await sleep(500);

  const nbEdu = await fillEducations(config.educations);
  await sleep(500);

  const nbLang = await fillLanguages(config.languages);
  await sleep(500);

  await fillMisc(config);
  await sleep(300);

  const missing = countMissingRequired();

  notify(
    `Preremplissage termine (${nbExp} exp., ${nbEdu} form., ${nbLang} langues). ` +
      `Champs obligatoires encore vides : ${missing}. Verifie tout avant d'envoyer — ` +
      `rien n'est soumis automatiquement.`
  );
}

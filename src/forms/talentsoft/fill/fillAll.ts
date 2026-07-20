import { createNotifier, sleep } from '../../../shared';
import { fillProfile } from './fillProfile';
import { fillExperiences } from './fillExperience';
import { fillEducations } from './fillEducation';
import { fillSkills } from './fillSkills';
import { fillLanguages } from './fillLanguages';
import { fillMisc } from './fillMisc';
import type { TalentsoftConfig } from '../types';

export const notify = createNotifier({ id: 'ts-autofill-status' });

/**
 * Les input[type=file] ne peuvent pas etre remplis par script (restriction
 * navigateur) : on liste ceux restes vides pour rappeler a l'utilisateur de
 * les joindre a la main.
 */
function emptyFileFields(): string[] {
  const missing: string[] = [];

  for (const input of document.querySelectorAll<HTMLInputElement>('input[type="file"]')) {
    if (input.files && input.files.length > 0) continue;
    const label = document.querySelector(`label[for="${input.id}"]`);
    missing.push(label?.textContent?.replace('*', '').trim() || input.id);
  }

  return missing;
}

export async function fillAll(config: TalentsoftConfig): Promise<void> {
  notify('Preremplissage en cours...');

  await fillProfile(config.profile);
  await sleep(400);

  const nbExp = await fillExperiences(config.experiences);
  await sleep(400);

  const nbEdu = await fillEducations(config.educations);
  await sleep(400);

  const nbSkills = await fillSkills(config.skills);
  await sleep(400);

  const nbLang = await fillLanguages(config.languages);
  await sleep(400);

  await fillMisc(config);
  await sleep(300);

  const missingFiles = emptyFileFields();

  notify(
    `Preremplissage termine (${nbExp} exp., ${nbEdu} formations, ${nbSkills} competences, ${nbLang} langues). ` +
      (missingFiles.length
        ? `A joindre a la main (le navigateur bloque le remplissage automatique des fichiers) : ${missingFiles.join(', ')}. `
        : '') +
      "Verifie tout avant d'envoyer — rien n'est soumis automatiquement."
  );
}

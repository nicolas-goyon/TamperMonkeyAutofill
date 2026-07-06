import { createNotifier, sleep } from '../../../shared';
import { debugShadowRoots, markInvalids } from '../utils/debug';
import { fillTextFields } from './fillTextFields';
import { fillVisibleEducationForms } from './fillEducation';
import { fillVisibleExperienceForms } from './fillExperience';
import type { SmartRecruitersConfig } from '../types';

export const notify = createNotifier({ id: 'sr-autofill-status' });

export async function fillAll(config: SmartRecruitersConfig): Promise<void> {
  notify('Preremplissage en cours...');

  const saveAfterFill = Boolean(config.saveAfterExperienceEducationFill);

  await fillTextFields(config.profile);
  await sleep(500);
  await fillVisibleEducationForms(config.educations, saveAfterFill);
  await sleep(500);
  await fillVisibleExperienceForms(config.experiences, saveAfterFill);
  await sleep(500);

  const invalidCount = markInvalids();

  notify(
    `Preremplissage termine. Champs encore invalides detectes : ${invalidCount}. Verifie les champs entoures en rouge avant d'envoyer.`
  );

  console.log('[Autofill] Diagnostic shadow roots :');
  debugShadowRoots();
}

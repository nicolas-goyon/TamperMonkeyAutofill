import { setFieldByDataTest } from '../utils/field';
import { fillPersonalLocationAutocomplete } from '../utils/location';
import { fillPhoneField } from '../utils/phone';
import type { SmartRecruitersProfile } from '../types';

export async function fillTextFields(profile: SmartRecruitersProfile): Promise<void> {
  await setFieldByDataTest('personal-info-first-name-input', profile.firstName);
  await setFieldByDataTest('personal-info-last-name-input', profile.lastName);
  await setFieldByDataTest('personal-info-email-input', profile.email);
  await setFieldByDataTest('personal-info-email-confirm-input', profile.email);

  // Ville / pays.
  await fillPersonalLocationAutocomplete(profile);

  // Telephone : composant special.
  await fillPhoneField(profile);

  // Liens web : les data-test peuvent varier selon l'etape.
  if (profile.linkedIn) {
    await setFieldByDataTest('web-profiles-linkedin', profile.linkedIn);
  }

  const website = profile.website ?? profile.github;
  if (website) {
    await setFieldByDataTest('web-profiles-website', website);
  }

  // Message au recruteur.
  if (profile.hiringMessage) {
    await setFieldByDataTest('hiring-manager-message-text', profile.hiringMessage);
  }
}

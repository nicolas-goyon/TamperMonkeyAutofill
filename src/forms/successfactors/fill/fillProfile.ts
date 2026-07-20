import { sleep } from '../../../shared';
import { COMBO_TITLES, FIELD_LABELS, SECTION_LABELS } from '../utils/labels';
import { findSection } from '../utils/sections';
import { setTextField } from '../utils/fields';
import { setComboByLabel } from '../utils/paginatedSelect';
import type { SuccessFactorsProfile } from '../types';

/** Section "Profile Information" : identite, contact, adresse, combos. */
export async function fillProfile(profile: SuccessFactorsProfile): Promise<void> {
  const section = findSection(SECTION_LABELS.profile);

  await setTextField(FIELD_LABELS.firstName, profile.firstName, section);
  await setTextField(FIELD_LABELS.lastName, profile.lastName, section);
  await setTextField(FIELD_LABELS.email, profile.email, section);
  await setTextField(FIELD_LABELS.phone, profile.phone, section);
  await setTextField(FIELD_LABELS.address1, profile.address1, section);
  await setTextField(FIELD_LABELS.address2, profile.address2, section);
  await setTextField(FIELD_LABELS.city, profile.city, section);
  await setTextField(FIELD_LABELS.stateProvince, profile.stateProvince, section);
  await setTextField(FIELD_LABELS.zip, profile.zip, section);

  await setComboByLabel(COMBO_TITLES.gender, profile.gender, section);
  await sleep(200);
  await setComboByLabel(COMBO_TITLES.civility, profile.title, section);
  await sleep(200);
  await setComboByLabel(COMBO_TITLES.country, profile.country, section);
  await sleep(200);
  await setComboByLabel(COMBO_TITLES.nationality, profile.nationality, section);
  await sleep(200);
  await setComboByLabel(COMBO_TITLES.preferredContact, profile.preferredContact, section);
}

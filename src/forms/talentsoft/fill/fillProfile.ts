import { sleep } from '../../../shared';
import { FIELD_LABELS, SECTION_LABELS } from '../utils/labels';
import { findSection } from '../utils/containers';
import { setTextField } from '../utils/fields';
import { setRadioGroupByLabel } from '../utils/radio';
import { setNativeSelectByLabel } from '../utils/select';
import { addSelect2Values, setSelect2ByLabel } from '../utils/select2';
import type { TalentsoftProfile } from '../types';

/** Section "Informations personnelles" : civilite, identite, e-mail, pays. */
async function fillPersonalInfo(profile: TalentsoftProfile): Promise<void> {
  const section = findSection(SECTION_LABELS.personal) ?? document;

  await setRadioGroupByLabel(FIELD_LABELS.gender, profile.gender, section);
  await setTextField(FIELD_LABELS.firstName, profile.firstName, section);
  await setTextField(FIELD_LABELS.lastName, profile.lastName, section);
  await setTextField(FIELD_LABELS.email, profile.email, section);
  await sleep(200);
  await setSelect2ByLabel(FIELD_LABELS.addressCountry, profile.country, section);
}

/** Section "Ajouter des fichiers" : ne contient pas que des fichiers, aussi le combo handicap. */
async function fillDisability(profile: TalentsoftProfile): Promise<void> {
  if (profile.hasDisability === undefined) return;

  const section = findSection(SECTION_LABELS.files) ?? document;
  await setNativeSelectByLabel(FIELD_LABELS.disability, profile.hasDisability ? 'Oui' : 'Non', section);
}

/** Section "Parcours professionnel" : experience totale + experience internationale. */
async function fillExperienceSummary(profile: TalentsoftProfile): Promise<void> {
  const section = findSection(SECTION_LABELS.professionalBackground) ?? document;

  await setNativeSelectByLabel(FIELD_LABELS.yearsOfExperience, profile.yearsOfExperience, section);
  await sleep(200);

  if (!profile.hasInternationalExperience) return;

  // Le combo "Expérience internationale" n'a qu'une seule option reelle
  // ('Oui') : le cocher revele le picker multi-pays qui suit.
  await setSelect2ByLabel(FIELD_LABELS.internationalExperience, 'Oui', section);
  await sleep(500);
  await addSelect2Values(
    FIELD_LABELS.internationalExperienceCountries,
    profile.internationalExperienceCountries,
    section
  );
}

export async function fillProfile(profile: TalentsoftProfile): Promise<void> {
  await fillPersonalInfo(profile);
  await sleep(300);
  await fillDisability(profile);
  await sleep(300);
  await fillExperienceSummary(profile);
}

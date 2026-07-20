import { sleep } from '../../../shared';
import { FIELD_LABELS, SECTION_LABELS } from '../utils/labels';
import { findSection } from '../utils/containers';
import { setTextField } from '../utils/fields';
import { setNativeSelectValue } from '../utils/select';
import { setSelect2ByLabel } from '../utils/select2';
import { setCheckboxByLabel } from '../utils/checkbox';
import type { TalentsoftConfig } from '../types';

/**
 * "Langue préférée pour les futurs contacts" : sur ce site, le <label> du
 * champ lui-meme est vide (le texte n'existe que comme titre de Section).
 * On retombe donc sur le premier select NATIF (pas select2) de cette
 * section, qui precede toujours le combo "Comment avez-vous entendu
 * parler..." (celui-la est select2, donc exclu par :not(.AutoCompleteField)).
 */
async function fillPreferredContactLanguage(value: string | undefined): Promise<void> {
  if (value === undefined) return;

  const section = findSection(SECTION_LABELS.contact);
  const select = section?.querySelector<HTMLSelectElement>(
    'select.SelectFormField:not(.AutoCompleteField):not(.WizardFieldHidden)'
  );

  if (!select) {
    console.warn('[Autofill] Combo "langue preferee pour les futurs contacts" introuvable.');
    return;
  }

  const ok = setNativeSelectValue(select, value);
  console.log('[Autofill] Langue preferee ->', ok ? value : 'echec');
}

/** Derniere section : langue de contact, source de la candidature, consentement. */
export async function fillMisc(config: TalentsoftConfig): Promise<void> {
  await fillPreferredContactLanguage(config.preferredContactLanguage);
  await sleep(200);

  await setSelect2ByLabel(FIELD_LABELS.howDidYouHear, config.howDidYouHear);
  await sleep(500);

  // Champ conditionnel : n'apparait que si "Autre" est choisi ci-dessus.
  if (config.howDidYouHearOther !== undefined) {
    await setTextField(FIELD_LABELS.howDidYouHearOther, config.howDidYouHearOther);
  }

  await sleep(200);
  await setCheckboxByLabel(FIELD_LABELS.acceptPrivacyPolicy, config.acceptPrivacyPolicy);
}

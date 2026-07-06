import { deepQuery, deepQueryAll, dispatchAll, getRootWindow, nativeSetValue, sleep } from '../../../shared';
import type { SmartRecruitersProfile } from '../types';

/**
 * Le champ telephone SmartRecruiters (spl-phone-field) combine un
 * selecteur pays et un input, et maintient en interne une valeur
 * structuree { value, country, internationalFormat }. On renseigne les
 * trois representations pour maximiser les chances que le framework les
 * prenne en compte.
 */
export async function fillPhoneField(profile: SmartRecruitersProfile): Promise<boolean> {
  const phoneField = deepQuery('spl-phone-field');

  if (!phoneField) {
    console.warn('[Autofill] spl-phone-field introuvable');
    return false;
  }

  console.log('[Autofill] spl-phone-field trouve :', phoneField);

  const countryCode = profile.phoneCountryCode ?? 'FR';

  const phoneValue = {
    value: profile.phoneDisplay,
    country: countryCode,
    internationalFormat: profile.phoneInternational,
  };

  const countrySelect =
    deepQuery('spl-select.c-spl-phone-field-select', phoneField) ??
    deepQuery('.c-spl-phone-field-select', phoneField) ??
    deepQuery('spl-select', phoneField);

  if (countrySelect) {
    try {
      (countrySelect as unknown as { value: string }).value = countryCode;
    } catch {
      // no-op
    }

    try {
      countrySelect.setAttribute('value', countryCode);
    } catch {
      // no-op
    }

    dispatchAll(countrySelect);
    console.log('[Autofill] Selecteur pays telephone trouve :', countrySelect);
  } else {
    console.warn('[Autofill] Selecteur pays telephone introuvable');
  }

  await sleep(150);

  const phoneSplInput =
    deepQuery('spl-input.c-spl-phone-field-input', phoneField) ??
    deepQuery('.c-spl-phone-field-input', phoneField);

  if (!phoneSplInput) {
    console.warn('[Autofill] spl-input.c-spl-phone-field-input introuvable');
    console.log(
      '[Autofill] Diagnostic inputs dans spl-phone-field :',
      deepQueryAll('spl-input, input', phoneField).map((el) => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        autocomplete: el.getAttribute?.('autocomplete'),
        ariaLabel: el.getAttribute?.('aria-label'),
        placeholder: el.getAttribute?.('placeholder'),
      }))
    );
    return false;
  }

  console.log('[Autofill] spl-input telephone trouve :', phoneSplInput);

  const phoneNativeInput = (deepQuery('input:not([type="file"])', phoneSplInput) ??
    deepQuery('input:not([type="file"])', phoneField)) as HTMLInputElement | null;

  if (!phoneNativeInput) {
    console.warn('[Autofill] input natif du telephone introuvable');
    return false;
  }

  console.log('[Autofill] input natif telephone trouve :', phoneNativeInput);

  const nationalPhone = profile.phoneDisplay;
  const W = getRootWindow();

  try {
    phoneNativeInput.scrollIntoView({ block: 'center', inline: 'nearest' });
  } catch {
    // no-op
  }

  try {
    phoneNativeInput.click();
    phoneNativeInput.focus();
  } catch {
    // no-op
  }

  await sleep(100);

  // Nettoyage.
  nativeSetValue(phoneNativeInput, '');
  dispatchAll(phoneNativeInput);
  dispatchAll(phoneSplInput);
  dispatchAll(phoneField);

  await sleep(80);

  // Remplissage via setter natif.
  nativeSetValue(phoneNativeInput, nationalPhone);

  await sleep(150);

  // Fallback "saisie humaine".
  try {
    phoneNativeInput.focus();
    phoneNativeInput.select?.();
    W.document.execCommand('insertText', false, nationalPhone);
  } catch {
    // no-op
  }

  await sleep(150);

  // Mettre aussi a jour le composant spl-input.
  try {
    (phoneSplInput as unknown as { value: string }).value = nationalPhone;
  } catch {
    // no-op
  }

  try {
    phoneSplInput.setAttribute('value', nationalPhone);
  } catch {
    // no-op
  }

  dispatchAll(phoneNativeInput);
  dispatchAll(phoneSplInput);

  await sleep(150);

  // Mettre a jour le composant spl-phone-field avec la valeur structuree.
  try {
    (phoneField as unknown as { value: typeof phoneValue }).value = phoneValue;
  } catch {
    // no-op
  }

  try {
    phoneField.setAttribute('value', JSON.stringify(phoneValue));
  } catch {
    // no-op
  }

  dispatchAll(phoneField);

  await sleep(200);

  console.log('[Autofill] Telephone rempli. Valeur input :', phoneNativeInput.value);
  return true;
}

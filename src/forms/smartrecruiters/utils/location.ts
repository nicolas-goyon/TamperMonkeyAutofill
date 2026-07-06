import { clickElement, deepQuery, deepQueryAll, dispatchAll, norm, sleep, textOf } from '../../../shared';
import { setAutocompleteValueAndSelect } from './autocomplete';
import { setComponentValue } from './component';
import { findByDataTest, scopedDataTest } from './dataTest';
import type { LocationFix, SmartRecruitersProfile } from '../types';

function findButtonByText(root: ParentNode, expectedText: string): Element | undefined {
  const expected = norm(expectedText);

  return deepQueryAll('button, spl-button, [role="button"]', root).find((el) =>
    norm(textOf(el)).includes(expected)
  );
}

/**
 * SmartRecruiters affiche parfois la localisation en mode "manuel" (pays +
 * ville en texte libre) avec un bouton pour basculer vers la recherche
 * autocomplete. On force cette bascule quand elle est disponible, car
 * l'autocomplete est plus fiable pour faire matcher la valeur attendue.
 */
export async function switchLocationToAutocompleteIfNeeded(
  locationWrapper: Element | null
): Promise<boolean> {
  if (!locationWrapper) return false;

  const existingAutocomplete =
    scopedDataTest(locationWrapper, 'location-autocomplete') ??
    deepQuery('spl-autocomplete[data-test="location-autocomplete"]', locationWrapper) ??
    deepQuery('spl-autocomplete[data-sr-id*="location-autocomplete"]', locationWrapper);

  if (existingAutocomplete) return true;

  const switchButton =
    scopedDataTest(locationWrapper, 'manual-location-switch-to-autocomplete') ??
    findButtonByText(locationWrapper, 'Utiliser la recherche') ??
    findButtonByText(locationWrapper, 'recherche');

  if (!switchButton) {
    console.warn('[Autofill] Bouton de bascule vers recherche localisation introuvable');
    return false;
  }

  await clickElement(switchButton);
  await sleep(500);

  return true;
}

export function getLocationAutocomplete(locationWrapper: Element | null): Element | null {
  if (!locationWrapper) return null;

  return (
    scopedDataTest(locationWrapper, 'location-autocomplete') ??
    deepQuery('spl-autocomplete[data-test="location-autocomplete"]', locationWrapper) ??
    deepQuery('spl-autocomplete[data-sr-id*="location-autocomplete"]', locationWrapper) ??
    deepQuery('spl-autocomplete', locationWrapper)
  );
}

export async function setLocationAutocomplete(
  locationWrapper: Element | null,
  locationValue: string
): Promise<boolean> {
  if (!locationWrapper || !locationValue) return false;

  await switchLocationToAutocompleteIfNeeded(locationWrapper);
  await sleep(300);

  const locationAutocomplete = getLocationAutocomplete(locationWrapper);

  if (!locationAutocomplete) {
    console.warn('[Autofill] Autocomplete localisation introuvable apres bascule');
    return false;
  }

  const ok = await setAutocompleteValueAndSelect(locationAutocomplete, locationValue);

  // Les autocompletes de localisation mettent parfois plus de temps a
  // propager l'objet interne.
  await sleep(500);

  dispatchAll(locationAutocomplete);
  dispatchAll(locationWrapper);

  console.log('[Autofill] Localisation autocomplete ->', ok ? 'OK' : 'tentative partielle', locationValue);

  return ok;
}

export async function fillPersonalLocationAutocomplete(
  profile: SmartRecruitersProfile
): Promise<boolean> {
  const personalLocation = findByDataTest('personal-info-location');

  if (!personalLocation) {
    console.warn('[Autofill] Bloc localisation personnelle introuvable');
    return false;
  }

  const ok = await setLocationAutocomplete(personalLocation, profile.location);

  if (ok) return true;

  // Fallback manuel, seulement si l'autocomplete echoue vraiment.
  console.warn('[Autofill] Fallback localisation personnelle en mode manuel');

  const countryField = scopedDataTest(personalLocation, 'manual-location-country');
  const cityField = scopedDataTest(personalLocation, 'manual-location-city');

  if (countryField) {
    await setAutocompleteValueAndSelect(countryField, profile.country);
  }

  if (cityField) {
    await setComponentValue(cityField, profile.city);
  }

  return Boolean(countryField || cityField);
}

export async function fillLocationScoped(
  root: ParentNode,
  locationDataTest: string,
  fix: LocationFix
): Promise<boolean> {
  const locationWrapper = scopedDataTest(root, locationDataTest);

  if (!locationWrapper) {
    console.warn(`[Autofill] Bloc localisation introuvable : ${locationDataTest}`);
    return false;
  }

  const ok = await setLocationAutocomplete(locationWrapper, fix.location);

  if (ok) return true;

  // Fallback manuel, si SmartRecruiters ne propose pas l'autocomplete sur ce
  // formulaire.
  console.warn(`[Autofill] Fallback localisation manuel pour : ${locationDataTest}`);

  const countryField = scopedDataTest(locationWrapper, 'manual-location-country');
  const cityField = scopedDataTest(locationWrapper, 'manual-location-city');

  if (countryField) {
    await setAutocompleteValueAndSelect(countryField, fix.country);
    dispatchAll(countryField);
  }

  if (cityField) {
    await setComponentValue(cityField, fix.city);
    dispatchAll(cityField);
  }

  return Boolean(countryField || cityField);
}

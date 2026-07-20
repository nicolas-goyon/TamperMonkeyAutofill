import { dispatchAll, sleep } from '../../../shared';
import { ensureEditFormCount } from '../utils/addEntry';
import { setScopedAutocompleteField } from '../utils/autocomplete';
import { setCheckboxScoped } from '../utils/checkbox';
import { setDateScoped } from '../utils/date';
import { setScopedField } from '../utils/field';
import { fillLocationScoped } from '../utils/location';
import { saveFormIfEnabled } from './save';
import type { ExperienceEntry } from '../types';

export async function fillOneExperienceFormWithFix(
  form: Element | null,
  fix: ExperienceEntry | undefined,
  saveAfterFill: boolean
): Promise<boolean> {
  if (!form || !fix) return false;

  await setScopedAutocompleteField(form, 'job-title-autocomplete', fix.title);
  await sleep(200);

  await setScopedAutocompleteField(form, 'company-autocomplete', fix.company);
  await sleep(200);

  await fillLocationScoped(form, 'experience-form-location', fix);
  await sleep(100);

  await setScopedField(form, 'experience-description', fix.description);
  await sleep(100);

  await setDateScoped(form, 'experience-date-from', fix.dateFrom);
  await sleep(100);

  await setDateScoped(form, 'experience-date-to', fix.dateTo);
  await sleep(100);

  await setCheckboxScoped(form, 'experience-current', fix.current);

  dispatchAll(form);

  console.log('[Autofill] Experience remplie par ordre :', fix.title, fix.company);

  await saveFormIfEnabled(form, 'experience-save', saveAfterFill);

  return true;
}

export async function fillVisibleExperienceForms(
  experiences: ExperienceEntry[] | undefined,
  saveAfterFill: boolean
): Promise<number> {
  await ensureEditFormCount('add-experience', 'experience-edit-form', experiences?.length ?? 0);
  await sleep(200);

  const forms = [...document.querySelectorAll('[data-test="experience-edit-form"]')];

  let count = 0;

  for (let index = 0; index < forms.length; index += 1) {
    const form = forms[index];

    // Mode formulaire blanc : on prend l'experience selon l'ordre du formulaire.
    const fix = experiences?.[index];

    if (!fix) {
      console.warn(`[Autofill] Aucune experience prevue pour le formulaire index ${index}`);
      continue;
    }

    const ok = await fillOneExperienceFormWithFix(form, fix, saveAfterFill);
    if (ok) count += 1;

    await sleep(300);
  }

  return count;
}

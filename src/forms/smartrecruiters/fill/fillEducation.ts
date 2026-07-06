import { dispatchAll, sleep } from '../../../shared';
import { setScopedAutocompleteField } from '../utils/autocomplete';
import { setCheckboxScoped } from '../utils/checkbox';
import { setDateScoped } from '../utils/date';
import { setScopedField } from '../utils/field';
import { fillLocationScoped } from '../utils/location';
import { saveFormIfEnabled } from './save';
import type { EducationEntry } from '../types';

export async function fillOneEducationFormWithFix(
  form: Element | null,
  fix: EducationEntry | undefined,
  saveAfterFill: boolean
): Promise<boolean> {
  if (!form || !fix) return false;

  await setScopedAutocompleteField(form, 'institution-autocomplete', fix.institution);
  await sleep(200);

  await setScopedField(form, 'education-major', fix.major);
  await sleep(100);

  await setScopedField(form, 'education-degree', fix.degree);
  await sleep(100);

  await fillLocationScoped(form, 'education-form-location', fix);
  await sleep(100);

  await setDateScoped(form, 'education-date-from', fix.dateFrom);
  await sleep(100);

  await setDateScoped(form, 'education-date-to', fix.dateTo);
  await sleep(100);

  await setCheckboxScoped(form, 'education-current', fix.current);

  if (fix.description) {
    await setScopedField(form, 'education-description', fix.description);
  }

  dispatchAll(form);

  console.log('[Autofill] Formation remplie par ordre :', fix.institution, fix.degree);

  await saveFormIfEnabled(form, 'education-save', saveAfterFill);

  return true;
}

export async function fillVisibleEducationForms(
  educations: EducationEntry[] | undefined,
  saveAfterFill: boolean
): Promise<number> {
  const forms = [...document.querySelectorAll('[data-test="education-edit-form"]')];

  let count = 0;

  for (let index = 0; index < forms.length; index += 1) {
    const form = forms[index];

    // Mode formulaire blanc : on prend la formation selon l'ordre du formulaire.
    const fix = educations?.[index];

    if (!fix) {
      console.warn(`[Autofill] Aucune formation prevue pour le formulaire index ${index}`);
      continue;
    }

    const ok = await fillOneEducationFormWithFix(form, fix, saveAfterFill);
    if (ok) count += 1;

    await sleep(300);
  }

  return count;
}

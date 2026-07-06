import { deepQuery, dispatchAll, nativeSetValue, sleep } from '../../../shared';
import { scopedDataTest } from './dataTest';

/** Les champs date SmartRecruiters acceptent generalement une saisie manuelle MM/YYYY. */
export async function setDateScoped(
  root: ParentNode,
  dataTest: string,
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;

  const wrapper = scopedDataTest(root, dataTest);
  if (!wrapper) return false;

  const dateField =
    deepQuery('spl-date-field', wrapper) ?? deepQuery('spl-date-picker', wrapper) ?? wrapper;

  const nativeInput = (deepQuery('input.flatpickr-input', dateField) ??
    deepQuery('input[type="text"]', dateField)) as HTMLInputElement | null;

  if (nativeInput) {
    try {
      nativeInput.scrollIntoView({ block: 'center', inline: 'nearest' });
      nativeInput.click();
      nativeInput.focus();
    } catch {
      // no-op
    }

    await sleep(80);

    nativeSetValue(nativeInput, '');
    await sleep(50);
    nativeSetValue(nativeInput, value);

    dispatchAll(nativeInput);
  }

  try {
    (dateField as unknown as { value: string }).value = value;
  } catch {
    // no-op
  }

  try {
    dateField.setAttribute('value', value);
  } catch {
    // no-op
  }

  dispatchAll(dateField);
  dispatchAll(wrapper);

  return true;
}

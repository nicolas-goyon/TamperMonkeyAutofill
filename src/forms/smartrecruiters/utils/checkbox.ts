import { clickElement, deepQuery, dispatchAll, sleep } from '../../../shared';
import { scopedDataTest } from './dataTest';

export async function setCheckboxScoped(
  root: ParentNode,
  dataTest: string,
  expectedChecked: boolean
): Promise<boolean> {
  const wrapper = scopedDataTest(root, dataTest);
  if (!wrapper) return false;

  const checkbox =
    deepQuery('spl-checkbox', wrapper) ?? deepQuery('input[type="checkbox"]', wrapper) ?? wrapper;

  const nativeInput = deepQuery('input[type="checkbox"]', checkbox) as HTMLInputElement | null;

  const checkboxAny = checkbox as unknown as { checked?: boolean; value?: string };

  const currentChecked =
    nativeInput?.checked ??
    checkboxAny.checked ??
    (checkbox.getAttribute?.('checked') === 'true' || checkbox.getAttribute?.('value') === 'true');

  if (Boolean(currentChecked) !== Boolean(expectedChecked)) {
    await clickElement(checkbox);
    await sleep(150);
  }

  try {
    checkboxAny.checked = Boolean(expectedChecked);
  } catch {
    // no-op
  }

  try {
    checkboxAny.value = String(Boolean(expectedChecked));
  } catch {
    // no-op
  }

  dispatchAll(checkbox);
  if (nativeInput) dispatchAll(nativeInput);

  return true;
}

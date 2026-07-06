import { clickElement, sleep } from '../../../shared';
import { scopedDataTest } from '../utils/dataTest';

export async function saveFormIfEnabled(
  form: ParentNode,
  saveDataTest: string,
  enabled: boolean
): Promise<boolean> {
  if (!enabled) return false;

  const save = scopedDataTest(form, saveDataTest);
  if (!save) return false;

  await sleep(250);
  await clickElement(save);

  console.log(`[Autofill] Sauvegarde demandee : ${saveDataTest}`);
  return true;
}

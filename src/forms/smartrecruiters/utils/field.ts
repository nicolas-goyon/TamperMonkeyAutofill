import { getAutocompleteHost, setComponentValue } from './component';
import { setAutocompleteValueAndSelect } from './autocomplete';
import { findByDataTest, scopedDataTest } from './dataTest';

export async function setFieldByDataTest(dataTest: string, value: string): Promise<boolean> {
  const container = findByDataTest(dataTest);

  if (!container) {
    console.warn(`[Autofill] Champ introuvable : ${dataTest}`);
    return false;
  }

  const ok = await setComponentValue(container, value);
  console.log(`[Autofill] ${dataTest} ->`, ok ? 'OK' : 'tentative partielle');
  return ok;
}

export async function setScopedField(
  root: ParentNode,
  dataTest: string,
  value: string
): Promise<boolean> {
  const field = scopedDataTest(root, dataTest);

  if (!field) {
    console.warn(`[Autofill] Champ introuvable dans le formulaire : ${dataTest}`);
    return false;
  }

  if (getAutocompleteHost(field)) {
    return setAutocompleteValueAndSelect(field, value);
  }

  return setComponentValue(field, value);
}

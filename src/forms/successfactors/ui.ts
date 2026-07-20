import { installAutofillButton, observeAndReinstallButton } from '../../shared/ui/notify';
import { fillAll, notify } from './fill/fillAll';
import type { SuccessFactorsConfig } from './types';

const BUTTON_ID = 'sf-autofill-button';

/** Installe (et reinstalle si la page le supprime) le bouton flottant. */
export function installSuccessFactorsButton(config: SuccessFactorsConfig): void {
  const install = () =>
    installAutofillButton({
      id: BUTTON_ID,
      label: config.buttonLabel ?? 'Remplir candidature',
      onClick: () => fillAll(config),
    });

  install();
  observeAndReinstallButton(install);

  notify("Bouton Tampermonkey pret. Clique sur « Remplir candidature », puis verifie avant d'envoyer.");
}

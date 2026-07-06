import { installAutofillButton, observeAndReinstallButton } from '../../shared/ui/notify';
import { fillAll, notify } from './fill/fillAll';
import type { SmartRecruitersConfig } from './types';

const BUTTON_ID = 'sr-autofill-button';

/** Installe (et reinstalle si le SPA le supprime) le bouton flottant de preremplissage. */
export function installSmartRecruitersButton(config: SmartRecruitersConfig): void {
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

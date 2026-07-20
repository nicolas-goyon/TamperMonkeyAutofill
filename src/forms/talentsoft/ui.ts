import { installAutofillButton, observeAndReinstallButton } from '../../shared/ui/notify';
import { fillAll, notify } from './fill/fillAll';
import type { TalentsoftConfig } from './types';

const BUTTON_ID = 'ts-autofill-button';

/** Installe (et reinstalle si la page le supprime) le bouton flottant. */
export function installTalentsoftButton(config: TalentsoftConfig): void {
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
